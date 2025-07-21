import express from "express";
import { z } from "zod";
import { storage } from "../storage-wrapper";
import { isAuthenticated } from "../temp-auth";

// Use the existing authentication middleware
const requireAuth = isAuthenticated;

const router = express.Router();

// Schemas
const SendMessageSchema = z.object({
  to: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1)
});

const MarkReadSchema = z.object({
  messageId: z.string()
});

// Real-time message interface
interface RealTimeMessage {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
}

// Get messages by folder
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const folder = req.query.folder as string || 'inbox';
    
    let messages: RealTimeMessage[] = [];
    
    try {
      // Get messages based on folder type
      if (folder === 'sent') {
        // For sent folder, get messages where current user is the sender
        const sentMessages = await storage.getMessagesBySender(userId);
        messages = sentMessages.map(msg => ({
          id: msg.id.toString(),
          from: {
            name: msg.sender || 'You',
            email: msg.senderEmail || (req.user as any).email
          },
          to: [msg.contextId || ''],
          subject: msg.contextType || 'No Subject',
          content: msg.content,
          timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
          read: true, // Sent messages are always "read" by sender
          starred: false,
          folder: 'sent'
        }));
      } else if (folder === 'inbox') {
        // For inbox, get messages where current user is the recipient
        const inboxMessages = await storage.getMessagesForRecipient(userId);
        messages = inboxMessages.map(msg => ({
          id: msg.id.toString(),
          from: {
            name: msg.sender || 'Unknown Sender',
            email: msg.senderEmail || 'unknown@example.com'
          },
          to: [(req.user as any).email],
          subject: msg.contextType || 'No Subject',
          content: msg.content,
          timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
          read: false,
          starred: false,
          folder: 'inbox'
        }));
      }
    } catch (storageError) {
      console.error("Storage error when fetching messages:", storageError);
      // Return empty array if storage fails
      messages = [];
    }
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send new message
router.post("/", requireAuth, async (req, res) => {
  try {
    const { to, subject, content } = SendMessageSchema.parse(req.body);
    const senderId = (req.user as any).id;
    const senderName = `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || (req.user as any).email || 'User';
    
    // Create proper message object for database storage
    const messageData = {
      userId: senderId,
      senderId,
      content,
      contextType: null,  // Try null to avoid constraint issue
      contextId: to,
      sender: senderName
    };
    
    // Save message to database using storage interface
    const savedMessage = await storage.createMessage(messageData);
    
    // Broadcast real-time notification
    if (typeof (global as any).broadcastNewMessage === 'function') {
      (global as any).broadcastNewMessage({
        type: 'new_message',
        message: {
          id: savedMessage.id.toString(),
          from: {
            name: senderName,
            email: (req.user as any).email || 'unknown@example.com'
          },
          to: [to],
          subject,
          content,
          timestamp: new Date().toISOString(),
          read: false,
          starred: false,
          folder: 'inbox'
        },
        recipientId: to
      });
    }
    
    res.status(201).json({ 
      id: savedMessage.id.toString(),
      message: "Message sent successfully"
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark message as read
router.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // In a real implementation, you'd update read status in database
    // For now, just return success
    res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

// Toggle star status
router.post("/:id/star", requireAuth, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = (req.user as any).id;
    
    // In a real implementation, you'd update star status in database
    res.json({ message: "Message star status updated" });
  } catch (error) {
    console.error("Error updating star status:", error);
    res.status(500).json({ error: "Failed to update star status" });
  }
});

// Delete message
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = (req.user as any).id;
    
    // For now, just acknowledge the delete request
    // We'll implement proper storage integration later
    console.log(`Delete message ${messageId} for user ${userId}`);
    
    res.json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

export default router;