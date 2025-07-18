import { MailService } from '@sendgrid/mail';
import { NotificationTypes, type NotificationType, type ProjectNotificationData, type EmailNotificationTemplate } from '@shared/notification-types';
import { db } from './database-storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from "./utils/logger";

if (!process.env.SENDGRID_API_KEY) {
  logger.warn("SENDGRID_API_KEY environment variable not set. Email notifications will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

export class NotificationService {
  private static readonly FROM_EMAIL = 'noreply@thesandwichproject.org';
  
  /**
   * Send email notification for direct messages
   */
  static async sendDirectMessageNotification(
    recipientEmail: string,
    senderName: string,
    messageContent: string,
    contextType?: string
  ): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      logger.info('Direct message email notification skipped - no SendGrid API key configured');
      return false;
    }

    try {
      const subject = `New message from ${senderName}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #236383;">New Message from ${senderName}</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.5;">${messageContent}</p>
          </div>
          <p>
            <a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/messages" 
               style="background: #236383; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Message
            </a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            This is an automated message from The Sandwich Project. Please do not reply to this email.
          </p>
        </div>
      `;

      const emailData = {
        to: recipientEmail,
        from: this.FROM_EMAIL,
        subject,
        html: htmlContent,
        text: `New message from ${senderName}: ${messageContent}\n\nView the message at: ${process.env.REPL_URL || 'https://your-platform-url.com'}/messages`
      };

      await mailService.send(emailData);
      logger.info(`Direct message email notification sent to ${recipientEmail}`);
      return true;
    } catch (error) {
      logger.error('Failed to send direct message email notification:', error);
      return false;
    }
  }

  /**
   * Send email notification for project assignments
   */
  static async sendProjectAssignmentNotification(
    projectId: string,
    projectTitle: string,
    assigneeEmails: string[],
    assignedBy: string
  ): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      logger.info('Project assignment email notification skipped - no SendGrid API key configured');
      return false;
    }

    try {
      const subject = `You've been assigned to project: ${projectTitle}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #236383;">New Project Assignment</h2>
          <p style="font-size: 16px; line-height: 1.5;">
            You have been assigned to work on the project <strong>${projectTitle}</strong>.
          </p>
          ${assignedBy ? `<p style="color: #64748b;">Assigned by: ${assignedBy}</p>` : ''}
          <p style="font-size: 16px; line-height: 1.5;">
            Please log into the Sandwich Project platform to view project details and get started.
          </p>
          <p>
            <a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${projectId}" 
               style="background: #236383; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Project
            </a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            This is an automated message from The Sandwich Project. Please do not reply to this email.
          </p>
        </div>
      `;

      const emailData = {
        to: assigneeEmails,
        from: this.FROM_EMAIL,
        subject,
        html: htmlContent,
        text: `You've been assigned to project: ${projectTitle}\n\n${assignedBy ? `Assigned by: ${assignedBy}\n\n` : ''}Please log into the platform to view project details.\n\nView project at: ${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${projectId}`
      };

      await mailService.send(emailData);
      logger.info(`Project assignment email notification sent to ${assigneeEmails.length} recipients`);
      return true;
    } catch (error) {
      logger.error('Failed to send project assignment email notification:', error);
      return false;
    }
  }
  
  static async sendProjectNotification(
    type: NotificationType,
    data: ProjectNotificationData,
    recipientEmails: string[]
  ): Promise<boolean> {
    if (!process.env.SENDGRID_API_KEY) {
      logger.info('Email notification skipped - no SendGrid API key configured');
      return false;
    }

    try {
      const template = this.getEmailTemplate(type, data);
      
      const emailData = {
        to: recipientEmails,
        from: this.FROM_EMAIL,
        subject: template.subject,
        html: template.body,
        text: template.body.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      await mailService.send(emailData);
      logger.info(`Email notification sent: ${type} to ${recipientEmails.length} recipients`);
      return true;
    } catch (error) {
      logger.error('Failed to send email notification:', error);
      return false;
    }
  }

  private static getEmailTemplate(type: NotificationType, data: ProjectNotificationData): EmailNotificationTemplate {
    switch (type) {
      case NotificationTypes.PROJECT_ASSIGNED:
        return {
          subject: `You've been assigned to project: ${data.projectTitle}`,
          body: `
            <h2>New Project Assignment</h2>
            <p>You have been assigned to work on the project <strong>${data.projectTitle}</strong>.</p>
            ${data.assignedBy ? `<p>Assigned by: ${data.assignedBy}</p>` : ''}
            <p>Please log into the Sandwich Project platform to view project details and get started.</p>
            <p><a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${data.projectId}">View Project</a></p>
          `,
          recipients: data.assignedTo || []
        };

      case NotificationTypes.PROJECT_UPDATED:
        return {
          subject: `Project updated: ${data.projectTitle}`,
          body: `
            <h2>Project Update</h2>
            <p>The project <strong>${data.projectTitle}</strong> has been updated.</p>
            <p>Please check the project page for the latest information.</p>
            <p><a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${data.projectId}">View Project</a></p>
          `,
          recipients: data.assignedTo || []
        };

      case NotificationTypes.TASK_ADDED:
        return {
          subject: `New task added to ${data.projectTitle}`,
          body: `
            <h2>New Task Added</h2>
            <p>A new task <strong>${data.taskTitle}</strong> has been added to project <strong>${data.projectTitle}</strong>.</p>
            <p>Please check the project page to view task details.</p>
            <p><a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${data.projectId}">View Project</a></p>
          `,
          recipients: data.assignedTo || []
        };

      case NotificationTypes.TASK_ASSIGNED:
        return {
          subject: `You've been assigned a task: ${data.taskTitle}`,
          body: `
            <h2>New Task Assignment</h2>
            <p>You have been assigned the task <strong>${data.taskTitle}</strong> in project <strong>${data.projectTitle}</strong>.</p>
            ${data.assignedBy ? `<p>Assigned by: ${data.assignedBy}</p>` : ''}
            <p><a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${data.projectId}">View Project</a></p>
          `,
          recipients: data.assignedTo || []
        };

      case NotificationTypes.PROJECT_STATUS_CHANGED:
        return {
          subject: `Project status changed: ${data.projectTitle}`,
          body: `
            <h2>Project Status Update</h2>
            <p>The status of project <strong>${data.projectTitle}</strong> has changed from <strong>${data.oldStatus}</strong> to <strong>${data.newStatus}</strong>.</p>
            <p><a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${data.projectId}">View Project</a></p>
          `,
          recipients: data.assignedTo || []
        };

      case NotificationTypes.PROJECT_DUE_REMINDER:
        return {
          subject: `Reminder: ${data.projectTitle} due soon`,
          body: `
            <h2>Project Due Date Reminder</h2>
            <p>The project <strong>${data.projectTitle}</strong> is due on <strong>${data.dueDate}</strong>.</p>
            <p>Please ensure all tasks are completed on time.</p>
            <p><a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${data.projectId}">View Project</a></p>
          `,
          recipients: data.assignedTo || []
        };

      default:
        return {
          subject: `Update on project: ${data.projectTitle}`,
          body: `
            <h2>Project Update</h2>
            <p>There has been an update to project <strong>${data.projectTitle}</strong>.</p>
            <p><a href="${process.env.REPL_URL || 'https://your-platform-url.com'}/projects/${data.projectId}">View Project</a></p>
          `,
          recipients: data.assignedTo || []
        };
    }
  }
}