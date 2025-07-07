import type { Express } from "express";
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from "../db";
import {
  conversations,
  conversationParticipants,
  messages,
  users
} from "@shared/schema";

export function setupCleanMessagingRoutes(app: Express) {
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Get all conversations for a user
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const userConversations = await db
        .select({
          id: conversations.id,
          type: conversations.type,
          name: conversations.name,
          createdAt: conversations.createdAt,
          participantCount: sql<number>`(
            SELECT COUNT(*) FROM conversation_participants 
            WHERE conversation_id = ${conversations.id}
          )`,
          lastMessage: sql<string>`(
            SELECT content FROM messages 
            WHERE conversation_id = ${conversations.id}
            ORDER BY created_at DESC LIMIT 1
          )`,
          lastMessageAt: sql<Date>`(
            SELECT created_at FROM messages 
            WHERE conversation_id = ${conversations.id}
            ORDER BY created_at DESC LIMIT 1
          )`
        })
        .from(conversations)
        .innerJoin(
          conversationParticipants,
          eq(conversations.id, conversationParticipants.conversationId)
        )
        .where(eq(conversationParticipants.userId, userId))
        .orderBy(desc(sql`COALESCE(
          (SELECT created_at FROM messages 
           WHERE conversation_id = ${conversations.id}
           ORDER BY created_at DESC LIMIT 1),
          ${conversations.createdAt}
        )`));

      res.json(userConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.id;

      // Verify user is participant
      const participant = await db
        .select()
        .from(conversationParticipants)
        .where(and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        ))
        .limit(1);

      if (participant.length === 0) {
        return res.status(403).json({ message: "Not authorized to view this conversation" });
      }

      const conversationMessages = await db
        .select({
          id: messages.id,
          content: messages.content,
          createdAt: messages.createdAt,
          userId: messages.userId,
          userName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`,
          userEmail: users.email
        })
        .from(messages)
        .leftJoin(users, eq(messages.userId, users.id))
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

      res.json(conversationMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.id;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Verify user is participant
      const participant = await db
        .select()
        .from(conversationParticipants)
        .where(and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        ))
        .limit(1);

      if (participant.length === 0) {
        return res.status(403).json({ message: "Not authorized to post to this conversation" });
      }

      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId,
          userId,
          content: content.trim()
        })
        .returning();

      // Get user info for response
      const [user] = await db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        })
        .from(users)
        .where(eq(users.id, userId));

      const messageWithUser = {
        ...newMessage,
        userName: user ? `${user.firstName} ${user.lastName}` : user?.email || 'Unknown User',
        userEmail: user?.email
      };

      res.json(messageWithUser);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Create group conversation
  app.post("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const { name, type = "group", participantIds = [] } = req.body;
      const userId = req.user.id;

      if (!name) {
        return res.status(400).json({ message: "Conversation name is required" });
      }

      // Create conversation
      const [conversation] = await db
        .insert(conversations)
        .values({
          type,
          name
        })
        .returning();

      // Add creator as participant
      await db.insert(conversationParticipants).values({
        conversationId: conversation.id,
        userId
      });

      // Add other participants
      if (participantIds.length > 0) {
        const participants = participantIds.map((id: string) => ({
          conversationId: conversation.id,
          userId: id
        }));
        await db.insert(conversationParticipants).values(participants);
      }

      res.json({
        ...conversation,
        participantCount: 1 + participantIds.length
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Delete message
  app.delete("/api/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const userId = req.user.id;

      // Verify user owns the message
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (message.userId !== userId) {
        return res.status(403).json({ message: "Can only delete your own messages" });
      }

      await db.delete(messages).where(eq(messages.id, messageId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });
}