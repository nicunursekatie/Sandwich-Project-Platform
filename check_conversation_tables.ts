import { db } from "./server/db.ts";

async function checkConversationTables() {
  try {
    console.log("=== CONVERSATIONS TABLE ===");
    const conversations = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position;
    `);
    conversations.rows.forEach(row => 
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    );

    console.log("\n=== CONVERSATION_PARTICIPANTS TABLE ===");
    const participants = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'conversation_participants'
      ORDER BY ordinal_position;
    `);
    participants.rows.forEach(row => 
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    );

    console.log("\n=== USERS TABLE ===");
    const users = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    users.rows.forEach(row => 
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    );

  } catch (error) {
    console.error("Error:", error.message);
  }
  process.exit(0);
}

checkConversationTables();
