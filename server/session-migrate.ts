import { db } from "./db";
import { sql } from "drizzle-orm";
import { logger } from "./utils/logger";

export async function ensureSessionsTable() {
  try {
    logger.info("Checking sessions table...");
    
    // Create sessions table if it doesn't exist
    // This matches the schema expected by connect-pg-simple
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid varchar NOT NULL COLLATE "default",
        sess json NOT NULL,
        expire timestamp(6) NOT NULL,
        CONSTRAINT sessions_pkey PRIMARY KEY (sid)
      );
    `);
    
    // Create index on expire column for efficient cleanup
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);
    `);
    
    logger.info("Sessions table ready");
  } catch (error) {
    logger.error("Failed to create sessions table:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureSessionsTable()
    .then(() => {
      logger.info("Session migration complete");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Session migration failed:", error);
      process.exit(1);
    });
}