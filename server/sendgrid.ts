import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log(`Attempting to send email to ${params.to} from ${params.from} with subject: ${params.subject}`);
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    if (error.response && error.response.body) {
      console.error('SendGrid error details:', JSON.stringify(error.response.body, null, 2));
    }
    return false;
  }
}

export async function sendSuggestionNotification(suggestion: {
  title: string;
  description: string;
  category: string;
  priority: string;
  submittedBy: string;
  submittedAt: Date;
}): Promise<boolean> {
  const emailContent = `
New Suggestion Submitted to The Sandwich Project

Title: ${suggestion.title}
Category: ${suggestion.category}
Priority: ${suggestion.priority}
Submitted by: ${suggestion.submittedBy}
Submitted at: ${suggestion.submittedAt.toLocaleString()}

Description:
${suggestion.description}

---
This is an automated notification from The Sandwich Project suggestions portal.
  `.trim();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #236383;">New Suggestion Submitted</h2>
      <p>A new suggestion has been submitted to The Sandwich Project suggestions portal.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">${suggestion.title}</h3>
        <p><strong>Category:</strong> ${suggestion.category}</p>
        <p><strong>Priority:</strong> ${suggestion.priority}</p>
        <p><strong>Submitted by:</strong> ${suggestion.submittedBy}</p>
        <p><strong>Submitted at:</strong> ${suggestion.submittedAt.toLocaleString()}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h4>Description:</h4>
        <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 4px;">${suggestion.description}</p>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">This is an automated notification from The Sandwich Project suggestions portal.</p>
    </div>
  `;

  return sendEmail({
    to: 'katielong2316@gmail.com', // Your email for development notifications
    from: 'katielong2316@gmail.com', // Using your verified email as sender
    subject: `New Suggestion: ${suggestion.title}`,
    text: emailContent,
    html: htmlContent,
  });
}