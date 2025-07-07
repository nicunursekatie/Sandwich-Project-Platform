import { db } from "./server/db.ts";

async function runQuery() {
  try {
    console.log("Connecting to database...");
    
    const result = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position;
    `);
    
    console.log("Messages table structure:");
    console.log(result.rows || result);
    
  } catch (error) {
    console.error("Database error:", error.message);
    console.error("Full error:", error);
  }
  process.exit(0);
}

runQuery();
