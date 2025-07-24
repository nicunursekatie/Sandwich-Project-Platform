import { Router } from "express";
import { z } from "zod";
import { eq, and, or, desc, isNull, sql } from "drizzle-orm";
import { db } from "../db";
import { 
  emailMessages, 
  emailDrafts, 
  users,
  insertEmailMessageSchema,
  insertEmailDraftSchema 
} from "@shared/schema";

const router = Router();

// Get messages by folder
router.get("/", async (req, res) => {
  try {
    const { folder } = req.query;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let whereCondition;
    
    switch (folder) {
      case "inbox":
        whereCondition = and(
          eq(emailMessages.recipientId, userId),
          eq(emailMessages.isTrashed, false),
          eq(emailMessages.isArchived, false),
          eq(emailMessages.isDraft, false)
        );
        break;
      case "sent":
        whereCondition = and(
          eq(emailMessages.senderId, userId),
          eq(emailMessages.isTrashed, false),
          eq(emailMessages.isDraft, false)
        );
        break;
      case "drafts":
        whereCondition = and(
          eq(emailMessages.senderId, userId),
          eq(emailMessages.isDraft, true)
        );
        break;
      case "starred":
        whereCondition = and(
          or(
            eq(emailMessages.senderId, userId),
            eq(emailMessages.recipientId, userId)
          ),
          eq(emailMessages.isStarred, true),
          eq(emailMessages.isTrashed, false)
        );
        break;
      case "archived":
        whereCondition = and(
          eq(emailMessages.recipientId, userId),
          eq(emailMessages.isArchived, true),
          eq(emailMessages.isTrashed, false)
        );
        break;
      case "trash":
        whereCondition = and(
          or(
            eq(emailMessages.senderId, userId),
            eq(emailMessages.recipientId, userId)
          ),
          eq(emailMessages.isTrashed, true)
        );
        break;
      default:
        // All messages
        whereCondition = or(
          eq(emailMessages.senderId, userId),
          eq(emailMessages.recipientId, userId)
        );
    }

    const messages = await db
      .select()
      .from(emailMessages)
      .where(whereCondition)
      .orderBy(desc(emailMessages.createdAt));

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a new message
router.post("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { recipientId, subject, content, contextType, contextId, contextTitle } = req.body;

    // Get sender and recipient info
    const [sender, recipient] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(users).where(eq(users.id, recipientId)).limit(1)
    ]);

    if (!sender[0] || !recipient[0]) {
      return res.status(400).json({ error: "Invalid sender or recipient" });
    }

    const messageData = {
      senderId: userId,
      senderName: `${sender[0].firstName} ${sender[0].lastName}`,
      senderEmail: sender[0].email || '',
      recipientId,
      recipientName: `${recipient[0].firstName} ${recipient[0].lastName}`,
      recipientEmail: recipient[0].email || '',
      subject,
      content,
      contextType,
      contextId,
      contextTitle,
      isDraft: false
    };

    const [newMessage] = await db
      .insert(emailMessages)
      .values(messageData)
      .returning();

    res.json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Reply to a message
router.post("/reply", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { parentMessageId, recipientId, subject, content } = req.body;

    // Get sender and recipient info
    const [sender, recipient] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(users).where(eq(users.id, recipientId)).limit(1)
    ]);

    if (!sender[0] || !recipient[0]) {
      return res.status(400).json({ error: "Invalid sender or recipient" });
    }

    const messageData = {
      senderId: userId,
      senderName: `${sender[0].firstName} ${sender[0].lastName}`,
      senderEmail: sender[0].email || '',
      recipientId,
      recipientName: `${recipient[0].firstName} ${recipient[0].lastName}`,
      recipientEmail: recipient[0].email || '',
      subject,
      content,
      parentMessageId,
      isDraft: false
    };

    const [newMessage] = await db
      .insert(emailMessages)
      .values(messageData)
      .returning();

    res.json(newMessage);
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({ error: "Failed to send reply" });
  }
});

// Mark messages as read
router.patch("/mark-read", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { messageIds } = req.body;
    
    await db
      .update(emailMessages)
      .set({ 
        isRead: true, 
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(emailMessages.recipientId, userId),
        sql`${emailMessages.id} = ANY(${messageIds})`
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// Star/unstar a message
router.patch("/:id/star", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { isStarred } = req.body;

    await db
      .update(emailMessages)
      .set({ 
        isStarred, 
        updatedAt: new Date()
      })
      .where(and(
        eq(emailMessages.id, parseInt(id)),
        or(
          eq(emailMessages.senderId, userId),
          eq(emailMessages.recipientId, userId)
        )
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating star status:", error);
    res.status(500).json({ error: "Failed to update star status" });
  }
});

// Archive messages
router.patch("/archive", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { messageIds } = req.body;
    
    await db
      .update(emailMessages)
      .set({ 
        isArchived: true, 
        updatedAt: new Date()
      })
      .where(and(
        eq(emailMessages.recipientId, userId),
        sql`${emailMessages.id} = ANY(${messageIds})`
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error archiving messages:", error);
    res.status(500).json({ error: "Failed to archive messages" });
  }
});

// Move messages to trash
router.patch("/trash", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { messageIds } = req.body;
    
    await db
      .update(emailMessages)
      .set({ 
        isTrashed: true, 
        updatedAt: new Date()
      })
      .where(and(
        or(
          eq(emailMessages.senderId, userId),
          eq(emailMessages.recipientId, userId)
        ),
        sql`${emailMessages.id} = ANY(${messageIds})`
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error moving messages to trash:", error);
    res.status(500).json({ error: "Failed to move messages to trash" });
  }
});

// Delete messages permanently
router.delete("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { messageIds } = req.body;
    
    await db
      .delete(emailMessages)
      .where(and(
        or(
          eq(emailMessages.senderId, userId),
          eq(emailMessages.recipientId, userId)
        ),
        sql`${emailMessages.id} = ANY(${messageIds})`
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting messages:", error);
    res.status(500).json({ error: "Failed to delete messages" });
  }
});

// Drafts endpoints

// Get drafts
router.get("/drafts", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const drafts = await db
      .select()
      .from(emailDrafts)
      .where(eq(emailDrafts.userId, userId))
      .orderBy(desc(emailDrafts.lastSaved));

    res.json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
});

// Save draft
router.post("/drafts", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const draftData = {
      ...req.body,
      userId,
      lastSaved: new Date()
    };

    const [newDraft] = await db
      .insert(emailDrafts)
      .values(draftData)
      .returning();

    res.json(newDraft);
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ error: "Failed to save draft" });
  }
});

// Update draft
router.put("/drafts/:id", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastSaved: new Date()
    };

    const [updatedDraft] = await db
      .update(emailDrafts)
      .set(updateData)
      .where(and(
        eq(emailDrafts.id, parseInt(id)),
        eq(emailDrafts.userId, userId)
      ))
      .returning();

    res.json(updatedDraft);
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({ error: "Failed to update draft" });
  }
});

// Delete draft
router.delete("/drafts/:id", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    await db
      .delete(emailDrafts)
      .where(and(
        eq(emailDrafts.id, parseInt(id)),
        eq(emailDrafts.userId, userId)
      ));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    res.status(500).json({ error: "Failed to delete draft" });
  }
});

export default router;