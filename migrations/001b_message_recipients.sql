-- Migration 001b: Create Message Recipients Table
-- Description: Track message delivery and read status per recipient
-- Date: 2025-07-11
-- Dependencies: messages table with id column

BEGIN;

-- ======================================
-- STEP 1: Create table
-- ======================================
CREATE TABLE message_recipients (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  recipient_id TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP,
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  context_access_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key
  CONSTRAINT fk_message_recipients_message 
    FOREIGN KEY (message_id) 
    REFERENCES messages(id) 
    ON DELETE CASCADE,
  
  -- Unique constraint
  CONSTRAINT uq_message_recipient 
    UNIQUE(message_id, recipient_id)
);

-- ======================================
-- STEP 2: Create indexes
-- ======================================
-- For finding unread messages by recipient
CREATE INDEX idx_message_recipients_unread 
ON message_recipients(recipient_id, read) 
WHERE read = FALSE;

-- For finding all recipients of a message
CREATE INDEX idx_message_recipients_message 
ON message_recipients(message_id);

-- For finding all messages for a recipient
CREATE INDEX idx_message_recipients_recipient 
ON message_recipients(recipient_id);

-- Composite index for efficient unread counts
CREATE INDEX idx_message_recipients_unread_counts 
ON message_recipients(recipient_id, read, message_id) 
WHERE read = FALSE;

-- For email fallback processing
CREATE INDEX idx_message_recipients_email_pending 
ON message_recipients(recipient_id, read, email_sent_at) 
WHERE read = FALSE AND email_sent_at IS NULL;

-- For permission-based filtering
CREATE INDEX idx_message_recipients_access 
ON message_recipients(recipient_id, context_access_revoked) 
WHERE context_access_revoked = FALSE;

-- ======================================
-- STEP 3: Create trigger for read timestamp
-- ======================================
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

CREATE TRIGGER trigger_validate_read
BEFORE INSERT OR UPDATE ON message_recipients
FOR EACH ROW
EXECUTE FUNCTION validate_read_timestamp();

-- ======================================
-- STEP 4: Create helpful view
-- ======================================
CREATE VIEW v_unread_messages AS
SELECT 
  mr.recipient_id,
  mr.message_id,
  m.sender_id,
  m.content,
  m.context_type,
  m.context_id,
  m.created_at,
  mr.created_at as delivered_at
FROM message_recipients mr
INNER JOIN messages m ON m.id = mr.message_id
WHERE mr.read = FALSE 
  AND m.deleted_at IS NULL
  AND mr.context_access_revoked = FALSE
ORDER BY m.created_at DESC;

-- ======================================
-- STEP 5: Migrate existing conversation data
-- ======================================
-- This creates recipient entries for existing messages based on conversation participants
INSERT INTO message_recipients (message_id, recipient_id, read, created_at)
SELECT DISTINCT 
  m.id,
  cp.user_id,
  -- Mark as read if message is older than 7 days (configurable)
  CASE 
    WHEN m.created_at < CURRENT_TIMESTAMP - INTERVAL '7 days' THEN TRUE
    ELSE FALSE
  END,
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
-- STEP 6: Add documentation
-- ======================================
COMMENT ON TABLE message_recipients IS 'Tracks message delivery and read status for each recipient';
COMMENT ON COLUMN message_recipients.read IS 'Whether the recipient has read this message';
COMMENT ON COLUMN message_recipients.read_at IS 'When the recipient read this message';
COMMENT ON COLUMN message_recipients.notification_sent IS 'Whether real-time notification was sent';
COMMENT ON COLUMN message_recipients.email_sent_at IS 'When email notification was sent (for offline users)';
COMMENT ON COLUMN message_recipients.context_access_revoked IS 'TRUE when recipient lost access to the message context';

COMMIT;

-- ======================================
-- ROLLBACK SCRIPT
-- ======================================
-- To rollback this migration, save and run:
/*
BEGIN;

-- Drop view
DROP VIEW IF EXISTS v_unread_messages;

-- Drop trigger and function
DROP TRIGGER IF EXISTS trigger_validate_read ON message_recipients;
DROP FUNCTION IF EXISTS validate_read_timestamp();

-- Drop table (cascades to indexes)
DROP TABLE IF EXISTS message_recipients;

COMMIT;
*/