import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePasswordResetToken, sendEmail, emailTemplates } from '@/lib/email';

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({ success: true, message: 'If email exists, reset link sent' });
    }

    // Generate token
    const token = await generatePasswordResetToken(email);

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const template = emailTemplates.passwordReset(user.name, token, baseUrl);

    await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      template: 'password_reset',
    });

    return NextResponse.json({ success: true, message: 'If email exists, reset link sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to process password reset' }, { status: 500 });
  }
}
