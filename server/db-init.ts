import { db } from "./db";
import { hosts, sandwichCollections, projects, messages, weeklyReports, meetingMinutes, driveLinks, agendaItems, meetings, driverAgreements, recipients } from "@shared/schema";
import { eq, count, sql } from "drizzle-orm";
import { ensureSessionsTable } from "./session-migrate";
import { logger } from "./utils/logger";

export async function initializeDatabase() {
  try {
    logger.info("Checking database initialization...");
    logger.info("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    logger.info("DATABASE_URL preview:", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "not set");

    // Ensure sessions table exists for PostgreSQL session storage
    // This resolves the "MemoryStore is not designed for a production environment" warning
    // by using persistent PostgreSQL storage for sessions instead of memory
    await ensureSessionsTable();

    // Check each table independently and seed if empty
    const [hostsCount] = await db.select({ count: count() }).from(hosts);
    const [projectsCount] = await db.select({ count: count() }).from(projects);
    const [messagesCount] = await db.select({ count: count() }).from(messages);
    const [collectionsCount] = await db.select({ count: count() }).from(sandwichCollections);
    const [recipientsCount] = await db.select({ count: count() }).from(recipients);

    logger.info("Table counts - Hosts:", hostsCount.count, "Projects:", projectsCount.count, "Messages:", messagesCount.count, "Collections:", collectionsCount.count, "Recipients:", recipientsCount.count);

    // No seeding - all data should be added manually or via import
    logger.info("Database ready - no sample data seeded");

    logger.info("Database initialization complete");
  } catch (error) {
    logger.error("Database initialization failed:", error);
    // Don't throw - allow app to continue with fallback storage
  }
}