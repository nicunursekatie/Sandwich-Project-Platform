-- Migration 001c: Create Message Threads Table
-- Description: Enable threaded conversations with efficient querying
-- Date: 2025-07-11
-- Dependencies: messages table with id column

BEGIN;

-- ======================================
-- STEP 1: Create table
-- ======================================
CREATE TABLE message_threads (
  id SERIAL PRIMARY KEY,
  root_message_id INTEGER,
  message_id INTEGER NOT NULL,
  parent_message_id INTEGER,
  depth INTEGER NOT NULL DEFAULT 0,
  path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  CONSTRAINT fk_thread_root_message 
    FOREIGN KEY (root_message_id) 
    REFERENCES messages(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_thread_message 
    FOREIGN KEY (message_id) 
    REFERENCES messages(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_thread_parent_message 
    FOREIGN KEY (parent_message_id) 
    REFERENCES messages(id) 
    ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT uq_message_thread 
    UNIQUE(message_id),
    
  CONSTRAINT chk_thread_depth 
    CHECK (depth >= 0),
    
  -- Ensure root messages have depth 0
  CONSTRAINT chk_thread_root_depth 
    CHECK (
      (root_message_id = message_id AND depth = 0) OR
      (root_message_id != message_id AND depth > 0) OR
      (root_message_id IS NULL)
    )
);

-- ======================================
-- STEP 2: Create indexes
-- ======================================
-- For path-based queries (prefix searches)
CREATE INDEX idx_thread_path 
ON message_threads(path text_pattern_ops);

-- For finding all messages in a thread
CREATE INDEX idx_thread_root 
ON message_threads(root_message_id);

-- For depth-limited queries
CREATE INDEX idx_thread_depth 
ON message_threads(depth);

-- For finding direct replies
CREATE INDEX idx_thread_parent 
ON message_threads(parent_message_id)
WHERE parent_message_id IS NOT NULL;

-- Composite index for efficient thread traversal
CREATE INDEX idx_thread_traversal 
ON message_threads(root_message_id, path, depth);

-- For finding thread branches
CREATE INDEX idx_thread_branches 
ON message_threads(path, depth)
WHERE depth > 0;

-- ======================================
-- STEP 3: Create helper functions
-- ======================================
-- Function to generate thread path
CREATE OR REPLACE FUNCTION generate_thread_path(
  parent_path TEXT, 
  message_id INTEGER
) 
RETURNS TEXT AS $$
BEGIN
  IF parent_path IS NULL OR parent_path = '' THEN
    -- Root message: pad to 10 digits for sorting
    RETURN LPAD(message_id::TEXT, 10, '0');
  ELSE
    -- Child message: append to parent path
    RETURN parent_path || '.' || LPAD(message_id::TEXT, 10, '0');
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate depth from path
CREATE OR REPLACE FUNCTION calculate_thread_depth(thread_path TEXT) 
RETURNS INTEGER AS $$
BEGIN
  IF thread_path IS NULL OR thread_path = '' THEN
    RETURN 0;
  ELSE
    -- Count dots in path
    RETURN array_length(string_to_array(thread_path, '.'), 1) - 1;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get parent path
CREATE OR REPLACE FUNCTION get_parent_path(thread_path TEXT)
RETURNS TEXT AS $$
DECLARE
  path_parts TEXT[];
BEGIN
  IF thread_path IS NULL OR thread_path = '' THEN
    RETURN NULL;
  END IF;
  
  path_parts := string_to_array(thread_path, '.');
  
  IF array_length(path_parts, 1) <= 1 THEN
    RETURN NULL;
  ELSE
    -- Remove last element
    RETURN array_to_string(path_parts[1:array_length(path_parts, 1)-1], '.');
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ======================================
-- STEP 4: Create trigger for auto-threading
-- ======================================
-- This trigger automatically creates thread entries when messages reference a parent
CREATE OR REPLACE FUNCTION auto_thread_message()
RETURNS TRIGGER AS $$
DECLARE
  parent_thread RECORD;
  new_path TEXT;
  new_root_id INTEGER;
  new_depth INTEGER;
BEGIN
  -- Check if this message is already threaded
  IF EXISTS (SELECT 1 FROM message_threads WHERE message_id = NEW.id) THEN
    RETURN NEW;
  END IF;
  
  -- Check if message has context_type and context_id for potential threading
  -- You can modify this logic based on your needs
  IF NEW.context_type IS NOT NULL AND NEW.context_id IS NOT NULL THEN
    -- Find potential parent message in same context
    SELECT mt.* INTO parent_thread
    FROM message_threads mt
    INNER JOIN messages m ON m.id = mt.message_id
    WHERE m.context_type = NEW.context_type 
      AND m.context_id = NEW.context_id
      AND m.id < NEW.id
    ORDER BY m.created_at DESC
    LIMIT 1;
    
    IF FOUND THEN
      -- Thread under the found parent
      new_path := generate_thread_path(parent_thread.path, NEW.id);
      new_root_id := parent_thread.root_message_id;
      new_depth := parent_thread.depth + 1;
      
      INSERT INTO message_threads (
        root_message_id, 
        message_id, 
        parent_message_id, 
        depth, 
        path
      ) VALUES (
        new_root_id,
        NEW.id,
        parent_thread.message_id,
        new_depth,
        new_path
      );
    ELSE
      -- Create new thread root
      new_path := generate_thread_path(NULL, NEW.id);
      
      INSERT INTO message_threads (
        root_message_id, 
        message_id, 
        parent_message_id, 
        depth, 
        path
      ) VALUES (
        NEW.id,
        NEW.id,
        NULL,
        0,
        new_path
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable auto-threading for new messages (optional)
-- CREATE TRIGGER trigger_auto_thread_message
-- AFTER INSERT ON messages
-- FOR EACH ROW
-- EXECUTE FUNCTION auto_thread_message();

-- ======================================
-- STEP 5: Create views
-- ======================================
-- View for complete thread hierarchy
CREATE VIEW v_thread_hierarchy AS
WITH RECURSIVE thread_tree AS (
  -- Root messages
  SELECT 
    mt.*,
    m.sender_id,
    m.content,
    m.created_at as message_created_at,
    m.context_type,
    m.context_id,
    0 as level
  FROM message_threads mt
  INNER JOIN messages m ON m.id = mt.message_id
  WHERE mt.parent_message_id IS NULL
    AND m.deleted_at IS NULL
  
  UNION ALL
  
  -- Child messages
  SELECT 
    mt.*,
    m.sender_id,
    m.content,
    m.created_at as message_created_at,
    m.context_type,
    m.context_id,
    tt.level + 1
  FROM message_threads mt
  INNER JOIN messages m ON m.id = mt.message_id
  INNER JOIN thread_tree tt ON tt.message_id = mt.parent_message_id
  WHERE m.deleted_at IS NULL
)
SELECT * FROM thread_tree
ORDER BY path;

-- View for thread summaries
CREATE VIEW v_thread_summaries AS
SELECT 
  mt.root_message_id,
  COUNT(*) as message_count,
  MAX(mt.depth) as max_depth,
  MIN(m.created_at) as first_message_at,
  MAX(m.created_at) as last_message_at,
  COUNT(DISTINCT m.sender_id) as participant_count
FROM message_threads mt
INNER JOIN messages m ON m.id = mt.message_id
WHERE m.deleted_at IS NULL
GROUP BY mt.root_message_id;

-- ======================================
-- STEP 6: Add documentation
-- ======================================
COMMENT ON TABLE message_threads IS 'Maintains message threading hierarchy using materialized paths';
COMMENT ON COLUMN message_threads.root_message_id IS 'ID of the thread root message';
COMMENT ON COLUMN message_threads.parent_message_id IS 'ID of the direct parent message';
COMMENT ON COLUMN message_threads.depth IS 'Depth in thread (0 for root messages)';
COMMENT ON COLUMN message_threads.path IS 'Materialized path for efficient queries (e.g., 0000000001.0000000005)';

COMMIT;

-- ======================================
-- ROLLBACK SCRIPT
-- ======================================
-- To rollback this migration, save and run:
/*
BEGIN;

-- Drop views
DROP VIEW IF EXISTS v_thread_summaries;
DROP VIEW IF EXISTS v_thread_hierarchy;

-- Drop trigger if enabled
-- DROP TRIGGER IF EXISTS trigger_auto_thread_message ON messages;
DROP FUNCTION IF EXISTS auto_thread_message();

-- Drop helper functions
DROP FUNCTION IF EXISTS get_parent_path(TEXT);
DROP FUNCTION IF EXISTS calculate_thread_depth(TEXT);
DROP FUNCTION IF EXISTS generate_thread_path(TEXT, INTEGER);

-- Drop table
DROP TABLE IF EXISTS message_threads;

COMMIT;
*/