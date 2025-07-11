-- Migration: Messaging System Redesign
-- Description: Enhances messaging system with contextual linking, read tracking, and threading
-- Date: 2025-07-11

-- ======================================
-- 1. ALTER MESSAGES TABLE
-- ======================================
-- Note: We're altering the existing messages table rather than dropping it
-- to preserve existing data

-- Add new columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS sender_id TEXT,
ADD COLUMN IF NOT EXISTS context_type TEXT CHECK (context_type IN ('suggestion', 'project', 'task', 'direct', NULL)),
ADD COLUMN IF NOT EXISTS context_id TEXT,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS edited_content TEXT,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- Migrate existing userId to sender_id if needed
UPDATE messages 
SET sender_id = user_id 
WHERE sender_id IS NULL AND user_id IS NOT NULL;

-- Make sender_id NOT NULL after migration
ALTER TABLE messages 
ALTER COLUMN sender_id SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_context 
ON messages(context_type, context_id) 
WHERE context_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_deleted 
ON messages(deleted_at) 
WHERE deleted_at IS NULL;

-- Add check constraint for edited messages
ALTER TABLE messages 
ADD CONSTRAINT chk_messages_edit 
CHECK (
  (edited_at IS NULL AND edited_content IS NULL) OR 
  (edited_at IS NOT NULL AND edited_content IS NOT NULL)
);

-- ======================================
-- 2. CREATE MESSAGE_RECIPIENTS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS message_recipients (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  context_access_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure a user can only be recipient once per message
  CONSTRAINT uq_message_recipient UNIQUE(message_id, recipient_id)
);

-- Indexes for message_recipients
CREATE INDEX idx_message_recipients_unread 
ON message_recipients(recipient_id, read) 
WHERE read = FALSE;

CREATE INDEX idx_message_recipients_message 
ON message_recipients(message_id);

CREATE INDEX idx_message_recipients_recipient 
ON message_recipients(recipient_id);

-- Composite index for efficient unread counts
CREATE INDEX idx_message_recipients_unread_counts 
ON message_recipients(recipient_id, read, message_id) 
WHERE read = FALSE;

-- Index for email fallback processing
CREATE INDEX idx_message_recipients_email_pending 
ON message_recipients(recipient_id, read, email_sent_at) 
WHERE read = FALSE AND email_sent_at IS NULL;

-- ======================================
-- 3. CREATE MESSAGE_THREADS TABLE
-- ======================================
CREATE TABLE IF NOT EXISTS message_threads (
  id SERIAL PRIMARY KEY,
  root_message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  depth INTEGER NOT NULL DEFAULT 0 CHECK (depth >= 0),
  path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure each message only appears once in threads
  CONSTRAINT uq_message_thread UNIQUE(message_id)
);

-- Indexes for efficient thread queries
CREATE INDEX idx_thread_path 
ON message_threads(path text_pattern_ops);

CREATE INDEX idx_thread_root 
ON message_threads(root_message_id);

CREATE INDEX idx_thread_depth 
ON message_threads(depth);

-- Composite index for thread traversal
CREATE INDEX idx_thread_traversal 
ON message_threads(root_message_id, path, depth);

-- ======================================
-- 4. CREATE HELPER FUNCTIONS
-- ======================================

-- Function to generate thread path
CREATE OR REPLACE FUNCTION generate_thread_path(parent_path TEXT, message_id INTEGER) 
RETURNS TEXT AS $$
BEGIN
  IF parent_path IS NULL THEN
    RETURN LPAD(message_id::TEXT, 10, '0');
  ELSE
    RETURN parent_path || '.' || LPAD(message_id::TEXT, 10, '0');
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate thread depth from path
CREATE OR REPLACE FUNCTION calculate_thread_depth(thread_path TEXT) 
RETURNS INTEGER AS $$
BEGIN
  IF thread_path IS NULL THEN
    RETURN 0;
  ELSE
    RETURN array_length(string_to_array(thread_path, '.'), 1) - 1;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ======================================
-- 5. CREATE TRIGGERS
-- ======================================

-- Trigger to update updated_at on messages
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
CREATE TRIGGER trigger_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_updated_at();

-- Trigger to validate read_at timestamp
CREATE OR REPLACE FUNCTION validate_read_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = TRUE AND NEW.read_at IS NULL THEN
    NEW.read_at = CURRENT_TIMESTAMP;
  ELSIF NEW.read = FALSE THEN
    NEW.read_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_read ON message_recipients;
CREATE TRIGGER trigger_validate_read
BEFORE INSERT OR UPDATE ON message_recipients
FOR EACH ROW
EXECUTE FUNCTION validate_read_timestamp();

-- ======================================
-- 6. MIGRATE EXISTING DATA
-- ======================================

-- Migrate existing conversations to use new structure
-- This creates message_recipients entries for existing messages
INSERT INTO message_recipients (message_id, recipient_id, read, created_at)
SELECT DISTINCT 
  m.id,
  cp.user_id,
  FALSE, -- Assume unread for migration
  m.created_at
FROM messages m
INNER JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
WHERE cp.user_id != m.user_id -- Don't make sender a recipient
  AND NOT EXISTS (
    SELECT 1 FROM message_recipients mr 
    WHERE mr.message_id = m.id AND mr.recipient_id = cp.user_id
  )
ON CONFLICT (message_id, recipient_id) DO NOTHING;

-- ======================================
-- 7. CREATE VIEWS FOR CONVENIENCE
-- ======================================

-- View for unread message counts by context
CREATE OR REPLACE VIEW v_unread_counts AS
SELECT 
  mr.recipient_id,
  m.context_type,
  COUNT(*) as unread_count
FROM message_recipients mr
INNER JOIN messages m ON m.id = mr.message_id
WHERE mr.read = FALSE 
  AND m.deleted_at IS NULL
  AND mr.context_access_revoked = FALSE
GROUP BY mr.recipient_id, m.context_type;

-- View for message threads with full details
CREATE OR REPLACE VIEW v_message_threads AS
SELECT 
  mt.*,
  m.sender_id,
  m.content,
  m.edited_content,
  m.created_at as message_created_at,
  m.context_type,
  m.context_id
FROM message_threads mt
INNER JOIN messages m ON m.id = mt.message_id
WHERE m.deleted_at IS NULL
ORDER BY mt.path;

-- ======================================
-- 8. GRANT PERMISSIONS (if needed)
-- ======================================
-- Adjust these based on your database user setup
-- GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON message_recipients TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON message_threads TO your_app_user;
-- GRANT SELECT ON v_unread_counts TO your_app_user;
-- GRANT SELECT ON v_message_threads TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ======================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- ======================================
COMMENT ON TABLE message_recipients IS 'Tracks message delivery and read status for each recipient';
COMMENT ON TABLE message_threads IS 'Maintains message threading hierarchy using materialized paths';
COMMENT ON COLUMN messages.context_type IS 'Links messages to app entities: suggestion, project, task, or direct message';
COMMENT ON COLUMN messages.context_id IS 'ID of the linked entity (suggestion_id, project_id, etc)';
COMMENT ON COLUMN message_recipients.context_access_revoked IS 'TRUE when recipient loses access to the context (e.g., removed from project)';
COMMENT ON COLUMN message_threads.path IS 'Materialized path for efficient thread queries (e.g., 0000000001.0000000005.0000000012)';