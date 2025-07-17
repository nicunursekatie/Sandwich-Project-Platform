import { Router } from "express";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

const router = Router();

// Simple chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  channel: varchar("channel").notNull().default("general"), // 'general', 'core-team', 'host', 'driver', 'recipient'
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Get messages for a channel
router.get("/chat/:channel", async (req, res) => {
  try {
    const { channel } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channel, channel))
      .orderBy(desc(chatMessages.createdAt))
      .limit(100);

    res.json(messages.reverse()); // Most recent at bottom
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message to a channel
router.post("/chat/:channel", async (req, res) => {
  try {
    const { channel } = req.params;
    const { content } = req.body;
    const user = (req as any).user;
    
    if (!user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const userName = user.firstName || user.email || "Unknown User";
    
    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        channel,
        userId: user.id,
        userName,
        content: content.trim(),
      })
      .returning();

    // Broadcast to WebSocket clients if available
    if ((global as any).broadcastChatMessage) {
      (global as any).broadcastChatMessage({
        channel,
        message: newMessage,
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Delete a message (only by author or admin)
router.delete("/chat/message/:id", async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const user = (req as any).user;
    
    if (!user?.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [message] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId));

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user can delete (author or admin)
    const isAuthor = message.userId === user.id;
    const isAdmin = user.role === "admin" || user.role === "super_admin";
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "Permission denied" });
    }

    await db.delete(chatMessages).where(eq(chatMessages.id, messageId));

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting chat message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;