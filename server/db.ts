import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Validate DATABASE_URL format
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  throw new Error(
    "DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql:// or postgres://",
  );
}

// Use HTTP connection instead of WebSocket for better stability
// Configure with connection options for better reliability
const sql = neon(databaseUrl, {
  // Optimize for production deployment
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 600000,
  maxAliveTime: 1800000,
});

export const db = drizzle(sql, { schema });

// Test database connection function
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Simple test query
    await sql`SELECT 1`;
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return false;
  }
}
