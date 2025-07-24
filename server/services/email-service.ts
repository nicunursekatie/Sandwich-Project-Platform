import { db } from "../db";
import { emailMessages, users } from "@shared/schema";
import { eq, and, or, desc, isNull, sql, inArray } from "drizzle-orm";

export interface EmailMessage {
  id: number;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  content: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  isDraft: boolean;
  parentMessageId: number | null;
  contextType: string | null;
  contextId: string | null;
  contextTitle: string | null;
  readAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export class EmailService {
  /**
   * Get unread email count for a user
   */
  async getUnreadEmailCount(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(emailMessages)
        .where(
          and(
            eq(emailMessages.recipientId, userId),
            eq(emailMessages.isRead, false),
            eq(emailMessages.isDraft, false),
            eq(emailMessages.isTrashed, false)
          )
        );
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Failed to get unread email count:', error);
      return 0;
    }
  }

  /**
   * Get emails for a specific folder with thread grouping by subject
   */
  async getEmailsByFolder(userId: string, folder: string): Promise<EmailMessage[]> {
    try {
      let query;

      switch (folder) {
        case 'inbox':
          query = db
            .select()
            .from(emailMessages)
            .where(
              and(
                eq(emailMessages.recipientId, userId), // Only show emails sent TO this user
                eq(emailMessages.isDraft, false),
                eq(emailMessages.isTrashed, false),
                eq(emailMessages.isArchived, false)
              )
            );
          break;

        case 'starred':
          query = db
            .select()
            .from(emailMessages)
            .where(
              and(
                or(
                  eq(emailMessages.senderId, userId),
                  eq(emailMessages.recipientId, userId)
                ),
                eq(emailMessages.isStarred, true),
                eq(emailMessages.isTrashed, false)
              )
            );
          break;

        case 'sent':
          query = db
            .select()
            .from(emailMessages)
            .where(
              and(
                eq(emailMessages.senderId, userId),
                eq(emailMessages.isDraft, false),
                eq(emailMessages.isTrashed, false)
              )
            );
          break;

        case 'drafts':
          query = db
            .select()
            .from(emailMessages)
            .where(
              and(
                eq(emailMessages.senderId, userId),
                eq(emailMessages.isDraft, true)
              )
            );
          break;

        case 'archived':
          query = db
            .select()
            .from(emailMessages)
            .where(
              and(
                or(
                  eq(emailMessages.senderId, userId),
                  eq(emailMessages.recipientId, userId)
                ),
                eq(emailMessages.isArchived, true),
                eq(emailMessages.isTrashed, false)
              )
            );
          break;

        case 'trash':
          query = db
            .select()
            .from(emailMessages)
            .where(
              and(
                or(
                  eq(emailMessages.senderId, userId),
                  eq(emailMessages.recipientId, userId)
                ),
                eq(emailMessages.isTrashed, true)
              )
            );
          break;

        default:
          // Default to inbox
          query = db
            .select()
            .from(emailMessages)
            .where(
              and(
                or(
                  eq(emailMessages.senderId, userId),
                  eq(emailMessages.recipientId, userId)
                ),
                eq(emailMessages.isDraft, false),
                eq(emailMessages.isTrashed, false),
                eq(emailMessages.isArchived, false)
              )
            );
      }

      const results = await query
        .orderBy(desc(emailMessages.createdAt))
        .limit(50);

      return results as EmailMessage[];
    } catch (error) {
      console.error(`Failed to get emails for folder ${folder}:`, error);
      throw error;
    }
  }

  /**
   * Send a new email
   */
  async sendEmail(data: {
    senderId: string;
    senderName: string;
    senderEmail: string;
    recipientId: string;
    recipientName: string;
    recipientEmail: string;
    subject: string;
    content: string;
    parentMessageId?: number;
    contextType?: string;
    contextId?: string;
    contextTitle?: string;
    isDraft?: boolean;
  }): Promise<EmailMessage> {
    try {
      const [newEmail] = await db
        .insert(emailMessages)
        .values({
          senderId: data.senderId,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          recipientId: data.recipientId,
          recipientName: data.recipientName,
          recipientEmail: data.recipientEmail,
          subject: data.subject,
          content: data.content,
          parentMessageId: data.parentMessageId || null,
          contextType: data.contextType || null,
          contextId: data.contextId || null,
          contextTitle: data.contextTitle || null,
          isDraft: data.isDraft || false,
          isRead: false,
          isStarred: false,
          isArchived: false,
          isTrashed: false,
        })
        .returning();

      return newEmail as EmailMessage;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Update email status (star, archive, trash, etc.)
   */
  async updateEmailStatus(
    emailId: number,
    userId: string,
    updates: {
      isRead?: boolean;
      isStarred?: boolean;
      isArchived?: boolean;
      isTrashed?: boolean;
      isDraft?: boolean;
    }
  ): Promise<boolean> {
    try {
      // Verify user has access to this email
      const [email] = await db
        .select()
        .from(emailMessages)
        .where(
          and(
            eq(emailMessages.id, emailId),
            or(
              eq(emailMessages.senderId, userId),
              eq(emailMessages.recipientId, userId)
            )
          )
        );

      if (!email) {
        console.error('Email not found or user does not have access');
        return false;
      }

      // Update the email
      await db
        .update(emailMessages)
        .set({
          ...updates,
          updatedAt: new Date(),
          readAt: updates.isRead ? new Date() : undefined,
        })
        .where(eq(emailMessages.id, emailId));

      return true;
    } catch (error) {
      console.error('Failed to update email status:', error);
      return false;
    }
  }

  /**
   * Mark email as read
   */
  async markEmailRead(emailId: number, userId: string): Promise<boolean> {
    return this.updateEmailStatus(emailId, userId, { isRead: true });
  }

  /**
   * Delete email permanently
   */
  async deleteEmail(emailId: number, userId: string): Promise<boolean> {
    try {
      // Verify user has access to this email
      const result = await db
        .delete(emailMessages)
        .where(
          and(
            eq(emailMessages.id, emailId),
            or(
              eq(emailMessages.senderId, userId),
              eq(emailMessages.recipientId, userId)
            )
          )
        );

      return true;
    } catch (error) {
      console.error('Failed to delete email:', error);
      return false;
    }
  }

  /**
   * Get email by ID
   */
  async getEmailById(emailId: number, userId: string): Promise<EmailMessage | null> {
    try {
      const [email] = await db
        .select()
        .from(emailMessages)
        .where(
          and(
            eq(emailMessages.id, emailId),
            or(
              eq(emailMessages.senderId, userId),
              eq(emailMessages.recipientId, userId)
            )
          )
        );

      return email as EmailMessage || null;
    } catch (error) {
      console.error('Failed to get email by ID:', error);
      return null;
    }
  }

  /**
   * Get emails grouped by subject (thread view)
   */
  async getEmailThreads(userId: string, folder: string): Promise<any[]> {
    try {
      const emails = await this.getEmailsByFolder(userId, folder);
      
      // Group emails by subject
      const threadMap = new Map<string, EmailMessage[]>();
      
      emails.forEach(email => {
        const subject = email.subject || 'No Subject';
        if (!threadMap.has(subject)) {
          threadMap.set(subject, []);
        }
        threadMap.get(subject)!.push(email);
      });
      
      // Convert to array of threads
      const threads = Array.from(threadMap.entries()).map(([subject, messages]) => {
        // Sort messages in thread by date (newest first)
        messages.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        return {
          subject,
          messageCount: messages.length,
          lastMessage: messages[0], // Most recent message
          messages: messages,
          participants: Array.from(new Set(messages.flatMap(m => [m.senderEmail, m.recipientEmail]))).filter(Boolean),
          hasUnread: messages.some(m => !m.isRead),
          lastMessageDate: messages[0].createdAt
        };
      });
      
      // Sort threads by last message date (newest first)
      threads.sort((a, b) => {
        const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
        const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
        return dateB - dateA;
      });
      
      return threads;
    } catch (error) {
      console.error('Failed to get email threads:', error);
      throw error;
    }
  }

  /**
   * Search emails
   */
  async searchEmails(userId: string, searchTerm: string): Promise<EmailMessage[]> {
    try {
      const results = await db
        .select()
        .from(emailMessages)
        .where(
          and(
            or(
              eq(emailMessages.senderId, userId),
              eq(emailMessages.recipientId, userId)
            ),
            or(
              sql`${emailMessages.subject} ILIKE ${`%${searchTerm}%`}`,
              sql`${emailMessages.content} ILIKE ${`%${searchTerm}%`}`,
              sql`${emailMessages.senderName} ILIKE ${`%${searchTerm}%`}`,
              sql`${emailMessages.recipientName} ILIKE ${`%${searchTerm}%`}`
            )
          )
        )
        .orderBy(desc(emailMessages.createdAt))
        .limit(50);

      return results as EmailMessage[];
    } catch (error) {
      console.error('Failed to search emails:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();