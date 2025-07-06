import { Request, Response } from "express";
import { storage } from "../storage-wrapper";
import { eq, sql, and } from "drizzle-orm";
import { messages, messageReads } from "../../shared/schema";
import { db } from "../db";

// Helper function to check if user has permission for specific chat type
function checkUserChatPermission(user: any, chatType: string): boolean {
  if (!user || !user.permissions) return false;
  
  const permissions = user.permissions;
  
  switch (chatType) {
    case 'core_team':
      return permissions.includes('core_team_chat');
    case 'committee':
      return permissions.includes('committee_chat');
    case 'hosts':
      return permissions.includes('host_chat');
    case 'drivers':
      return permissions.includes('driver_chat');
    case 'recipients':
      return permissions.includes('recipient_chat');
    case 'direct':
      return permissions.includes('direct_messages');
    case 'groups':
      return permissions.includes('group_messages');
    case 'general':
      return permissions.includes('general_chat');
    default:
      return permissions.includes('general_chat'); // Default to general chat permission
  }
}

export const messageNotificationRoutes = {
  // Get unread message counts for a user
  getUnreadCounts: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = (req as any).user;
      
      // Initialize counts with fallback response
      let unreadCounts = {
        general: 0,
        committee: 0,
        hosts: 0,
        drivers: 0,
        recipients: 0,
        core_team: 0,
        direct: 0,
        groups: 0,
        total: 0
      };

      try {
        // Get unread counts for regular committee messages (excluding groups and direct)
        const regularMessages = await db
          .select({
            committee: messages.committee,
            count: sql<number>`count(*)`
          })
          .from(messages)
          .leftJoin(messageReads, and(
            eq(messageReads.messageId, messages.id),
            eq(messageReads.userId, userId)
          ))
          .where(and(
            sql`${messages.groupId} IS NULL`, // Not group messages
            sql`${messages.committee} != 'direct'`, // Not direct messages
            sql`${messageReads.id} IS NULL`, // Not read by user
            sql`${messages.userId} != ${userId}` // Don't count own messages
          ))
          .groupBy(messages.committee);

        // Get unread counts for group messages
        const groupMessages = await db
          .select({
            count: sql<number>`count(*)`
          })
          .from(messages)
          .leftJoin(messageReads, and(
            eq(messageReads.messageId, messages.id),
            eq(messageReads.userId, userId)
          ))
          .where(and(
            sql`${messages.groupId} IS NOT NULL`, // Group messages
            sql`${messageReads.id} IS NULL`, // Not read by user
            sql`${messages.userId} != ${userId}` // Don't count own messages
          ));

        // Get direct messages count  
        const directMessages = await db
          .select({
            count: sql<number>`count(*)`
          })
          .from(messages)
          .leftJoin(messageReads, and(
            eq(messageReads.messageId, messages.id),
            eq(messageReads.userId, userId)
          ))
          .where(and(
            eq(messages.committee, 'direct'),
            eq(messages.recipientId, userId),
            sql`${messageReads.id} IS NULL`, // Not read by user
            sql`${messages.userId} != ${userId}` // Don't count own messages
          ));

        // Process regular message counts with permission filtering
        for (const msg of regularMessages) {
          const committee = msg.committee as string;
          const count = Number(msg.count) || 0;
          
          // Only count if user has permission for this chat type
          if (checkUserChatPermission(user, committee) && committee in unreadCounts) {
            (unreadCounts as any)[committee] = count;
          }
        }

        // Add group message count if user has permission
        if (checkUserChatPermission(user, 'groups') && groupMessages.length > 0) {
          unreadCounts.groups = Number(groupMessages[0].count) || 0;
        }

        // Add direct message count if user has permission
        if (checkUserChatPermission(user, 'direct') && directMessages.length > 0) {
          unreadCounts.direct = Number(directMessages[0].count) || 0;
        }

        // Calculate total
        unreadCounts.total = Object.values(unreadCounts).reduce((sum, count) => {
          return typeof count === 'number' ? sum + count : sum;
        }, 0) - unreadCounts.total; // Subtract total to avoid double counting

      } catch (dbError) {
        console.error('Database query error in unread counts:', dbError);
        // Return fallback counts on database error
      }

      res.json(unreadCounts);
    } catch (error) {
      console.error("Error getting unread counts:", error);
      res.status(500).json({ error: "Failed to get unread counts" });
    }
  },

  // Mark messages as read when user views a chat
  markMessagesRead: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { committee, messageIds } = req.body;
      
      if (!committee) {
        return res.status(400).json({ error: "Committee is required" });
      }

      try {
        // Get messages that need to be marked as read
        let messagesToMark;
        
        if (messageIds && messageIds.length > 0) {
          // Mark specific messages as read
          messagesToMark = await db
            .select({ id: messages.id })
            .from(messages)
            .where(and(
              sql`${messages.id} = ANY(${messageIds})`,
              sql`${messages.userId} != ${userId}` // Don't mark own messages
            ));
        } else {
          // Mark all messages in committee as read
          if (committee === 'direct') {
            messagesToMark = await db
              .select({ id: messages.id })
              .from(messages)
              .where(and(
                eq(messages.committee, 'direct'),
                eq(messages.recipientId, userId),
                sql`${messages.userId} != ${userId}` // Don't mark own messages
              ));
          } else {
            messagesToMark = await db
              .select({ id: messages.id })
              .from(messages)
              .where(and(
                eq(messages.committee, committee),
                sql`${messages.userId} != ${userId}` // Don't mark own messages
              ));
          }
        }

        // Insert read records for messages not already read
        if (messagesToMark && messagesToMark.length > 0) {
          const readRecords = messagesToMark.map(msg => ({
            messageId: msg.id,
            userId: userId,
            committee: committee
          }));

          // Use ON CONFLICT to avoid duplicates
          await db
            .insert(messageReads)
            .values(readRecords)
            .onConflictDoNothing({
              target: [messageReads.messageId, messageReads.userId]
            });

          res.json({ success: true, markedCount: messagesToMark.length });
        } else {
          res.json({ success: true, markedCount: 0 });
        }
      } catch (dbError) {
        console.error("Database error marking messages as read:", dbError);
        res.json({ success: true, markedCount: 0 }); // Graceful fallback
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  },

  // Mark all messages as read for user
  markAllRead: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = (req as any).user;

      try {
        // Get all unread messages that the user can access
        let allMessages = [];
        
        // Get unread committee messages (user has permission for)
        const committees = ['general', 'committee', 'hosts', 'drivers', 'recipients', 'core_team'];
        for (const committee of committees) {
          if (checkUserChatPermission(user, committee)) {
            const committeeMessages = await db
              .select({ id: messages.id })
              .from(messages)
              .leftJoin(messageReads, and(
                eq(messageReads.messageId, messages.id),
                eq(messageReads.userId, userId)
              ))
              .where(and(
                eq(messages.committee, committee),
                sql`${messageReads.id} IS NULL`,
                sql`${messages.userId} != ${userId}`
              ));
            
            allMessages.push(...committeeMessages.map(m => ({ ...m, committee })));
          }
        }

        // Get unread direct messages
        if (checkUserChatPermission(user, 'direct')) {
          const directMessages = await db
            .select({ id: messages.id })
            .from(messages)
            .leftJoin(messageReads, and(
              eq(messageReads.messageId, messages.id),
              eq(messageReads.userId, userId)
            ))
            .where(and(
              eq(messages.committee, 'direct'),
              eq(messages.recipientId, userId),
              sql`${messageReads.id} IS NULL`,
              sql`${messages.userId} != ${userId}`
            ));
          
          allMessages.push(...directMessages.map(m => ({ ...m, committee: 'direct' })));
        }

        // Get unread group messages
        if (checkUserChatPermission(user, 'groups')) {
          const groupMessages = await db
            .select({ id: messages.id })
            .from(messages)
            .leftJoin(messageReads, and(
              eq(messageReads.messageId, messages.id),
              eq(messageReads.userId, userId)
            ))
            .where(and(
              sql`${messages.groupId} IS NOT NULL`,
              sql`${messageReads.id} IS NULL`,
              sql`${messages.userId} != ${userId}`
            ));
          
          allMessages.push(...groupMessages.map(m => ({ ...m, committee: 'groups' })));
        }

        // Mark all as read
        if (allMessages.length > 0) {
          const readRecords = allMessages.map(msg => ({
            messageId: msg.id,
            userId: userId,
            committee: msg.committee
          }));

          await db
            .insert(messageReads)
            .values(readRecords)
            .onConflictDoNothing({
              target: [messageReads.messageId, messageReads.userId]
            });

          res.json({ success: true, markedCount: allMessages.length });
        } else {
          res.json({ success: true, markedCount: 0 });
        }
      } catch (dbError) {
        console.error("Database error marking all messages as read:", dbError);
        res.json({ success: true, markedCount: 0 }); // Graceful fallback
      }
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      res.status(500).json({ error: "Failed to mark all messages as read" });
    }
  }
};