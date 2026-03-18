import nodemailer from 'nodemailer';
import { db } from '@/lib/db';

// Email transporter configuration
const createTransporter = () => {
  // For development, use a simpler config
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  template?: string;
}

// Send email
export async function sendEmail({ to, subject, html, text, template }: SendEmailOptions) {
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'EDUC.AI <noreply@educ.ai>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    // Log email
    await db.emailLog.create({
      data: {
        to,
        subject,
        template,
        status: 'sent',
        sentAt: new Date(),
      },
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    // Log failed email
    await db.emailLog.create({
      data: {
        to,
        subject,
        template,
        status: 'failed',
        error: error.message,
      },
    });

    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

// Generate verification token
export async function generateVerificationToken(email: string) {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  return token;
}

// Generate password reset token
export async function generatePasswordResetToken(email: string) {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    },
  });

  return token;
}

// Email templates
export const emailTemplates = {
  verification: (name: string, token: string, baseUrl: string) => ({
    subject: 'Verify your email - EDUC.AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; }
          .logo { font-size: 28px; font-weight: bold; color: #059669; }
          .content { background: #f9fafb; padding: 30px; border-radius: 12px; }
          .button { display: inline-block; background: #059669; color: white; padding: 14px 32px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 EDUC.AI</div>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for signing up for EDUC.AI! Please verify your email address to get started.</p>
            <p style="text-align: center;">
              <a href="${baseUrl}/verify-email?token=${token}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #059669;">${baseUrl}/verify-email?token=${token}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EDUC.AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (name: string, token: string, baseUrl: string) => ({
    subject: 'Reset your password - EDUC.AI',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; }
          .logo { font-size: 28px; font-weight: bold; color: #059669; }
          .content { background: #f9fafb; padding: 30px; border-radius: 12px; }
          .button { display: inline-block; background: #059669; color: white; padding: 14px 32px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 EDUC.AI</div>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <p style="text-align: center;">
              <a href="${baseUrl}/reset-password?token=${token}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #059669;">${baseUrl}/reset-password?token=${token}</p>
            <div class="warning">
              <p>⚠️ This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EDUC.AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcome: (name: string, planName: string) => ({
    subject: 'Welcome to EDUC.AI! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; }
          .logo { font-size: 28px; font-weight: bold; color: #059669; }
          .content { background: #f9fafb; padding: 30px; border-radius: 12px; }
          .feature { display: inline-block; width: 48%; padding: 10px; box-sizing: border-box; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 EDUC.AI</div>
          </div>
          <div class="content">
            <h2>Welcome to EDUC.AI, ${name}! 🎉</h2>
            <p>You're now on the <strong>${planName}</strong> plan. Get ready to transform your exam creation process!</p>
            <h3>Here's what you can do:</h3>
            <div class="feature">✨ Generate exams with AI</div>
            <div class="feature">📚 Upload past papers</div>
            <div class="feature">📄 Export to PDF</div>
            <div class="feature">📊 Track your usage</div>
            <p style="margin-top: 20px;">Ready to create your first exam? Log in and start exploring!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EDUC.AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  subscriptionActivated: (name: string, planName: string, amount: number, billingCycle: string) => ({
    subject: `Subscription Activated - ${planName} Plan`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; }
          .logo { font-size: 28px; font-weight: bold; color: #059669; }
          .content { background: #f9fafb; padding: 30px; border-radius: 12px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .highlight { background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 EDUC.AI</div>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Your subscription has been activated!</p>
            <div class="highlight">
              <h3 style="margin: 0;">${planName} Plan</h3>
              <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">$${amount.toFixed(2)}/${billingCycle === 'yearly' ? 'year' : 'month'}</p>
            </div>
            <p style="margin-top: 20px;">You now have access to all ${planName} features. Thank you for your support!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EDUC.AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  examShared: (name: string, examTitle: string, sharedBy: string, link: string) => ({
    subject: `${sharedBy} shared an exam with you`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; }
          .logo { font-size: 28px; font-weight: bold; color: #059669; }
          .content { background: #f9fafb; padding: 30px; border-radius: 12px; }
          .button { display: inline-block; background: #059669; color: white; padding: 14px 32px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎓 EDUC.AI</div>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p><strong>${sharedBy}</strong> has shared an exam with you:</p>
            <p style="font-size: 18px; font-weight: 600;">${examTitle}</p>
            <p style="text-align: center;">
              <a href="${link}" class="button">View Exam</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EDUC.AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};
