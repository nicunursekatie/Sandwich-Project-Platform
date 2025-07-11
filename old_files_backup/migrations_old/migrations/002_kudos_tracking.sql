-- Migration 002: Add Kudos Tracking Table
-- Description: Prevent spam by tracking kudos sent between users
-- Date: 2025-07-11
-- Dependencies: messages table

BEGIN;

-- ======================================
-- Create kudos tracking table
-- ======================================
CREATE TABLE IF NOT EXISTS kudos_tracking (
  id SERIAL PRIMARY KEY,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  context_type TEXT NOT NULL CHECK (context_type IN ('project', 'task')),
  context_id TEXT NOT NULL,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one kudos per sender-recipient-context combination
  CONSTRAINT uq_kudos_unique UNIQUE(sender_id, recipient_id, context_type, context_id)
);

-- ======================================
-- Create indexes
-- ======================================
CREATE INDEX idx_kudos_sender ON kudos_tracking(sender_id);
CREATE INDEX idx_kudos_recipient ON kudos_tracking(recipient_id);
CREATE INDEX idx_kudos_context ON kudos_tracking(context_type, context_id);

-- ======================================
-- Add documentation
-- ======================================
COMMENT ON TABLE kudos_tracking IS 'Prevents kudos spam by tracking sent kudos per context';
COMMENT ON COLUMN kudos_tracking.context_type IS 'Type of entity the kudos relates to (project or task)';
COMMENT ON COLUMN kudos_tracking.context_id IS 'ID of the project or task';

COMMIT;

-- ======================================
-- ROLLBACK SCRIPT
-- ======================================
-- To rollback this migration:
/*
BEGIN;
DROP TABLE IF EXISTS kudos_tracking;
COMMIT;
*/