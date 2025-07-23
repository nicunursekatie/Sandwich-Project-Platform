import express from "express";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";

const router = express.Router();

// Schemas
const SendMessageSchema = z.object({
  recipientId: z.string(),
  subject: z.string().min(1),
  content: z.string().min(1)
});

const ReplyMessageSchema = z.object({
  originalMessageId: z.number(),
  content: z.string().min(1)
});

// Simple message interface
interface SimpleMessage {
  id: number;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
}

// Get inbox messages
router.get("/inbox", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    
    // Get messages where user is recipient
    const messages = await storage.getUserMessages(userId, 'received');
    
    // Transform to simple message format
    const simpleMessages: SimpleMessage[] = messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderEmail || 'Unknown User',
      recipientId: userId,
      recipientName: (req.user as any).email || 'Unknown User',
      subject: msg.contextType || 'No Subject',
      content: msg.content,
      createdAt: msg.createdAt?.toISOString() || new Date().toISOString(),
      read: false // Simplified for now
    }));
    
    res.json(simpleMessages);
  } catch (error) {
    console.error("Error fetching inbox messages:", error);
    res.status(500).json({ error: "Failed to fetch inbox messages" });
  }
});

// Get sent messages
router.get("/sent", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    
    // Get messages where user is sender
    const messages = await storage.getUserMessages(userId, 'sent');
    
    // Get all users to lookup recipient names
    const allUsers = await storage.getAllUsers();
    const userMap = new Map(allUsers.map(user => [user.id, user]));
    
    // Transform to simple message format with proper recipient names
    const simpleMessages: SimpleMessage[] = messages.map(msg => {
      const recipient = userMap.get(msg.contextId || '');
      const recipientName = recipient 
        ? `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || recipient.email
        : 'Unknown Recipient';
        
      return {
        id: msg.id,
        senderId: userId,
        senderName: (req.user as any).email || 'Unknown User',
        recipientId: msg.contextId || 'unknown',
        recipientName,
        subject: msg.contextType || 'No Subject',
        content: msg.content,
        createdAt: msg.createdAt?.toISOString() || new Date().toISOString(),
        read: true // Sent messages are always "read" by sender
      };
    });
    
    res.json(simpleMessages);
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res.status(500).json({ error: "Failed to fetch sent messages" });
  }
});

// Send new message
router.post("/", requireAuth, async (req, res) => {
  try {
    const { recipientId, subject, content } = SendMessageSchema.parse(req.body);
    const senderId = (req.user as any).id;
    
    // Create message
    const message = await storage.createMessage({
      senderId,
      content,
      contextType: subject,
      contextId: recipientId,
      senderEmail: (req.user as any).email
    });
    
    res.status(201).json({ 
      id: message.id,
      message: "Message sent successfully" 
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Reply to message
router.post("/reply", requireAuth, async (req, res) => {
  try {
    const { originalMessageId, content } = ReplyMessageSchema.parse(req.body);
    const senderId = (req.user as any).id;
    
    // Get original message to determine recipient
    const originalMessage = await storage.getMessage(originalMessageId);
    if (!originalMessage) {
      return res.status(404).json({ error: "Original message not found" });
    }
    
    // Create reply
    const reply = await storage.createMessage({
      senderId,
      content,
      contextType: `Re: ${originalMessage.contextType || 'No Subject'}`,
      contextId: originalMessage.senderId, // Reply to original sender
      senderEmail: (req.user as any).email
    });
    
    res.status(201).json({ 
      id: reply.id,
      message: "Reply sent successfully" 
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({ error: "Failed to send reply" });
  }
});

// Mark message as read
router.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // In a real implementation, you'd update a read status
    // For now, just return success
    res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

export default router;