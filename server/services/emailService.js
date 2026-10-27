/**
 * Email Service - NHERAMS
 * Handles sending emails for user verification and notifications
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

// Initialize email transporter
const initializeTransporter = async () => {
  if (transporter) return transporter;
  
  const isProduction = process.env.NODE_ENV === 'production';
  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD;
  
  if ((isProduction || hasSmtpConfig) && process.env.SMTP_HOST !== 'mail.jobiz.ng') {
    // Use provided SMTP config
    console.log('Initializing SMTP transporter for:', process.env.SMTP_HOST);
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const secure = port === 465; // Port 465 requires SSL/TLS
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      connectionTimeout: 5000,
      socketTimeout: 5000
    });
  } else {
    // Development: Use Ethereal test email (more reliable)
    console.log('Initializing Ethereal test email transporter...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('Ethereal account created:', testAccount.user);
    } catch (error) {
      console.error('Failed to create Ethereal test account:', error);
      // Fallback: create a dummy transporter that logs emails
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }
  
  return transporter;
};

export const sendVerificationEmail = async (email, token, userName) => {
  try {
    const transporter = await initializeTransporter();
    const verificationLink = `${process.env.VERIFICATION_BASE_URL}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Verify Your NHERAMS Account Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #057A55; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">NHERAMS</h1>
            <p style="margin: 5px 0 0 0;">Nigerian Health Energy Resilience & Access Management</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${userName}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for registering with NHERAMS. To complete your registration and verify your email address, please click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="
                background-color: #057A55;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                display: inline-block;
              ">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #4b5563; font-size: 12px; line-height: 1.6;">
              Or copy and paste this link in your browser:<br/>
              <span style="word-break: break-all; color: #057A55;">${verificationLink}</span>
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              This link will expire in 24 hours.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              If you did not create this account, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2026 Federal Ministry of Health & Social Welfare. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Test email preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error(`Email service error: ${error.message || 'Failed to send verification email'}`);
  }
};

export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = await initializeTransporter();
    console.log('Sending password reset email to:', email);
    const resetLink = `${process.env.VERIFICATION_BASE_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your NHERAMS Account Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #057A55; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">NHERAMS</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              We received a request to reset the password for your NHERAMS account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="
                background-color: #057A55;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                display: inline-block;
              ">
                Reset Password
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">
              This link will expire in 1 hour.
            </p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
