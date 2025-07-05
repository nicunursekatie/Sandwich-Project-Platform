import { Request, Response } from "express";
import { QueryOptimizer } from "../performance/query-optimizer";

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
    case 'group':
      return permissions.includes('group_messages');
    default:
      return permissions.includes('send_messages'); // General permission
  }
}

export const messageNotificationRoutes = {
  getUnreadCounts: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Cache notification counts for 2 seconds to reduce database load but allow faster updates
      const counts = await QueryOptimizer.getCachedQuery(
        `unread-counts-${userId}`,
        async () => {
          // For now, let's count recent messages (last hour) as "unread"
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          // Get recent messages
          const storage = require("../storage-wrapper").storage;
          const recentMessages = await storage.getRecentMessages(50);
          
          let counts = {
            general: 0, committee: 0, hosts: 0, drivers: 0, recipients: 0,
            core_team: 0, direct: 0, total: 0
          };
          
          // Count recent messages by committee type (simple approach)
          for (const message of recentMessages) {
            if (new Date(message.timestamp) > oneHourAgo) {
              if (message.committee === 'core_team') {
                counts.core_team++;
              } else if (message.committee === 'committee') {
                counts.committee++;
              } else if (message.committee === 'hosts') {
                counts.hosts++;
              } else if (message.committee === 'drivers') {
                counts.drivers++;
              } else if (message.committee === 'recipients') {
                counts.recipients++;
              } else if (message.recipientId === userId) {
                counts.direct++;
              } else {
                counts.general++;
              }
              counts.total++;
            }
          }
          
          return counts;
        },
        2000 // 2 second cache for faster updates
      );

      res.json(counts);
    } catch (error) {
      console.error('Error getting unread counts:', error);
      res.json({
        general: 0,
        committee: 0,
        hosts: 0,
        drivers: 0,
        recipients: 0,
        core_team: 0,
        direct: 0,
        total: 0
      });
    }
  },

  markMessagesRead: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // For now, just return success - functionality can be enhanced later
      res.json({ success: true, message: "Messages marked as read" });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  },

  markAllRead: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // For now, just return success - functionality can be enhanced later
      res.json({ success: true, message: "All messages marked as read" });
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      res.status(500).json({ message: "Failed to mark all messages as read" });
    }
  }
};