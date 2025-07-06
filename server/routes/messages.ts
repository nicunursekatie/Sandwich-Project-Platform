import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { sanitizeMiddleware } from "../middleware/sanitizer";
import { insertMessageSchema } from "@shared/schema";

const router = Router();

// FIXED: Message management routes with threadId isolation
router.get("/messages", async (req, res) => {
  try {
    const committee = req.query.committee as string;
    const threadId = req.query.threadId ? parseInt(req.query.threadId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    console.log(`🔍 API QUERY: /messages - committee: ${committee}, threadId: ${threadId}, limit: ${limit}`);

    let messages;
    if (threadId) {
      // Preferred: Query by specific threadId for proper isolation
      messages = await storage.getMessagesByThreadId(threadId);
      console.log(`✅ Using threadId-based query: ${threadId}`);
    } else if (committee && threadId !== undefined) {
      // Legacy support with threadId filtering
      messages = await storage.getMessagesByCommittee(committee, threadId);
      console.log(`⚠️  Using legacy committee query with threadId: ${committee}, ${threadId}`);
    } else if (committee) {
      // Legacy fallback - should be avoided
      messages = await storage.getMessagesByCommittee(committee);
      console.log(`❌ LEGACY: Using committee-only query (potential cross-chat contamination): ${committee}`);
    } else if (limit) {
      messages = await storage.getRecentMessages(limit);
    } else {
      messages = await storage.getAllMessages();
    }
    
    console.log(`📤 API RESPONSE: Returning ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.get("/messages/:id/thread", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const messages = await storage.getThreadMessages(id);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    res.status(500).json({ error: "Failed to fetch thread messages" });
  }
});

router.post("/messages", sanitizeMiddleware, async (req, res) => {
  try {
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.message });
    }
    
    const { parentId, ...messageData } = result.data;
    
    let message;
    if (parentId) {
      message = await storage.createReply(messageData, parentId);
    } else {
      message = await storage.createMessage(messageData);
    }
    
    // Broadcast notification for new messages
    console.log('Broadcasting new message notification:', message);
    if ((global as any).broadcastNewMessage) {
      (global as any).broadcastNewMessage(message);
      console.log('Message broadcast sent successfully');
    } else {
      console.error('broadcastNewMessage function not available');
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to create message" });
  }
});

router.delete("/messages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteMessage(id);
    if (!success) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export { router as messagesRoutes };