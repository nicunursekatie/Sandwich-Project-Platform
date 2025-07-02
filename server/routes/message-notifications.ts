import { Request, Response } from "express";
import { storage } from "../storage-wrapper";
import { eq, sql, and, notInArray } from "drizzle-orm";
import { messages, messageReads } from "../../shared/schema";

// Simple fallback implementation for database access
async function getDatabase() {
  try {
    // Try to get database through storage wrapper
    if (storage && typeof (storage as any).getDB === 'function') {
      return await (storage as any).getDB();
    }
    
    // Fallback to returning null - component will handle gracefully
    return null;
  } catch (error) {
    console.error('Database access error:', error);
    return null;
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

      const db = await getDatabase();
      if (!db) {
        // Fallback response when database is not available
        return res.json({
          general: 0,
          committee: 0,
          hosts: 0,
          drivers: 0,
          recipients: 0,
          core_team: 0,
          direct: 0,
          groups: 0,
          total: 0
        });
      }

      // Get all messages that user has access to based on their permissions
      const user = (req as any).user;
      const userPermissions = user.permissions || [];
      const userRole = user.role || 'volunteer';

      // Initialize counts
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
        // Get unread counts for regular committee messages
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
            eq(messages.committee, sql`${messages.committee}`), // Not group messages
            sql`${messageReads.id} IS NULL` // Not read by user
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
            sql`${messageReads.id} IS NULL` // Not read by user
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
            sql`${messageReads.id} IS NULL`
          ));

        // Process regular message counts
        for (const msg of regularMessages) {
          const committee = msg.committee as string;
          const count = Number(msg.count) || 0;
          
          if (committee in unreadCounts) {
            (unreadCounts as any)[committee] = count;
          }
        }

        // Add group message count
        if (groupMessages.length > 0) {
          unreadCounts.groups = Number(groupMessages[0].count) || 0;
        }

        // Add direct message count
        if (directMessages.length > 0) {
          unreadCounts.direct = Number(directMessages[0].count) || 0;
        }

        // Calculate total
        unreadCounts.total = Object.values(unreadCounts).reduce((sum, count) => {
          return typeof count === 'number' ? sum + count : sum;
        }, 0) - unreadCounts.total; // Subtract total to avoid double counting

      } catch (dbError) {
        console.error('Database query error in unread counts:', dbError);
      }

      res.json(unreadCounts);

      // Define which committees user has access to based on permissions
      const accessibleCommittees = ['general']; // Everyone has general access
      
      if (userPermissions.includes('COMMITTEE_CHAT')) {
        accessibleCommittees.push('committee');
      }
      if (userPermissions.includes('HOST_CHAT')) {
        accessibleCommittees.push('hosts');
      }
      if (userPermissions.includes('DRIVER_CHAT')) {
        accessibleCommittees.push('drivers');
      }
      if (userPermissions.includes('RECIPIENT_CHAT')) {
        accessibleCommittees.push('recipients');
      }
      if (userPermissions.includes('MANAGE_USERS')) {
        accessibleCommittees.push('core_team');
      }
      
      // Always include direct messages
      accessibleCommittees.push('direct');

      const db = await getDatabase();
      
      // Get unread counts for each committee
      const unreadCounts: any = {};
      let totalUnread = 0;

      for (const committee of accessibleCommittees) {
        let query;
        
        if (committee === 'direct') {
          // For direct messages, get messages where user is sender or recipient
          query = db
            .select({ count: sql<number>`count(*)` })
            .from(messages)
            .leftJoin(messageReads, and(
              eq(messageReads.messageId, messages.id),
              eq(messageReads.userId, userId)
            ))
            .where(and(
              eq(messages.committee, 'direct'),
              sql`(${messages.recipientId} = ${userId} OR ${messages.userId} = ${userId})`,
              sql`${messageReads.id} IS NULL`, // Not read by this user
              sql`${messages.userId} != ${userId}` // Don't count own messages as unread
            ));
        } else {
          // For committee chats, get unread messages in that committee
          query = db
            .select({ count: sql<number>`count(*)` })
            .from(messages)
            .leftJoin(messageReads, and(
              eq(messageReads.messageId, messages.id),
              eq(messageReads.userId, userId)
            ))
            .where(and(
              eq(messages.committee, committee),
              sql`${messageReads.id} IS NULL`, // Not read by this user
              sql`${messages.userId} != ${userId}` // Don't count own messages as unread
            ));
        }

        const result = await query;
        const count = result[0]?.count || 0;
        unreadCounts[committee] = count;
        totalUnread += count;
      }

      unreadCounts.total = totalUnread;

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

      const db = await getDatabase();
      
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
              sql`(${messages.recipientId} = ${userId} OR ${messages.userId} = ${userId})`,
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
      if (messagesToMark.length > 0) {
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
      }

      res.json({ success: true, markedCount: messagesToMark.length });
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
      const userPermissions = user.permissions || [];

      // Get accessible committees (same logic as unread counts)
      const accessibleCommittees = ['general'];
      
      if (userPermissions.includes('COMMITTEE_CHAT')) {
        accessibleCommittees.push('committee');
      }
      if (userPermissions.includes('HOST_CHAT')) {
        accessibleCommittees.push('hosts');
      }
      if (userPermissions.includes('DRIVER_CHAT')) {
        accessibleCommittees.push('drivers');
      }
      if (userPermissions.includes('RECIPIENT_CHAT')) {
        accessibleCommittees.push('recipients');
      }
      if (userPermissions.includes('MANAGE_USERS')) {
        accessibleCommittees.push('core_team');
      }
      accessibleCommittees.push('direct');

      const db = await getDatabase();
      
      // Get all unread messages in accessible committees
      let allMessages = [];
      
      for (const committee of accessibleCommittees) {
        let query;
        
        if (committee === 'direct') {
          query = db
            .select({ id: messages.id })
            .from(messages)
            .leftJoin(messageReads, and(
              eq(messageReads.messageId, messages.id),
              eq(messageReads.userId, userId)
            ))
            .where(and(
              eq(messages.committee, 'direct'),
              sql`(${messages.recipientId} = ${userId} OR ${messages.userId} = ${userId})`,
              sql`${messageReads.id} IS NULL`,
              sql`${messages.userId} != ${userId}`
            ));
        } else {
          query = db
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
        }

        const committeeMessages = await query;
        allMessages.push(...committeeMessages.map(m => ({ ...m, committee })));
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
      }

      res.json({ success: true, markedCount: allMessages.length });
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      res.status(500).json({ error: "Failed to mark all messages as read" });
    }
  }
};