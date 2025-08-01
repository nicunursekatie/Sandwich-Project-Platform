import { Router } from "express";
import { z } from "zod";
import { messagingService } from "../services/messaging-service";
import { isAuthenticated } from "../temp-auth";

const router = Router();

// All messaging routes require authentication
router.use(isAuthenticated);

// Send message schema
const sendMessageSchema = z.object({
  recipientIds: z.array(z.string()).min(1),
  content: z.string().min(1).max(5000),
  contextType: z.enum(['suggestion', 'project', 'task', 'direct']).optional(),
  contextId: z.string().optional(),
  parentMessageId: z.number().optional(),
});

// Send kudos schema
const sendKudosSchema = z.object({
  recipientId: z.string(),
  contextType: z.enum(['project', 'task']),
  contextId: z.string(),
  entityName: z.string(),
  content: z.string().optional(),
});

/**
 * Send a message
 */
router.post("/send", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      console.error("Send message: User not authenticated");
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Send message request:", { userId: user.id, body: req.body });

    const result = sendMessageSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Send message validation failed:", result.error.errors);
      return res.status(400).json({ 
        error: "Invalid request", 
        details: result.error.errors 
      });
    }

    if (!result.data.recipientIds || result.data.recipientIds.length === 0) {
      console.error("No recipients specified");
      return res.status(400).json({ error: "At least one recipient is required" });
    }

    if (!result.data.content || result.data.content.trim().length === 0) {
      console.error("No content specified");
      return res.status(400).json({ error: "Message content is required" });
    }

    const message = await messagingService.sendMessage({
      senderId: user.id,
      ...result.data,
    });

    console.log("Message sent successfully:", message.id);

    res.status(201).json({ 
      success: true, 
      message 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message", details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Send kudos
 */
router.post("/kudos", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const result = sendKudosSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        details: result.error.errors 
      });
    }

    const { recipientId, contextType, contextId, entityName, content } = result.data;

    // Check if kudos already sent
    const alreadySent = await messagingService.hasKudosSent(
      user.id,
      recipientId,
      contextType,
      contextId
    );

    if (alreadySent) {
      return res.status(409).json({ 
        error: "Kudos already sent",
        alreadySent: true 
      });
    }

    const kudosResult = await messagingService.sendKudos({
      senderId: user.id,
      recipientId,
      content: content || `🎉 Kudos! Great job completing ${entityName}!`,
      contextType,
      contextId,
      entityName,
    });

    res.status(201).json({ 
      success: true,
      message: kudosResult.message,
      alreadySent: kudosResult.alreadySent,
    });
  } catch (error) {
    console.error("Error sending kudos:", error);
    res.status(500).json({ error: "Failed to send kudos" });
  }
});

/**
 * Check if kudos was sent
 */
router.get("/kudos/check", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { recipientId, contextType, contextId } = req.query;

    if (!recipientId || !contextType || !contextId) {
      return res.status(400).json({ 
        error: "Missing required parameters" 
      });
    }

    const sent = await messagingService.hasKudosSent(
      user.id,
      recipientId as string,
      contextType as string,
      contextId as string
    );

    res.json({ sent });
  } catch (error) {
    console.error("Error checking kudos status:", error);
    res.status(500).json({ error: "Failed to check kudos status" });
  }
});

/**
 * Get received kudos for current user
 */
router.get("/kudos/received", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const kudosMessages = await messagingService.getReceivedKudos(user.id);

    res.status(200).json(kudosMessages);
  } catch (error) {
    console.error("Error fetching received kudos:", error);
    res.status(500).json({ error: "Failed to fetch kudos", details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get unread messages
 */
router.get("/unread", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { contextType, limit = "50", offset = "0", groupByContext } = req.query;

    // If groupByContext is requested, return counts by context type
    if (groupByContext === 'true') {
      const contextCounts = await messagingService.getUnreadCountsByContext(user.id);
      return res.json(contextCounts);
    }

    const messages = await messagingService.getUnreadMessages(user.id, {
      contextType: contextType as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    // Debug: Check for incomplete messages before sending
    const incompleteMessages = messages.filter(msg => !msg || !msg.senderName || !msg.content);
    if (incompleteMessages.length > 0) {
      console.error('Found incomplete messages being sent to frontend:', incompleteMessages);
    }

    console.log('Sending messages to frontend. Total:', messages.length, 'Valid:', messages.filter(msg => msg && msg.senderName && msg.content).length);

    res.json({ messages });
  } catch (error) {
    console.error("Error getting unread messages:", error);
    res.status(500).json({ error: "Failed to get unread messages" });
  }
});

/**
 * Get messages for a context
 */
router.get("/context/:contextType/:contextId", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { contextType, contextId } = req.params;
    const { limit = "50", offset = "0" } = req.query;

    // Validate user has access to this context
    const hasAccess = await messagingService.validateContextAccess(
      user.id,
      contextType,
      contextId
    );

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await messagingService.getContextMessages(
      contextType,
      contextId,
      {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      }
    );

    // Debug: Check for incomplete messages before sending
    const incompleteMessages = messages.filter(msg => !msg || !msg.senderName || !msg.content);
    if (incompleteMessages.length > 0) {
      console.error('Found incomplete messages being sent to frontend:', incompleteMessages);
    }

    console.log('Sending messages to frontend. Total:', messages.length, 'Valid:', messages.filter(msg => msg && msg.senderName && msg.content).length);

    res.json({ messages });
  } catch (error) {
    console.error("Error getting context messages:", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

/**
 * Mark message as read
 */
router.post("/:messageId/read", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const messageId = parseInt(req.params.messageId);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const success = await messagingService.markMessageRead(user.id, messageId);
    res.json({ success });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

/**
 * Mark all messages as read
 */
router.post("/mark-all-read", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { contextType } = req.body;

    const count = await messagingService.markAllMessagesRead(
      user.id,
      contextType
    );

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

/**
 * Edit a message
 */
router.put("/:messageId", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const messageId = parseInt(req.params.messageId);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const { content } = req.body;
    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Content is required" });
    }

    const message = await messagingService.editMessage(
      messageId,
      user.id,
      content
    );

    res.json({ success: true, message });
  } catch (error: any) {
    console.error("Error editing message:", error);
    if (error.message?.includes("edit window") || error.message?.includes("sender")) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to edit message" });
    }
  }
});

/**
 * Delete a message (soft delete)
 */
router.delete("/:messageId", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const messageId = parseInt(req.params.messageId);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const success = await messagingService.deleteMessage(messageId, user.id);
    if (!success) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    if (error.message?.includes("sender")) {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to delete message" });
    }
  }
});

// Get all messages for a user
router.get("/messages", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { contextType } = req.query;

    // Set no-cache headers to prevent stale data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    let messages;
    if (contextType && contextType !== 'all') {
      messages = await messagingService.getUnreadMessages(user.id, { 
        contextType: contextType as string 
      });
    } else {
      // Get all messages for this user
      const allUnread = await messagingService.getUnreadMessages(user.id);
      const contextMessages = await messagingService.getContextMessages('direct', user.id);
      messages = [...allUnread, ...contextMessages];
    }

    // Filter out messages with missing user data and provide fallbacks
    const validMessages = messages.map(msg => ({
      ...msg,
      senderName: msg.senderName || msg.sender || 'Unknown User',
      senderEmail: msg.senderEmail || undefined
    })).filter(msg => msg.id && msg.content);

    res.json({ messages: validMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * Get all messages (inbox and sent combined)
 */
router.get("/all", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { contextType, limit = "50", offset = "0" } = req.query;

    const messages = await messagingService.getAllMessages(user.id, {
      contextType: contextType as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching all messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * Get sent messages only
 */
router.get("/sent", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { contextType, limit = "50", offset = "0" } = req.query;

    const messages = await messagingService.getSentMessages(user.id, {
      contextType: contextType as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res.status(500).json({ error: "Failed to fetch sent messages" });
  }
});

/**
 * Get inbox messages (received messages only)
 */
router.get("/inbox", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { contextType, limit = "50", offset = "0" } = req.query;

    const messages = await messagingService.getInboxMessages(user.id, {
      contextType: contextType as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching inbox messages:", error);
    res.status(500).json({ error: "Failed to fetch inbox messages" });
  }
});

/**
 * Get sent messages
 */
router.get("/sent", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { limit = "50", offset = "0" } = req.query;

    const messages = await messagingService.getSentMessages(user.id, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error getting sent messages:", error);
    res.status(500).json({ error: "Failed to get sent messages" });
  }
});

/**
 * Get draft messages
 */
router.get("/drafts", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { limit = "50", offset = "0" } = req.query;

    const messages = await messagingService.getDraftMessages(user.id, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error getting draft messages:", error);
    res.status(500).json({ error: "Failed to get draft messages" });
  }
});

/**
 * Save draft message
 */
router.post("/drafts", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { recipientIds, content, subject, contextType, contextId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required for draft" });
    }

    const draft = await messagingService.saveDraft({
      senderId: user.id,
      recipientIds: recipientIds || [],
      content,
      subject,
      contextType,
      contextId,
    });

    res.status(201).json({ success: true, draft });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ error: "Failed to save draft" });
  }
});

/**
 * Reply to message
 */
router.post("/:messageId/reply", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const messageId = parseInt(req.params.messageId);
    if (isNaN(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Reply content is required" });
    }

    const reply = await messagingService.replyToMessage({
      senderId: user.id,
      originalMessageId: messageId,
      content: content.trim(),
    });

    res.status(201).json({ success: true, reply });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({ error: "Failed to send reply" });
  }
});

export { router as messagingRoutes };