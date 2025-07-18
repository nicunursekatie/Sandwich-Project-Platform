import { db } from "./db";
import { sandwichCollections, hosts } from "@shared/schema";
import { eq } from "drizzle-orm";
import { logger } from "./utils/logger";

// Mapping from CSV group names to your real location hosts
// Based on your actual CSV data patterns
const HOST_MAPPINGS = {
  "Unnamed Group": "Metro Atlanta", // Large volume entries from weekly spreadsheets
  "Group 8": "North Fulton",
  "Group 3": "East Metro",
  "Group 1": "West Metro", 
  "Group 2": "South Metro",
  "Group 4": "Northeast Metro",
  "Group 5": "Northwest Metro",
  "Group 6": "Central Atlanta",
  "Group 7": "Southeast Metro"
};

export async function bulkMapHosts() {
  logger.info("Starting bulk host mapping...");
  
  let totalUpdated = 0;
  
  for (const [oldName, newName] of Object.entries(HOST_MAPPINGS)) {
    try {
      const result = await db
        .update(sandwichCollections)
        .set({ hostName: newName })
        .where(eq(sandwichCollections.hostName, oldName));
      
      const updatedCount = result.rowCount || 0;
      logger.info(`Updated ${updatedCount} records from "${oldName}" to "${newName}"`);
      totalUpdated += updatedCount;
      
    } catch (error) {
      logger.error(`Failed to update ${oldName} to ${newName}:`, error);
    }
  }
  
  logger.info(`Bulk mapping complete: ${totalUpdated} total records updated`);
  return totalUpdated;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  bulkMapHosts()
    .then((count) => {
      logger.info(`✅ Successfully updated ${count} collection records`);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Bulk mapping failed:', error);
      process.exit(1);
    });
}