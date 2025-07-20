import { logger } from "../utils/logger";
import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { sanitizeMiddleware } from "../middleware/sanitizer";
import { insertMessageSchema } from "@shared/schema";

const router = Router();

// UPDATED: Unified message management routes using new conversation system
router.get("/messages", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    logger.info(`🔍 API QUERY: /messages - limit: ${limit}`);

    let messages;
    if (limit) {
      messages = await storage.getRecentMessages(limit);
    } else {
      messages = await storage.getAllMessages();
    }
    
    logger.info(`📤 API RESPONSE: Returning ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    logger.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.get("/messages/:id/thread", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const messages = await storage.getThreadMessages(id);
    res.json(messages);
  } catch (error) {
    logger.error("Error fetching thread messages:", error);
    res.status(500).json({ error: "Failed to fetch thread messages" });
  }
});

router.post("/messages", sanitizeMiddleware, async (req, res) => {
  try {
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error?.message || String(error) });
    }
    
    const { parentId, ...messageData } = result.data;
    
    let message;
    if (parentId) {
      message = await storage.createReply(messageData, parentId);
    } else {
      message = await storage.createMessage(messageData);
    }
    
    // Broadcast notification for new messages
    logger.info('Broadcasting new message notification:', message);
    if ((global as any).broadcastNewMessage) {
      (global as any).broadcastNewMessage(message);
      logger.info('Message broadcast sent successfully');
    } else {
      logger.error('broadcastNewMessage function not available');
    }
    
    res.status(201).json(message);
  } catch (error) {
    logger.error("Error creating message:", error);
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
    logger.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export { router as messagesRoutes };