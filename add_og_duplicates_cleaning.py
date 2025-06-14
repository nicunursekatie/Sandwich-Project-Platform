#!/usr/bin/env python3
"""
Add OG duplicates cleaning functionality to the backend routes
"""

import re

def add_og_duplicates_cleaning():
    """Add the missing OG duplicates cleaning logic to server/routes.ts"""
    
    # Read the current routes file
    with open('server/routes.ts', 'r') as f:
        content = f.read()
    
    # Find the clean duplicates endpoint and add OG mode
    pattern = r"(} else if \(mode === 'suspicious'\) \{.*?hostName\.includes\('duplicate'\);\s*\}\);\s*}\s*)(let deletedCount = 0;)"
    
    og_cleaning_code = '''} else if (mode === 'og-duplicates') {
        // Find duplicates between OG Sandwich Project and early collections with no location data
        const ogCollections = collections.filter(c => c.hostName === 'OG Sandwich Project');
        const earlyCollections = collections.filter(c => 
          c.hostName !== 'OG Sandwich Project' && 
          (c.hostName === '' || c.hostName === null || c.hostName.trim() === '' || 
           c.hostName.toLowerCase().includes('unknown') || c.hostName.toLowerCase().includes('no location'))
        );

        // Create a map of OG entries by date and count
        const ogMap = new Map();
        ogCollections.forEach(og => {
          const key = `${og.collectionDate}-${og.individualSandwiches}`;
          if (!ogMap.has(key)) {
            ogMap.set(key, []);
          }
          ogMap.get(key).push(og);
        });

        // Find early entries that match OG entries and mark them for deletion
        earlyCollections.forEach(early => {
          const key = `${early.collectionDate}-${early.individualSandwiches}`;
          if (ogMap.has(key)) {
            collectionsToDelete.push(early);
          }
        });

        // Also remove duplicate OG entries (keep newest)
        ogMap.forEach(ogGroup => {
          if (ogGroup.length > 1) {
            const sorted = ogGroup.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            collectionsToDelete.push(...sorted.slice(1));
          }
        });
      }

      '''
    
    replacement = r'\1' + og_cleaning_code + r'\2'
    
    # Check if OG duplicates mode already exists
    if "mode === 'og-duplicates'" in content:
        print("OG duplicates cleaning mode already exists in the backend")
        return True
    
    # Apply the replacement
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    if new_content != content:
        # Write the updated content back
        with open('server/routes.ts', 'w') as f:
            f.write(new_content)
        print("Successfully added OG duplicates cleaning functionality to backend")
        return True
    else:
        print("Could not find the pattern to insert OG duplicates cleaning code")
        return False

if __name__ == "__main__":
    add_og_duplicates_cleaning()