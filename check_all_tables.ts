import { db } from "./server/db.ts";

async function checkAllTables() {
  try {
    console.log("Checking all tables...");
    
    const tables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log("Available tables:");
    tables.rows.forEach(row => console.log("-", row.table_name));
    
  } catch (error) {
    console.error("Error:", error.message);
  }
  process.exit(0);
}

checkAllTables();
