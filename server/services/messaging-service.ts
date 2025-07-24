import { and, eq, sql, desc, inArray, isNull, lte, or, not } from "drizzle-orm";
import { db } from "../db";
import { 
  messages, 
  messageRecipients, 
  messageThreads, 
  kudosTracking,
  users,
  conversations,
  conversationParticipants,
  type Message,
  type MessageRecipient,
  type MessageThread,
  type InsertMessage,
  type InsertMessageRecipient,
  type InsertMessageThread,
  type InsertKudosTracking
} from "@shared/schema";
import { NotificationService } from "../notification-service";

export interface MessageWithSender extends Message {
  senderName?: string;
  senderEmail?: string;
}

export interface ConversationSummary {
  recipientId: string;
  recipientName?: string;
  lastMessage?: MessageWithSender;
  unreadCount: number;
  totalMessages: number;
}

export interface SendMessageParams {
  senderId: string;
  recipientIds: string[];
  content: string;
  contextType?: 'suggestion' | 'project' | 'task' | 'direct';
  contextId?: string;
  parentMessageId?: number;
}

export interface ThreadPage {
  messages: MessageWithSender[];
  totalCount: number;
  hasMore: boolean;
}

export class MessagingService {
  /**
   * Send a message to one or more recipients
   */
  async sendMessage(params: SendMessageParams): Promise<Message> {
    const { senderId, recipientIds, content, contextType, contextId, parentMessageId } = params;

    try {
      // Get sender details
      const sender = await db.select({
        displayName: users.displayName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, senderId))
      .limit(1);

      const senderName = sender[0] 
        ? sender[0].displayName || sender[0].email || 'Unknown User'
        : 'Unknown User';

      // Create the message
      const [message] = await db.insert(messages).values({
        userId: senderId, // Keep for backward compatibility - this should be senderId
        senderId,
        content,
        sender: senderName,
        contextType,
        contextId,
      }).returning();

      // Create recipient entries
      const recipientValues: InsertMessageRecipient[] = recipientIds.map(recipientId => ({
        messageId: message.id,
        recipientId,
        read: false,
        notificationSent: false,
      }));

      await db.insert(messageRecipients).values(recipientValues);

      // Threading functionality disabled - using simplified messaging architecture
      // The current system uses conversations instead of message threads

      // Trigger notifications (don't await - let it run async)
      this.triggerNotifications(message, recipientIds).catch(error => {
        console.error('Failed to send notifications:', error);
      });

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get unread messages for a recipient
   */
  async getUnreadMessages(
    recipientId: string, 
    options?: {
      contextType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<MessageWithSender[]> {
    const { contextType, limit = 50, offset = 0 } = options || {};

    try {
      const query = db
        .select({
          message: messages,
          senderName: sql<string>`COALESCE(${users.displayName}, ${messages.sender}, 'Unknown User')`,
          senderEmail: users.email,
        })
        .from(messageRecipients)
        .innerJoin(messages, eq(messages.id, messageRecipients.messageId))
        .leftJoin(users, eq(users.id, messages.senderId))
        .where(
          and(
            eq(messageRecipients.recipientId, recipientId),
            eq(messageRecipients.read, false),
            isNull(messages.deletedAt),
            eq(messageRecipients.contextAccessRevoked, false),
            contextType ? eq(messages.contextType, contextType) : undefined
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      const results = await query;

      return results.map(row => ({
        ...row.message,
        senderName: row.senderName || 'Unknown User',
        senderEmail: row.senderEmail || undefined,
      }));
    } catch (error) {
      console.error('Failed to get unread messages:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  async markMessageRead(recipientId: string, messageId: number): Promise<boolean> {
    try {
      const result = await db
        .update(messageRecipients)
        .set({ 
          read: true, 
          readAt: new Date() 
        })
        .where(
          and(
            eq(messageRecipients.recipientId, recipientId),
            eq(messageRecipients.messageId, messageId)
          )
        );

      return true;
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      return false;
    }
  }

  /**
   * Mark all messages as read for a recipient
   */
  async markAllMessagesRead(recipientId: string, contextType?: string): Promise<number> {
    try {
      if (contextType) {
        // Mark read only for specific context type
        const messageIds = await db
          .select({ id: messages.id })
          .from(messages)
          .innerJoin(messageRecipients, eq(messages.id, messageRecipients.messageId))
          .where(
            and(
              eq(messageRecipients.recipientId, recipientId),
              eq(messageRecipients.read, false),
              eq(messages.contextType, contextType)
            )
          );

        if (messageIds.length > 0) {
          await db
            .update(messageRecipients)
            .set({ read: true, readAt: new Date() })
            .where(
              and(
                eq(messageRecipients.recipientId, recipientId),
                inArray(messageRecipients.messageId, messageIds.map(m => m.id))
              )
            );
        }

        return messageIds.length;
      } else {
        // Mark all messages as read
        const result = await db
          .update(messageRecipients)
          .set({ read: true, readAt: new Date() })
          .where(
            and(
              eq(messageRecipients.recipientId, recipientId),
              eq(messageRecipients.read, false)
            )
          );

        return 0; // Return count if needed
      }
    } catch (error) {
      console.error('Failed to mark all messages as read:', error);
      throw error;
    }
  }

  /**
   * Get messages for a specific context
   */
  async getContextMessages(
    contextType: string, 
    contextId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<MessageWithSender[]> {
    const { limit = 50, offset = 0 } = options || {};

    try {
      const results = await db
        .select({
          message: messages,
          senderName: sql<string>`COALESCE(${users.displayName}, ${messages.sender}, 'Unknown User')`,
          senderEmail: users.email,
        })
        .from(messages)
        .leftJoin(users, eq(users.id, messages.senderId))
        .where(
          and(
            eq(messages.contextType, contextType),
            eq(messages.contextId, contextId),
            isNull(messages.deletedAt)
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      return results.map(row => ({
        ...row.message,
        senderName: row.senderName || 'Unknown User',
        senderEmail: row.senderEmail || undefined,
      }));
    } catch (error) {
      console.error('Failed to get context messages:', error);
      throw error;
    }
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: number, userId: string, newContent: string): Promise<Message> {
    try {
      // Check if user is sender and within edit window (15 minutes)
      const [existingMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!existingMessage) {
        throw new Error('Message not found');
      }

      if (existingMessage.senderId !== userId) {
        throw new Error('Only the sender can edit this message');
      }

      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      if (existingMessage.createdAt && existingMessage.createdAt < fifteenMinutesAgo) {
        throw new Error('Edit window has expired (15 minutes)');
      }

      // Update message
      const [updatedMessage] = await db
        .update(messages)
        .set({
          editedContent: newContent,
          editedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(messages.id, messageId))
        .returning();

      // Broadcast edit notification via WebSocket
      if ((global as any).broadcastMessageEdit) {
        (global as any).broadcastMessageEdit({
          messageId,
          newContent,
          editedAt: updatedMessage.editedAt,
        });
      }

      return updatedMessage;
    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  }

  /**
   * Soft delete a message
   */
  async deleteMessage(messageId: number, userId: string): Promise<boolean> {
    try {
      const [existingMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!existingMessage) {
        return false;
      }

      // Check if user is sender or has admin permissions
      // For now, only sender can delete
      if (existingMessage.senderId !== userId) {
        throw new Error('Only the sender can delete this message');
      }

      await db
        .update(messages)
        .set({
          deletedAt: new Date(),
          deletedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(messages.id, messageId));

      // Broadcast delete notification
      if ((global as any).broadcastMessageDelete) {
        (global as any).broadcastMessageDelete({
          messageId,
          deletedAt: new Date(),
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  }

  /**
   * Validate user has access to context
   */
  async validateContextAccess(userId: string, contextType: string, contextId: string): Promise<boolean> {
    // This would check against your project/suggestion/task permissions
    // For now, return true - implement based on your permission system
    return true;
  }

  /**
   * Sync context permissions when users are added/removed
   */
  async syncContextPermissions(contextType: string, contextId: string, allowedUserIds: string[]): Promise<void> {
    try {
      // Get all recipients who have messages for this context
      const affectedRecipients = await db
        .selectDistinct({ recipientId: messageRecipients.recipientId })
        .from(messageRecipients)
        .innerJoin(messages, eq(messages.id, messageRecipients.messageId))
        .where(
          and(
            eq(messages.contextType, contextType),
            eq(messages.contextId, contextId)
          )
        );

      // Mark access as revoked for users not in allowedUserIds
      const revokedUserIds = affectedRecipients
        .map(r => r.recipientId)
        .filter(id => !allowedUserIds.includes(id));

      if (revokedUserIds.length > 0) {
        await db
          .update(messageRecipients)
          .set({ contextAccessRevoked: true })
          .where(
            and(
              inArray(messageRecipients.recipientId, revokedUserIds),
              eq(messages.contextType, contextType),
              eq(messages.contextId, contextId)
            )
          );
      }
    } catch (error) {
      console.error('Failed to sync context permissions:', error);
      throw error;
    }
  }

  /**
   * Send kudos message with tracking
   */
  async sendKudos(params: {
    senderId: string;
    recipientId: string;
    content: string;
    contextType: 'project' | 'task';
    contextId: string;
    entityName: string;
  }): Promise<{ message: Message; alreadySent: boolean }> {
    const { senderId, recipientId, content, contextType, contextId, entityName } = params;

    try {
      // Validate recipient exists in users table
      const recipientExists = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, recipientId))
        .limit(1);

      if (recipientExists.length === 0) {
        console.error(`Kudos recipient not found in users table: ${recipientId}`);
        throw new Error(`Invalid recipient: ${recipientId}. User does not exist in the system.`);
      }

      // Check if kudos already sent
      const existing = await db
        .select()
        .from(kudosTracking)
        .where(
          and(
            eq(kudosTracking.senderId, senderId),
            eq(kudosTracking.recipientId, recipientId),
            eq(kudosTracking.contextType, contextType),
            eq(kudosTracking.contextId, contextId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { 
          message: existing[0] as any, // Return existing message reference
          alreadySent: true 
        };
      }

      // Send the kudos message
      const message = await this.sendMessage({
        senderId,
        recipientIds: [recipientId],
        content: content || `🎉 Kudos! Great job completing ${entityName}!`,
        contextType,
        contextId,
      });

      // Track the kudos
      await db.insert(kudosTracking).values({
        senderId,
        recipientId,
        contextType,
        contextId,
        messageId: message.id,
      });

      return { message, alreadySent: false };
    } catch (error) {
      console.error('Failed to send kudos:', error);
      throw error;
    }
  }

  /**
   * Check if kudos was already sent
   */
  async hasKudosSent(senderId: string, recipientId: string, contextType: string, contextId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(kudosTracking)
        .where(
          and(
            eq(kudosTracking.senderId, senderId),
            eq(kudosTracking.recipientId, recipientId),
            eq(kudosTracking.contextType, contextType),
            eq(kudosTracking.contextId, contextId)
          )
        );

      return result[0]?.count > 0;
    } catch (error) {
      console.error('Failed to check kudos status:', error);
      return false;
    }
  }

  /**
   * Get received kudos messages for a user
   */
  async getReceivedKudos(userId: string): Promise<any[]> {
    try {
      // Get kudos tracking entries where this user is the recipient
      const kudosEntries = await db
        .select({
          messageId: kudosTracking.messageId,
          contextType: kudosTracking.contextType,
          contextId: kudosTracking.contextId,
          senderId: kudosTracking.senderId,
          createdAt: kudosTracking.createdAt,
        })
        .from(kudosTracking)
        .where(eq(kudosTracking.recipientId, userId))
        .orderBy(desc(kudosTracking.createdAt));

      // Get the actual messages with sender information
      const kudosMessages = await Promise.all(
        kudosEntries.map(async (entry) => {
          try {
            const [messageResult] = await db
              .select({
                id: messages.id,
                content: messages.content,
                createdAt: messages.createdAt,
                senderId: messages.senderId,
                senderName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.displayName}, ${users.email})`.as('senderName'),
              })
              .from(messages)
              .leftJoin(users, eq(messages.senderId, users.id))
              .where(eq(messages.id, entry.messageId))
              .limit(1);

            if (!messageResult) return null;

            // Determine entity name based on context
            let entityName = 'Unknown';
            if (entry.contextType === 'task') {
              try {
                const [task] = await db
                  .select({ title: sql<string>`title` })
                  .from(sql`project_tasks`)
                  .where(sql`id = ${entry.contextId}`)
                  .limit(1);
                entityName = task?.title || `Task ${entry.contextId}`;
              } catch (error) {
                entityName = `Task ${entry.contextId}`;
              }
            } else if (entry.contextType === 'project') {
              try {
                const [project] = await db
                  .select({ title: sql<string>`title` })
                  .from(sql`projects`)
                  .where(sql`id = ${entry.contextId}`)
                  .limit(1);
                entityName = project?.title || `Project ${entry.contextId}`;
              } catch (error) {
                entityName = `Project ${entry.contextId}`;
              }
            }

            return {
              id: messageResult.id,
              content: messageResult.content,
              sender: messageResult.senderId,
              senderName: messageResult.senderName || 'Unknown User',
              contextType: entry.contextType,
              contextId: entry.contextId,
              entityName,
              createdAt: messageResult.createdAt,
              read: false // For now, all kudos are considered unread until we implement read tracking
            };
          } catch (error) {
            console.error(`Error fetching kudos message ${entry.messageId}:`, error);
            return null;
          }
        })
      );

      // Filter out null results and return
      return kudosMessages.filter(Boolean);
    } catch (error) {
      console.error('Failed to get received kudos:', error);
      throw error;
    }
  }

  /**
   * Trigger notifications for a message
   */
  private async triggerNotifications(message: Message, recipientIds: string[]): Promise<void> {
    try {
      // Send WebSocket notifications
      if ((global as any).broadcastNewMessage) {
        await (global as any).broadcastNewMessage({
          type: 'new_message',
          message,
          context: {
            type: message.contextType,
            id: message.contextId,
          }
        });
      }

      // Send immediate email notifications for direct messages
      if (message.contextType === 'direct') {
        await this.sendDirectMessageEmails(message, recipientIds);
      }

      // Schedule email fallback for offline users
      for (const recipientId of recipientIds) {
        await this.scheduleEmailFallback(message.id, recipientId);
      }
    } catch (error) {
      console.error('Failed to trigger notifications:', error);
    }
  }

  /**
   * Send immediate email notifications for direct messages
   */
  private async sendDirectMessageEmails(message: Message, recipientIds: string[]): Promise<void> {
    try {
      // Import NotificationService dynamically to avoid circular dependency
      const { NotificationService } = await import('../notification-service');
      
      // Get sender name
      const senderName = message.sender || 'Unknown User';
      
      // Send email to each recipient
      for (const recipientId of recipientIds) {
        try {
          // Get recipient email
          const [recipient] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, recipientId))
            .limit(1);

          if (recipient?.email) {
            await NotificationService.sendDirectMessageNotification(
              recipient.email,
              senderName,
              message.content,
              message.contextType
            );
          }
        } catch (error) {
          console.error(`Failed to send direct message email to ${recipientId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to send direct message emails:', error);
    }
  }

  /**
   * Schedule email fallback for unread messages
   */
  private async scheduleEmailFallback(messageId: number, recipientId: string, delayMinutes: number = 30): Promise<void> {
    // This would integrate with a job queue like Bull or similar
    // For now, we'll use a simple setTimeout
    setTimeout(async () => {
      try {
        // Check if message is still unread
        const [recipient] = await db
          .select()
          .from(messageRecipients)
          .where(
            and(
              eq(messageRecipients.messageId, messageId),
              eq(messageRecipients.recipientId, recipientId),
              eq(messageRecipients.read, false),
              isNull(messageRecipients.emailSentAt)
            )
          )
          .limit(1);

        if (recipient) {
          // Get recipient email
          const [user] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, recipientId))
            .limit(1);

          if (user?.email) {
            // Send email notification
            const [message] = await db
              .select()
              .from(messages)
              .where(eq(messages.id, messageId))
              .limit(1);

            if (message) {
              // Use your existing NotificationService
              // await NotificationService.sendMessageNotification(user.email, message);

              // Mark email as sent
              await db
                .update(messageRecipients)
                .set({ emailSentAt: new Date() })
                .where(
                  and(
                    eq(messageRecipients.messageId, messageId),
                    eq(messageRecipients.recipientId, recipientId)
                  )
                );
            }
          }
        }
      } catch (error) {
        console.error('Failed to send email fallback:', error);
      }
    }, delayMinutes * 60 * 1000);
  }

  /**
   * Create thread entry for a reply
   */
  private async createThreadEntryNoTx(messageId: number, parentMessageId: number): Promise<void> {
    // Get parent thread info
    const [parentThread] = await db
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.messageId, parentMessageId))
      .limit(1);

    if (parentThread) {
      // Add to existing thread
      const newPath = `${parentThread.path}.${String(messageId).padStart(10, '0')}`;
      await db.insert(messageThreads).values({
        rootMessageId: parentThread.rootMessageId,
        messageId,
        parentMessageId,
        depth: parentThread.depth + 1,
        path: newPath,
      });
    } else {
      // Parent isn't threaded yet - create entries for both
      const parentPath = String(parentMessageId).padStart(10, '0');
      const childPath = `${parentPath}.${String(messageId).padStart(10, '0')}`;

      await db.insert(messageThreads).values([
        {
          rootMessageId: parentMessageId,
          messageId: parentMessageId,
          parentMessageId: null,
          depth: 0,
          path: parentPath,
        },
        {
          rootMessageId: parentMessageId,
          messageId,
          parentMessageId,
          depth: 1,
          path: childPath,
        }
      ]);
    }
  }

  private async createThreadEntry(tx: any, messageId: number, parentMessageId: number): Promise<void> {
    // Get parent thread info
    const [parentThread] = await tx
      .select()
      .from(messageThreads)
      .where(eq(messageThreads.messageId, parentMessageId))
      .limit(1);

    if (parentThread) {
      // Add to existing thread
      const newPath = `${parentThread.path}.${String(messageId).padStart(10, '0')}`;
      await tx.insert(messageThreads).values({
        rootMessageId: parentThread.rootMessageId,
        messageId,
        parentMessageId,
        depth: parentThread.depth + 1,
        path: newPath,
      });
    } else {
      // Parent isn't threaded yet - create entries for both
      const parentPath = String(parentMessageId).padStart(10, '0');
      const childPath = `${parentPath}.${String(messageId).padStart(10, '0')}`;

      await tx.insert(messageThreads).values([
        {
          rootMessageId: parentMessageId,
          messageId: parentMessageId,
          parentMessageId: null,
          depth: 0,
          path: parentPath,
        },
        {
          rootMessageId: parentMessageId,
          messageId,
          parentMessageId,
          depth: 1,
          path: childPath,
        }
      ]);
    }
  }

  /**
   * Auto-thread messages in same context
   */
  private async autoThreadMessageNoTx(message: Message): Promise<void> {
    if (!message.contextType || !message.contextId) return;

    // Find the most recent message in same context
    const [recentMessage] = await db
      .select({ id: messages.id })
      .from(messages)
      .where(
        and(
          eq(messages.contextType, message.contextType),
          eq(messages.contextId, message.contextId),
          not(eq(messages.id, message.id)),
          isNull(messages.deletedAt)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(1);

    if (recentMessage) {
      await this.createThreadEntryNoTx(message.id, recentMessage.id);
    } else {
      // First message in context - create root thread entry
      await db.insert(messageThreads).values({
        rootMessageId: message.id,
        messageId: message.id,
        parentMessageId: null,
        depth: 0,
        path: String(message.id).padStart(10, '0'),
      });
    }
  }

  private async autoThreadMessage(tx: any, message: Message): Promise<void> {
    if (!message.contextType || !message.contextId) return;

    // Find the most recent message in same context
    const [recentMessage] = await tx
      .select({ id: messages.id })
      .from(messages)
      .where(
        and(
          eq(messages.contextType, message.contextType),
          eq(messages.contextId, message.contextId),
          not(eq(messages.id, message.id)),
          isNull(messages.deletedAt)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(1);

    if (recentMessage) {
      await this.createThreadEntry(tx, message.id, recentMessage.id);
    } else {
      // First message in context - create root thread entry
      await tx.insert(messageThreads).values({
        rootMessageId: message.id,
        messageId: message.id,
        parentMessageId: null,
        depth: 0,
        path: String(message.id).padStart(10, '0'),
      });
    }
  }



  /**
   * Get all messages for a user with optional context filtering
   */
  async getAllMessages(userId: string, options: {
    contextType?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Message[]> {
    const { contextType, limit = 50, offset = 0 } = options;

    try {
      let query = db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          content: messages.content,
          contextType: messages.contextType,
          contextId: messages.contextId,
          createdAt: messages.createdAt,
          editedAt: messages.editedAt,
          editedContent: messages.editedContent,
          senderName: users.displayName,
          senderEmail: users.email,
          read: messageRecipients.read,
          readAt: messageRecipients.readAt,
        })
        .from(messages)
        .innerJoin(messageRecipients, eq(messages.id, messageRecipients.messageId))
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messageRecipients.recipientId, userId));

      if (contextType) {
        query = query.where(eq(messages.contextType, contextType));
      }

      const result = await query
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      return result.map(msg => ({
        ...msg,
        senderName: msg.senderName || msg.senderEmail || `User ${msg.senderId}` || 'Unknown User',
        read: !!msg.read,
        readAt: msg.readAt || undefined,
      }));
    } catch (error) {
      console.error('Failed to get all messages:', error);
      throw error;
    }
  }

  /**
   * Get sent messages for a user
   */
  async getSentMessages(userId: string, options: {
    contextType?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<MessageWithSender[]> {
    const { contextType, limit = 50, offset = 0 } = options;

    try {
      let query = db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          content: messages.content,
          contextType: messages.contextType,
          contextId: messages.contextId,
          createdAt: messages.createdAt,
          editedAt: messages.editedAt,
          editedContent: messages.editedContent,
          senderName: users.displayName,
          senderEmail: users.email,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.senderId, userId));

      if (contextType && contextType !== 'all') {
        query = query.where(eq(messages.contextType, contextType));
      }

      const result = await query
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      return result.map(msg => ({
        ...msg,
        senderName: msg.senderName || msg.senderEmail || `User ${msg.senderId}` || 'Unknown User',
        read: true, // All sent messages are "read" from sender's perspective
      }));
    } catch (error) {
      console.error('Failed to get sent messages:', error);
      throw error;
    }
  }

  /**
   * Get inbox messages for a user (received messages only)
   */
  async getInboxMessages(userId: string, options: {
    contextType?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<MessageWithSender[]> {
    const { contextType, limit = 50, offset = 0 } = options;

    try {
      let query = db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          content: messages.content,
          contextType: messages.contextType,
          contextId: messages.contextId,
          createdAt: messages.createdAt,
          editedAt: messages.editedAt,
          editedContent: messages.editedContent,
          senderName: users.displayName,
          senderEmail: users.email,
          read: messageRecipients.read,
          readAt: messageRecipients.readAt,
        })
        .from(messages)
        .innerJoin(messageRecipients, eq(messages.id, messageRecipients.messageId))
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messageRecipients.recipientId, userId));

      if (contextType && contextType !== 'all') {
        query = query.where(eq(messages.contextType, contextType));
      }

      const result = await query
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      return result.map(msg => ({
        ...msg,
        senderName: msg.senderName || msg.senderEmail || `User ${msg.senderId}` || 'Unknown User',
        read: !!msg.read,
        readAt: msg.readAt || undefined,
      }));
    } catch (error) {
      console.error('Failed to get inbox messages:', error);
      throw error;
    }
  }
  /**
   * Get sent messages for a user
   */
  async getSentMessages(
    senderId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<MessageWithSender[]> {
    const { limit = 50, offset = 0 } = options || {};

    try {
      const result = await db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          content: messages.content,
          contextType: messages.contextType,
          contextId: messages.contextId,
          createdAt: messages.createdAt,
          editedAt: messages.editedAt,
          editedContent: messages.editedContent,
          senderName: sql<string>`COALESCE(${users.displayName}, ${users.email}, 'Unknown User')`,
          senderEmail: users.email,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.senderId, senderId))
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      return result.map(msg => ({
        ...msg,
        senderName: msg.senderName || `User ${msg.senderId}` || 'Unknown User',
      }));
    } catch (error) {
      console.error('Failed to get sent messages:', error);
      throw error;
    }
  }

  // Draft functionality removed - messaging service is for chat only

  // saveDraft method removed - messaging service is for chat only

  /**
   * Reply to a message
   */
  async replyToMessage(params: {
    senderId: string;
    originalMessageId: number;
    content: string;
  }): Promise<Message> {
    const { senderId, originalMessageId, content } = params;

    try {
      // Get original message to determine recipients and context
      const [originalMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, originalMessageId))
        .limit(1);

      if (!originalMessage) {
        throw new Error('Original message not found');
      }

      // Get all participants in the original message (sender + recipients)
      const originalRecipients = await db
        .select({ recipientId: messageRecipients.recipientId })
        .from(messageRecipients)
        .where(eq(messageRecipients.messageId, originalMessageId));

      // Build recipient list (all original participants except current sender)
      const recipientIds = [
        originalMessage.senderId,
        ...originalRecipients.map(r => r.recipientId)
      ].filter(id => id !== senderId);

      // Send the reply
      const reply = await this.sendMessage({
        senderId,
        recipientIds,
        content,
        contextType: originalMessage.contextType || 'direct',
        contextId: originalMessage.contextId,
        parentMessageId: originalMessageId,
      });

      return reply;
    } catch (error) {
      console.error('Failed to reply to message:', error);
      throw error;
    }
  }

  /**
   * Delete a message (soft delete with permissions)
   */
  async deleteMessage(messageId: number, userId: string): Promise<boolean> {
    try {
      // Get the message to check permissions
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!message) {
        return false;
      }

      // Check if user can delete (message sender or has moderation permissions)
      const canDelete = message.senderId === userId;
      
      if (!canDelete) {
        throw new Error('You can only delete your own messages');
      }

      // Soft delete the message
      await db
        .update(messages)
        .set({ 
          deletedAt: new Date(),
          content: '[Message deleted]'
        })
        .where(eq(messages.id, messageId));

      return true;
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }


}

// Export singleton instance
export const messagingService = new MessagingService();