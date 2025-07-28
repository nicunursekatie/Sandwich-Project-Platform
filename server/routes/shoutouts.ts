import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated, requirePermission } from '../temp-auth';
import { storage } from '../storage-wrapper';
import { sendEmail } from '../services/sendgrid';

const router = Router();

// Test SendGrid configuration endpoint
router.post('/test', isAuthenticated, requirePermission('MANAGE_USERS'), async (req, res) => {
  try {
    console.log('🧪 Testing SendGrid configuration...');
    
    // Test with user's email
    const testEmail = req.user?.email || 'admin@sandwich.project';
    
    // Try different "from" addresses to identify the issue
    const fromAddresses = [
      'no-reply@thesandwichproject.org',
      'alerts@thesandwichproject.org', 
      'admin@thesandwichproject.org',
      'admin@sandwich.project'
    ];
    
    const results = [];
    
    for (const fromAddress of fromAddresses) {
      try {
        console.log(`Testing from address: ${fromAddress}`);
        await sendEmail({
          to: testEmail,
          from: fromAddress,
          subject: 'SendGrid Test - TSP Platform',
          text: `This is a test email from ${fromAddress} to verify SendGrid configuration.`,
          html: `<p>This is a test email from <strong>${fromAddress}</strong> to verify SendGrid configuration.</p>`
        });
        results.push({ from: fromAddress, status: 'success' });
        console.log(`✅ Success with ${fromAddress}`);
      } catch (error: any) {
        results.push({ 
          from: fromAddress, 
          status: 'failed', 
          error: error.message,
          details: error.response?.body 
        });
        console.log(`❌ Failed with ${fromAddress}: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      message: 'SendGrid test completed',
      results,
      apiKeyConfigured: !!process.env.SENDGRID_API_KEY,
      testRecipient: testEmail
    });
    
  } catch (error: any) {
    console.error('SendGrid test error:', error);
    res.status(500).json({
      error: 'SendGrid test failed',
      message: error.message,
      apiKeyConfigured: !!process.env.SENDGRID_API_KEY
    });
  }
});

// Schemas
const sendShoutoutSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  recipientGroup: z.enum(['all', 'admins', 'hosts', 'volunteers', 'committee']),
  templateName: z.string().optional()
});

// Send shoutout endpoint
router.post('/send', isAuthenticated, requirePermission('MANAGE_USERS'), async (req, res) => {
  try {
    const { subject, message, recipientGroup, templateName } = sendShoutoutSchema.parse(req.body);
    
    // Get all users
    const allUsers = await storage.getAllUsers();
    
    // Filter recipients based on group selection
    let recipients: any[] = [];
    switch (recipientGroup) {
      case 'all':
        recipients = allUsers;
        break;
      case 'admins':
        recipients = allUsers.filter(user => 
          user.role === 'admin' || user.role === 'super_admin'
        );
        break;
      case 'hosts':
        recipients = allUsers.filter(user => user.role === 'host');
        break;
      case 'volunteers':
        recipients = allUsers.filter(user => user.role === 'volunteer');
        break;
      case 'committee':
        recipients = allUsers.filter(user => user.role === 'committee_member');
        break;
      default:
        recipients = [];
    }

    // Filter out users without email addresses
    const validRecipients = recipients.filter(user => 
      user.email && user.email.includes('@')
    );

    if (validRecipients.length === 0) {
      return res.status(400).json({ 
        error: 'No valid email recipients found in the selected group' 
      });
    }

    // Send emails to all recipients
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    // Try different verified sender addresses
    const verifiedSenders = [
      'no-reply@thesandwichproject.org',
      'alerts@thesandwichproject.org',
      'admin@thesandwichproject.org'
    ];
    
    let workingSender = null;
    
    // Test first recipient to find working sender
    if (validRecipients.length > 0) {
      for (const sender of verifiedSenders) {
        try {
          await sendEmail({
            to: validRecipients[0].email,
            from: sender,
            subject: subject,
            text: message,
            html: message.replace(/\n/g, '<br>')
          });
          workingSender = sender;
          successCount++;
          console.log(`✅ Found working sender: ${sender}`);
          break;
        } catch (error: any) {
          console.log(`❌ Failed with sender ${sender}: ${error.message}`);
          if (error.response?.body) {
            console.error('SendGrid error details:', JSON.stringify(error.response.body, null, 2));
            errors.push(`Failed to send to ${validRecipients[0].email}: ${error.message} (Details: ${JSON.stringify(error.response.body)})`);
          } else {
            errors.push(`Failed to send to ${validRecipients[0].email}: ${error.message}`);
          }
        }
      }
    }
    
    if (!workingSender) {
      return res.status(500).json({
        error: 'Failed to send shoutout to any recipients',
        details: ['No verified sender address is working with SendGrid. Please check SendGrid configuration and sender verification.'],
        debugInfo: errors
      });
    }
    
    // Send to remaining recipients using working sender
    for (let i = 1; i < validRecipients.length; i++) {
      const recipient = validRecipients[i];
      try {
        await sendEmail({
          to: recipient.email,
          from: workingSender,
          subject: subject,
          text: message,
          html: message.replace(/\n/g, '<br>')
        });
        successCount++;
      } catch (error: any) {
        failureCount++;
        errors.push(`Failed to send to ${recipient.email}: ${error.message}`);
        console.error(`Failed to send shoutout to ${recipient.email}:`, error);
      }
    }

    // Log the shoutout for history
    try {
      await storage.createShoutoutLog({
        templateName: templateName || 'Custom Message',
        subject,
        message,
        recipientCount: validRecipients.length,
        sentAt: new Date().toISOString(),
        status: failureCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'partial'),
        sentBy: req.user?.email || 'unknown',
        successCount,
        failureCount
      });
    } catch (logError) {
      console.error('Failed to log shoutout:', logError);
      // Don't fail the request if logging fails
    }

    // Return result
    if (failureCount === 0) {
      res.json({ 
        success: true, 
        message: `Shoutout sent successfully to ${successCount} recipients`,
        recipientCount: successCount
      });
    } else if (successCount === 0) {
      res.status(500).json({ 
        error: 'Failed to send shoutout to any recipients',
        details: errors
      });
    } else {
      res.json({ 
        success: true, 
        message: `Shoutout sent to ${successCount} recipients, ${failureCount} failed`,
        recipientCount: successCount,
        warnings: errors
      });
    }

  } catch (error: any) {
    console.error('Error sending shoutout:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to send shoutout',
      message: error.message
    });
  }
});

// Get shoutout history
router.get('/history', isAuthenticated, requirePermission('MANAGE_USERS'), async (req, res) => {
  try {
    const history = await storage.getShoutoutHistory();
    res.json(history);
  } catch (error: any) {
    console.error('Error fetching shoutout history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shoutout history',
      message: error.message
    });
  }
});

export default router;