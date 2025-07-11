-- Rollback Migration: Messaging System Redesign
-- Description: Reverts the messaging system changes
-- Date: 2025-07-11

-- ======================================
-- WARNING: This rollback will lose data!
-- ======================================
-- Before running this rollback:
-- 1. Backup your database
-- 2. Consider if you need to preserve any new messages
-- 3. This will remove threading and read tracking

-- ======================================
-- 1. DROP VIEWS
-- ======================================
DROP VIEW IF EXISTS v_message_threads;
DROP VIEW IF EXISTS v_unread_counts;

-- ======================================
-- 2. DROP TRIGGERS
-- ======================================
DROP TRIGGER IF EXISTS trigger_validate_read ON message_recipients;
DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;

-- ======================================
-- 3. DROP FUNCTIONS
-- ======================================
DROP FUNCTION IF EXISTS update_messages_updated_at();
DROP FUNCTION IF EXISTS validate_read_timestamp();
DROP FUNCTION IF EXISTS calculate_thread_depth(TEXT);
DROP FUNCTION IF EXISTS generate_thread_path(TEXT, INTEGER);

-- ======================================
-- 4. DROP NEW TABLES
-- ======================================
-- This will cascade delete all message recipient records
DROP TABLE IF EXISTS message_threads;
DROP TABLE IF EXISTS message_recipients;

-- ======================================
-- 5. REVERT MESSAGES TABLE
-- ======================================
-- Remove constraints first
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS chk_messages_edit;

-- Drop indexes
DROP INDEX IF EXISTS idx_messages_context;
DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_messages_deleted;

-- Remove new columns
ALTER TABLE messages 
DROP COLUMN IF EXISTS sender_id,
DROP COLUMN IF EXISTS context_type,
DROP COLUMN IF EXISTS context_id,
DROP COLUMN IF EXISTS edited_at,
DROP COLUMN IF EXISTS edited_content,
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by;

-- ======================================
-- 6. RESTORE ORIGINAL STATE
-- ======================================
-- The messages table should now be back to its original structure:
-- - id
-- - conversation_id
-- - user_id
-- - content
-- - sender
-- - created_at
-- - updated_at

-- ======================================
-- NOTE: Data Migration Considerations
-- ======================================
-- This rollback does NOT restore:
-- 1. Messages that were sent using the new system
-- 2. Read/unread status information
-- 3. Thread relationships
-- 4. Context associations
-- 
-- If you need to preserve this data, create a backup before rollback:
-- CREATE TABLE messages_backup AS SELECT * FROM messages;
-- CREATE TABLE message_recipients_backup AS SELECT * FROM message_recipients;
-- CREATE TABLE message_threads_backup AS SELECT * FROM message_threads;