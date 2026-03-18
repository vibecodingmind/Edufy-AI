import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateVerificationToken, sendEmail, emailTemplates } from '@/lib/email';
import { getCurrentUser } from '@/lib/auth-config';

// POST - Send verification email
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Can be called by logged in user or with email in body
    const body = user ? {} : await request.json();
    const email = body.email || user?.email;
    const name = body.name || user?.name || 'User';

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if already verified
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser?.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Generate token
    const token = await generateVerificationToken(email);

    // Send email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const template = emailTemplates.verification(name, token, baseUrl);

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      template: 'verification',
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Verification email sent' });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
