import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { createBillingPortalSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: (user as any).id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${baseUrl}/`
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
