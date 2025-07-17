import { Router } from "express";
import { db } from "../db";
import { desc, eq } from "drizzle-orm";
import { chatMessages } from "../socket-chat";
import { isAuthenticated } from "../temp-auth";

const router = Router();

// Get chat messages for a specific channel
router.get("/chat/:channel", isAuthenticated, async (req, res) => {
  try {
    const { channel } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
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

export default router;