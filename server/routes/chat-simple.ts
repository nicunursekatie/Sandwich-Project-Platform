import { Router } from "express";
import { db } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { Server as SocketServer } from "socket.io";

const router = Router();

// Chat messages table for Socket.IO chat system
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  channel: varchar("channel").notNull().default("general"), // 'general', 'core-team', 'host', 'driver', 'recipient'
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Socket.IO chat server setup
export function setupChatSocket(io: SocketServer) {
  io.on("connection", (socket) => {
    console.log("User connected to chat:", socket.id);
    
    // Join a chat channel
    socket.on("join-channel", (channel: string) => {
      socket.join(channel);
      console.log(`User ${socket.id} joined channel: ${channel}`);
    });
    
    // Leave a chat channel
    socket.on("leave-channel", (channel: string) => {
      socket.leave(channel);
      console.log(`User ${socket.id} left channel: ${channel}`);
    });
    
    // Handle new chat message
    socket.on("send-message", async (data: { channel: string; content: string; userId: string; userName: string }) => {
      try {
        const { channel, content, userId, userName } = data;
        
        // Save message to database
        const [newMessage] = await db
          .insert(chatMessages)
          .values({
            channel,
            userId,
            userName,
            content: content.trim(),
          })
          .returning();
        
        // Broadcast to all users in the channel
        io.to(channel).emit("new-message", {
          id: newMessage.id,
          channel: newMessage.channel,
          userId: newMessage.userId,
          userName: newMessage.userName,
          content: newMessage.content,
          createdAt: newMessage.createdAt,
        });
        
        console.log(`Message sent to channel ${channel}: ${content}`);
      } catch (error) {
        console.error("Error sending chat message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });
    
    // Handle message deletion
    socket.on("delete-message", async (data: { messageId: number; userId: string; userRole: string }) => {
      try {
        const { messageId, userId, userRole } = data;
        
        // Get the message to check permissions
        const [message] = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.id, messageId));
        
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }
        
        // Check if user can delete (author or admin)
        const isAuthor = message.userId === userId;
        const isAdmin = userRole === "admin" || userRole === "super_admin";
        
        if (!isAuthor && !isAdmin) {
          socket.emit("error", { message: "Permission denied" });
          return;
        }
        
        // Delete the message
        await db.delete(chatMessages).where(eq(chatMessages.id, messageId));
        
        // Broadcast deletion to all users in the channel
        io.to(message.channel).emit("message-deleted", { messageId });
        
        console.log(`Message ${messageId} deleted from channel ${message.channel}`);
      } catch (error) {
        console.error("Error deleting chat message:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });
    
    socket.on("disconnect", () => {
      console.log("User disconnected from chat:", socket.id);
    });
  });
}

// Get messages for a channel
router.get("/chat/:channel", async (req, res) => {
  console.log("[DEBUG] Chat GET route hit for channel:", req.params.channel);
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
  console.log("[DEBUG] Chat POST route hit for channel:", req.params.channel);
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