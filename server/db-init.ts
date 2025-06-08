import { db } from "./db";
import { hosts, sandwichCollections, projects, messages, weeklyReports, meetingMinutes, driveLinks, agendaItems, meetings, driverAgreements } from "@shared/schema";
import { eq, count } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    console.log("Checking database initialization...");

    // Check if any core data exists - if any table has data, skip all seeding
    const [hostsCount] = await db.select({ count: count() }).from(hosts);
    const [projectsCount] = await db.select({ count: count() }).from(projects);
    const [messagesCount] = await db.select({ count: count() }).from(messages);
    
    // Only seed if ALL tables are completely empty (first time setup)
    if (hostsCount.count === 0 && projectsCount.count === 0 && messagesCount.count === 0) {
      console.log("Seeding hosts table...");
      await db.insert(hosts).values([
        {
          name: "Alex Thompson",
          email: "alex.thompson@email.com", 
          phone: "(555) 111-2222",
          status: "active",
          notes: "Regular Saturday collections"
        },
        {
          name: "Maria Gonzalez",
          email: "maria.gonzalez@email.com",
          phone: "(555) 333-4444", 
          status: "active",
          notes: "Specializes in large group events"
        },
        {
          name: "David Kim",
          email: "david.kim@email.com",
          phone: "(555) 555-6666",
          status: "active", 
          notes: "Weekday collections preferred"
        },
        {
          name: "Rachel Williams",
          email: "rachel.williams@email.com",
          phone: "(555) 777-8888",
          status: "active",
          notes: "Available for emergency collections"
        },
        {
          name: "James Anderson", 
          email: "james.anderson@email.com",
          phone: "(555) 999-0000",
          status: "inactive",
          notes: "On temporary leave"
        }
      ]);
    }

    // Check if sandwich collections table has data
    const [collectionsCount] = await db.select({ count: count() }).from(sandwichCollections);
    
    if (collectionsCount.count === 0) {
      console.log("Seeding sandwich collections table...");
      await db.insert(sandwichCollections).values([
        {
          collectionDate: "2025-06-05",
          hostName: "Alex Thompson", 
          individualSandwiches: 15,
          groupCollections: "Marketing Team: 8, Development: 6"
        },
        {
          collectionDate: "2025-06-03",
          hostName: "Maria Gonzalez",
          individualSandwiches: 22,
          groupCollections: "Sales: 12, Support: 5"
        },
        {
          collectionDate: "2025-05-30", 
          hostName: "David Kim",
          individualSandwiches: 18,
          groupCollections: "Executive: 4, Operations: 9"
        },
        {
          collectionDate: "2025-05-28",
          hostName: "Rachel Williams", 
          individualSandwiches: 12,
          groupCollections: "Finance: 7"
        }
      ]);
    }

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Don't throw - allow app to continue with fallback storage
  }
}