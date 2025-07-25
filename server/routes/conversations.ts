
import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { db } from "../db";
import { conversations, conversationParticipants } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all conversations for a user
router.get("/conversations", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      console.log('DEBUG: No user ID found in request, user object:', (req as any).user);
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const { type } = req.query;
    
    // Temporary implementation: Query conversations with user participation directly
    let userConversations = await db
      .select({
        id: conversations.id,
        type: conversations.type,
        name: conversations.name,
        createdAt: conversations.createdAt
      })
      .from(conversations)
      .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
      .where(eq(conversationParticipants.userId, userId));
    
    // Filter by type if requested
    if (type) {
      userConversations = userConversations.filter(conv => conv.type === type);
    }
    
    res.json(userConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Create a new conversation
router.post("/conversations", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    console.log('DEBUG: POST /conversations - User object:', (req as any).user);
    console.log('DEBUG: POST /conversations - User ID:', userId);
    if (!userId) {
      console.log('DEBUG: POST /conversations - No user ID found, rejecting request');
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const { type, name, participants } = req.body;
    
    const conversation = await storage.createConversation({
      type,
      name,
      createdBy: userId
    }, participants);
    
    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get messages for a conversation
router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      console.log('DEBUG: No user ID found in get messages, user object:', (req as any).user);
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const conversationId = parseInt(req.params.id);
    const messages = await storage.getConversationMessages(conversationId, userId);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message to conversation
router.post("/conversations/:id/messages", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      console.log('DEBUG: No user ID found in send message, user object:', (req as any).user);
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const conversationId = parseInt(req.params.id);
    const { content, replyToMessageId, replyToContent, replyToSender } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }
    
    // Get user display name
    const user = await storage.getUser(userId);
    const senderName = user ? (user.displayName || user.firstName || user.email || 'Unknown User') : 'Unknown User';
    
    const message = await storage.addConversationMessage({
      conversationId,
      userId,
      content: content.trim(),
      sender: senderName,
      contextType: 'group',
      contextId: conversationId.toString(),
      replyToMessageId: replyToMessageId || null,
      replyToContent: replyToContent || null,
      replyToSender: replyToSender || null,
    });
    
    // Broadcast the message via WebSocket
    if ((global as any).broadcastNewMessage) {
      await (global as any).broadcastNewMessage({
        type: 'new_message',
        message,
        context: {
          type: 'group',
          id: conversationId.toString(),
        }
      });
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Update a message in a conversation
router.patch("/conversations/:id/messages/:messageId", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const messageId = parseInt(req.params.messageId);
    const { content } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }
    
    const updatedMessage = await storage.updateConversationMessage(messageId, userId, {
      content: content.trim(),
    });
    
    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found or not authorized" });
    }
    
    res.json(updatedMessage);
  } catch (error) {
    console.error("Error updating conversation message:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete a message from a conversation
router.delete("/conversations/:id/messages/:messageId", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const messageId = parseInt(req.params.messageId);
    
    const success = await storage.deleteConversationMessage(messageId, userId);
    
    if (!success) {
      return res.status(404).json({ error: "Message not found or not authorized" });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting conversation message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Get participants for a conversation
router.get("/conversations/:id/participants", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      console.log('DEBUG: No user ID found in get participants, user object:', (req as any).user);
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    const conversationId = parseInt(req.params.id);
    const participants = await storage.getConversationParticipants(conversationId);
    console.log(`[PARTICIPANTS] Found ${participants.length} participants for conversation ${conversationId}`);
    res.json(participants);
  } catch (error) {
    console.error("Error fetching conversation participants:", error);
    res.status(500).json({ error: "Failed to fetch participants" });
  }
});

export { router as conversationsRoutes };
