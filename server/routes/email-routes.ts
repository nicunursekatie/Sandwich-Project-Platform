import { Router } from 'express';
import { emailService } from '../services/email-service';
import { isAuthenticated } from '../temp-auth';

const router = Router();

// Get emails by folder with optional threading
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const folder = (req.query.folder as string) || 'inbox';
    const threaded = req.query.threaded === 'true';
    console.log(`[Email API] Getting emails for folder: ${folder}, user: ${user.email}, threaded: ${threaded}`);

    // Threading removed - always return flat list
    {
      // Return flat list of emails
      const emails = await emailService.getEmailsByFolder(user.id, folder);
      
      // Format emails for Gmail interface
      const formattedEmails = emails.map(email => ({
        id: email.id,
        senderId: email.senderId,
        senderName: email.senderName,
        senderEmail: email.senderEmail,
        recipientId: email.recipientId,
        recipientName: email.recipientName,
        recipientEmail: email.recipientEmail,
        content: email.content,
        subject: email.subject,
        createdAt: email.createdAt,
        threadId: email.id, // No threading - use email ID
        isRead: email.isRead,
        isStarred: email.isStarred,
        folder: folder,
        committee: email.contextType || 'email'
      }));

      console.log(`[Email API] Found ${formattedEmails.length} emails in ${folder}`);
      res.json(formattedEmails);
    }
  } catch (error) {
    console.error('[Email API] Error fetching emails:', error);
    res.status(500).json({ message: 'Failed to fetch emails' });
  }
});

// Send new email
router.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { recipientId, recipientName, recipientEmail, subject, content, isDraft, contextType, contextId, contextTitle } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    if (!isDraft && (!recipientId || !recipientName || !recipientEmail)) {
      return res.status(400).json({ message: 'Recipient information is required' });
    }

    console.log(`[Email API] Sending email from ${user.email} to ${recipientEmail}`);

    const newEmail = await emailService.sendEmail({
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      senderEmail: user.email,
      recipientId: recipientId || user.id, // For drafts
      recipientName: recipientName || 'Draft',
      recipientEmail: recipientEmail || user.email,
      subject,
      content,
      // Threading removed
      contextType: contextType || null,
      contextId: contextId || null,
      contextTitle: contextTitle || null,
      isDraft: isDraft || false,
    });

    res.status(201).json(newEmail);
  } catch (error) {
    console.error('[Email API] Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Update email status (star, archive, trash, mark read)
router.patch('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const emailId = parseInt(req.params.id);
    const updates = req.body;

    console.log(`[Email API] Updating email ${emailId} status:`, updates);

    const success = await emailService.updateEmailStatus(emailId, user.id, updates);

    if (!success) {
      return res.status(404).json({ message: 'Email not found or access denied' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[Email API] Error updating email:', error);
    res.status(500).json({ message: 'Failed to update email' });
  }
});

// Delete email
router.delete('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const emailId = parseInt(req.params.id);
    console.log(`[Email API] Deleting email ${emailId} for user ${user.email}`);

    const success = await emailService.deleteEmail(emailId, user.id);

    if (!success) {
      return res.status(404).json({ message: 'Email not found or access denied' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('[Email API] Error deleting email:', error);
    res.status(500).json({ message: 'Failed to delete email' });
  }
});

// Get unread email count
router.get('/unread-count', isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await emailService.getUnreadEmailCount(user.id);
    res.json({ count });
  } catch (error) {
    console.error('[Email API] Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Search emails
router.get('/search', isAuthenticated, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const searchTerm = req.query.q as string;
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    console.log(`[Email API] Searching emails for "${searchTerm}"`);

    const emails = await emailService.searchEmails(user.id, searchTerm);
    res.json(emails);
  } catch (error) {
    console.error('[Email API] Error searching emails:', error);
    res.status(500).json({ message: 'Failed to search emails' });
  }
});

export default router;