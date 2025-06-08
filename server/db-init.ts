import { db } from "./db";
import { hosts, sandwichCollections, projects, messages, weeklyReports, meetingMinutes, driveLinks, agendaItems, meetings, driverAgreements, recipients } from "@shared/schema";
import { eq, count } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    console.log("Checking database initialization...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL preview:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "not set");

    // Check each table independently and seed if empty
    const [hostsCount] = await db.select({ count: count() }).from(hosts);
    const [projectsCount] = await db.select({ count: count() }).from(projects);
    const [messagesCount] = await db.select({ count: count() }).from(messages);
    const [collectionsCount] = await db.select({ count: count() }).from(sandwichCollections);
    const [recipientsCount] = await db.select({ count: count() }).from(recipients);

    console.log("Table counts - Hosts:", hostsCount.count, "Projects:", projectsCount.count, "Messages:", messagesCount.count, "Collections:", collectionsCount.count, "Recipients:", recipientsCount.count);

    // Only seed if ALL tables are completely empty (first time setup)
    if (hostsCount.count === 0 && projectsCount.count === 0 && messagesCount.count === 0 && collectionsCount.count === 0) {
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

    // Only seed collections if they're empty (no duplicate variable declaration needed)
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

    // Seed recipients if empty
    if (recipientsCount.count === 0) {
      console.log("Seeding recipients table...");
      await db.insert(recipients).values([
        {
          name: "John Doe",
          phone: "(555) 123-4567",
          email: "john.doe@email.com",
          address: "123 Main St, City, State 12345",
          preferences: "No nuts, vegetarian options preferred",
          status: "active"
        },
        {
          name: "Jane Smith", 
          phone: "(555) 987-6543",
          email: "jane.smith@email.com",
          address: "456 Oak Ave, City, State 12345",
          preferences: "Gluten-free bread only",
          status: "active"
        },
        {
          name: "Mike Johnson",
          phone: "(555) 456-7890",
          email: "mike.johnson@email.com", 
          address: "789 Pine St, City, State 12345",
          preferences: "Regular sandwiches",
          status: "active"
        },
        {
          name: "Sarah Williams",
          phone: "(555) 321-0987",
          email: "sarah.williams@email.com",
          address: "321 Elm St, City, State 12345", 
          preferences: "Turkey and ham only",
          status: "inactive"
        }
      ]);
    }

    console.log("Database initialization complete");
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Don't throw - allow app to continue with fallback storage
  }
}