-- Migration 001a: Enhance Messages Table
-- Description: Add contextual linking and edit/delete tracking to messages
-- Date: 2025-07-11
-- Dependencies: Existing messages table

BEGIN;

-- ======================================
-- STEP 1: Add new columns
-- ======================================
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS sender_id TEXT,
ADD COLUMN IF NOT EXISTS context_type TEXT,
ADD COLUMN IF NOT EXISTS context_id TEXT,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS edited_content TEXT,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_by TEXT;

-- ======================================
-- STEP 2: Migrate existing data
-- ======================================
-- Copy user_id to sender_id for existing messages
UPDATE messages 
SET sender_id = user_id 
WHERE sender_id IS NULL AND user_id IS NOT NULL;

-- ======================================
-- STEP 3: Add constraints
-- ======================================
-- Make sender_id required
ALTER TABLE messages 
ALTER COLUMN sender_id SET NOT NULL;

-- Add context type validation
ALTER TABLE messages 
ADD CONSTRAINT chk_messages_context_type 
CHECK (context_type IN ('suggestion', 'project', 'task', 'direct') OR context_type IS NULL);

-- Add edit validation
ALTER TABLE messages 
ADD CONSTRAINT chk_messages_edit 
CHECK (
  (edited_at IS NULL AND edited_content IS NULL) OR 
  (edited_at IS NOT NULL AND edited_content IS NOT NULL)
);

-- ======================================
-- STEP 4: Create indexes
-- ======================================
CREATE INDEX idx_messages_context 
ON messages(context_type, context_id) 
WHERE context_type IS NOT NULL;

CREATE INDEX idx_messages_sender 
ON messages(sender_id);

CREATE INDEX idx_messages_deleted 
ON messages(deleted_at) 
WHERE deleted_at IS NULL;

-- Index for finding messages by context
CREATE INDEX idx_messages_context_lookup 
ON messages(context_id) 
WHERE context_type IS NOT NULL;

-- ======================================
-- STEP 5: Add update trigger
-- ======================================
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

-- ======================================
-- STEP 6: Add documentation
-- ======================================
COMMENT ON COLUMN messages.sender_id IS 'User ID of message sender (replaces user_id)';
COMMENT ON COLUMN messages.context_type IS 'Type of entity this message relates to';
COMMENT ON COLUMN messages.context_id IS 'ID of the related entity';
COMMENT ON COLUMN messages.edited_at IS 'Timestamp when message was edited';
COMMENT ON COLUMN messages.edited_content IS 'New content after edit (original preserved in content)';
COMMENT ON COLUMN messages.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN messages.deleted_by IS 'User ID who deleted the message';

COMMIT;

-- ======================================
-- ROLLBACK SCRIPT
-- ======================================
-- To rollback this migration, save and run:
/*
BEGIN;

-- Remove trigger
DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
DROP FUNCTION IF EXISTS update_messages_updated_at();

-- Remove indexes
DROP INDEX IF EXISTS idx_messages_context;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_deleted;
DROP INDEX IF EXISTS idx_messages_context_lookup;

-- Remove constraints
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS chk_messages_context_type,
DROP CONSTRAINT IF EXISTS chk_messages_edit;

-- Remove columns
ALTER TABLE messages 
DROP COLUMN IF EXISTS sender_id,
DROP COLUMN IF EXISTS context_type,
DROP COLUMN IF EXISTS context_id,
DROP COLUMN IF EXISTS edited_at,
DROP COLUMN IF EXISTS edited_content,
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by;

COMMIT;
*/