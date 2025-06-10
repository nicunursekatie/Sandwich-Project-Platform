import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { sanitizeMiddleware } from "../middleware/sanitizer";
import { insertMessageSchema } from "@shared/schema";

const router = Router();

// Message management routes
router.get("/messages", async (req, res) => {
  try {
    const committee = req.query.committee as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    let messages;
    if (committee) {
      messages = await storage.getMessagesByCommittee(committee);
    } else if (limit) {
      messages = await storage.getRecentMessages(limit);
    } else {
      messages = await storage.getAllMessages();
    }
    
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