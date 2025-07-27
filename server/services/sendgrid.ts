import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn("⚠️  SENDGRID_API_KEY not found in environment variables");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("✅ SendGrid configured successfully");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid API key not configured");
    }

    const msg = {
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html || params.text?.replace(/\n/g, '<br>')
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${params.to}`);
    return true;
  } catch (error: any) {
    console.error('❌ SendGrid email error:', error);
    
    // Log more details for debugging
    if (error.response?.body) {
      console.error('SendGrid error details:', error.response.body);
    }
    
    throw error;
  }
}

export async function sendBulkEmail(emails: EmailParams[]): Promise<{ success: number; failed: number; errors: string[] }> {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of emails) {
    try {
      await sendEmail(email);
      success++;
    } catch (error: any) {
      failed++;
      errors.push(`Failed to send to ${email.to}: ${error.message}`);
    }
  }

  return { success, failed, errors };
}