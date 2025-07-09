import { db, testDatabaseConnection } from "./db";
import { hosts, sandwichCollections, projects, messages, weeklyReports, meetingMinutes, driveLinks, agendaItems, meetings, driverAgreements, recipients } from "@shared/schema";
import { eq, count, sql } from "drizzle-orm";
import { ensureSessionsTable } from "./session-migrate";

export async function initializeDatabase() {
  try {
    console.log("Initializing database connection...");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL preview:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "not set");

    // Test database connection before proceeding
    const connectionStatus = await testDatabaseConnection();
    if (!connectionStatus) {
      throw new Error("Database connection test failed - unable to connect to database");
    }

    // Ensure sessions table exists for PostgreSQL session storage
    // This resolves the "MemoryStore is not designed for a production environment" warning
    // by using persistent PostgreSQL storage for sessions instead of memory
    try {
      await ensureSessionsTable();
      console.log("✓ Sessions table initialized successfully");
    } catch (sessionError) {
      console.error("✗ Sessions table creation failed:", sessionError);
      throw new Error(`Sessions table creation failed: ${sessionError.message}`);
    }

    // Check each table independently and seed if empty
    const [hostsCount] = await db.select({ count: count() }).from(hosts);
    const [projectsCount] = await db.select({ count: count() }).from(projects);
    const [messagesCount] = await db.select({ count: count() }).from(messages);
    const [collectionsCount] = await db.select({ count: count() }).from(sandwichCollections);
    const [recipientsCount] = await db.select({ count: count() }).from(recipients);

    console.log("Table counts - Hosts:", hostsCount.count, "Projects:", projectsCount.count, "Messages:", messagesCount.count, "Collections:", collectionsCount.count, "Recipients:", recipientsCount.count);

    // No seeding - all data should be added manually or via import
    console.log("Database ready - no sample data seeded");

    console.log("✓ Database initialization complete");
  } catch (error) {
    console.error("✗ Database initialization failed:", error);
    console.error("Error details:", error.message);
    
    // More specific error handling based on error type
    if (error.message?.includes('endpoint is disabled')) {
      console.error("DEPLOYMENT ERROR: Neon database endpoint is disabled");
      console.error("This typically occurs when:");
      console.error("1. Database is not properly provisioned");
      console.error("2. Database URL is malformed");
      console.error("3. Database service is temporarily unavailable");
      throw new Error("Database connection failure: Neon database endpoint is disabled");
    }
    
    if (error.message?.includes('connection') || error.message?.includes('timeout')) {
      console.error("DEPLOYMENT ERROR: Database connection failed");
      throw new Error("Database connection failure: Unable to establish connection");
    }
    
    // Re-throw the error to prevent app startup with broken database
    throw new Error(`Application startup failure: ${error.message}`);
  }
}