/**
 * Email Configuration Test Script
 * Tests SMTP connection and sends a test email
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmailConfig = async () => {
  console.log('🔍 Testing Email Configuration...\n');
  console.log('Configuration Details:');
  console.log('- Host:', process.env.SMTP_HOST);
  console.log('- Port:', process.env.SMTP_PORT);
  console.log('- User:', process.env.SMTP_USER);
  console.log('- From:', process.env.SMTP_FROM_EMAIL);
  console.log('- From Name:', process.env.SMTP_FROM_NAME);
  console.log('\n');

  try {
    // Create transporter with the SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // SSL/TLS for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      connectionTimeout: 10000,
      socketTimeout: 10000
    });

    console.log('🔗 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send a test email
    console.log('📧 Sending test email...');
    const testEmail = process.env.SMTP_USER || 'test@nountutor.com.ng';
    
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: testEmail,
      subject: 'NHERAMS - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #057A55; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">NHERAMS Portal</h1>
            <p style="margin: 5px 0 0 0;">Email Configuration Test</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Email Service Test</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              ✅ Your SMTP configuration is working correctly!
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              <strong>Test Details:</strong><br/>
              - Timestamp: ${new Date().toISOString()}<br/>
              - SMTP Host: ${process.env.SMTP_HOST}<br/>
              - Port: ${process.env.SMTP_PORT}
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              This email confirms that your email service is properly configured and ready to send verification emails to users.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2026 Federal Ministry of Health & Social Welfare. All rights reserved.</p>
          </div>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('\n📨 Email Details:');
    console.log('- Message ID:', info.messageId);
    console.log('- Response:', info.response);
    console.log('\n✨ Email configuration is working perfectly!');
    console.log('✨ The system is ready to send verification emails to users.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing email configuration:');
    console.error('- Error Type:', error.code || error.name);
    console.error('- Message:', error.message);
    
    if (error.response) {
      console.error('- SMTP Response:', error.response);
    }
    
    console.error('\n⚠️ Troubleshooting Steps:');
    console.error('1. Verify credentials are correct:');
    console.error('   - Host: mail.nountutor.com.ng');
    console.error('   - Port: 465 (SSL/TLS)');
    console.error('   - Username: info@nountutor.com.ng');
    console.error('2. Check if port 465 is accessible from your network');
    console.error('3. Verify the password is correct');
    console.error('4. Ensure the account is active on the mail server\n');

    process.exit(1);
  }
};

testEmailConfig();
