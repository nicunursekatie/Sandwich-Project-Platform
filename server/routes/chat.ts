import { Router } from "express";
import { db } from "../db";
import { desc, eq } from "drizzle-orm";
import { chatMessages } from "../socket-chat";
import { isAuthenticated } from "../temp-auth";

const router = Router();

// Get chat messages for a specific channel
router.get("/:channel", isAuthenticated, async (req, res) => {
  try {
    const { channel } = req.params;
    const user = req.user!;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Check if user has permission for this chat channel
    const hasPermission = checkChatPermission(user, channel);
    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied to this chat channel" });
    }
    
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channel, channel))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
    
    // Reverse to get chronological order
    res.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});

// Send a message to a chat channel
router.post("/send", isAuthenticated, async (req, res) => {
  try {
    const { channel, content } = req.body;
    const user = req.user!;
    
    // Validate input
    if (!channel || !content || !content.trim()) {
      return res.status(400).json({ message: "Channel and content are required" });
    }
    
    // Check if user has permission for this chat channel
    const hasPermission = checkChatPermission(user, channel);
    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied to this chat channel" });
    }
    
    // Create the message
    const newMessage = await db
      .insert(chatMessages)
      .values({
        channel,
        userId: user.id,
        userName: user.firstName || user.email || "User",
        content: content.trim()
      })
      .returning();
    
    res.json(newMessage[0]);
  } catch (error) {
    console.error("Error sending chat message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Delete a chat message
router.delete("/:messageId", isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const user = req.user!;
    
    // Get the message to check ownership
    const message = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, parseInt(messageId)))
      .limit(1);
    
    if (!message.length) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if user can delete this message (owner or has moderation permission)
    const canDelete = message[0].userId === user.id || 
                     user.permissions?.includes("moderate_messages") ||
                     user.role === "admin" ||
                     user.role === "super_admin";
    
    if (!canDelete) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await db
      .delete(chatMessages)
      .where(eq(chatMessages.id, parseInt(messageId)));
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

function checkChatPermission(user: any, channel: string): boolean {
  const permissions = user.permissions || [];
  
  switch (channel) {
    case "general":
      return true; // Everyone can access general chat
    case "core-team":
      return permissions.includes("core_team_chat");
    case "committee":
      return permissions.includes("committee_chat");
    case "host":
      return permissions.includes("host_chat");
    case "driver":
      return permissions.includes("driver_chat");
    case "recipient":
      return permissions.includes("recipient_chat");
    default:
      return false;
  }
}

export default router;