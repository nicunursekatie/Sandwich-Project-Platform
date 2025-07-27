// Quick test to verify SendGrid is working
import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY environment variable is missing");
  process.exit(1);
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

async function testEmail() {
  try {
    console.log('Testing SendGrid email delivery...');
    
    const result = await mailService.send({
      to: 'katielong2316@gmail.com',
      from: 'katielong2316@gmail.com', // Your verified sender
      subject: 'SendGrid Test Email - The Sandwich Project',
      text: 'This is a test email to verify SendGrid is working properly.',
      html: '<p>This is a test email to verify SendGrid is working properly.</p><p>Sent at: ' + new Date().toLocaleString() + '</p>'
    });
    
    console.log('Email sent successfully!');
    console.log('Response:', result);
    
  } catch (error) {
    console.error('SendGrid error:', error);
    if (error.response && error.response.body) {
      console.error('Error details:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

testEmail();