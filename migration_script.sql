-- Phase 2: Data Migration Script
-- Extract group data from JSON into simple columns

-- First, let's see a sample of the group collections JSON structure
SELECT id, host_name, collection_date, individual_sandwiches, group_collections
FROM sandwich_collections 
WHERE group_collections != '[]' 
LIMIT 5;

-- Update records with group data - extract first group
UPDATE sandwich_collections 
SET 
  group1_name = CASE 
    WHEN group_collections != '[]' AND group_collections IS NOT NULL THEN
      (SELECT (json_array_elements(group_collections::json)->>'name')::text LIMIT 1)
    ELSE NULL
  END,
  group1_count = CASE 
    WHEN group_collections != '[]' AND group_collections IS NOT NULL THEN
      (SELECT (json_array_elements(group_collections::json)->>'sandwichCount')::int LIMIT 1)
    ELSE NULL
  END
WHERE group_collections != '[]' AND group_collections IS NOT NULL;

-- Update records with second group (if exists)
UPDATE sandwich_collections 
SET 
  group2_name = CASE 
    WHEN group_collections != '[]' AND group_collections IS NOT NULL THEN
      (SELECT (json_array_elements(group_collections::json)->>'name')::text 
       FROM (SELECT json_array_elements(group_collections::json) ORDER BY ordinality LIMIT 1 OFFSET 1) sub
       LIMIT 1)
    ELSE NULL
  END,
  group2_count = CASE 
    WHEN group_collections != '[]' AND group_collections IS NOT NULL THEN
      (SELECT (json_array_elements(group_collections::json)->>'sandwichCount')::int 
       FROM (SELECT json_array_elements(group_collections::json) ORDER BY ordinality LIMIT 1 OFFSET 1) sub
       LIMIT 1)
    ELSE NULL
  END
WHERE group_collections != '[]' AND group_collections IS NOT NULL;

-- Verify migration results
SELECT 
  COUNT(*) as total_migrated,
  COUNT(group1_name) as with_group1,
  COUNT(group2_name) as with_group2
FROM sandwich_collections 
WHERE group_collections != '[]';