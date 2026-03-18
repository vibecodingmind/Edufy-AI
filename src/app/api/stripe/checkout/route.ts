import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-config';
import { db } from '@/lib/db';
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planSlug, billingCycle } = await request.json();

    if (!planSlug || !billingCycle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get plan
    const plan = await db.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Get Stripe price ID
    const priceId = billingCycle === 'yearly' 
      ? plan.stripePriceIdYearly 
      : plan.stripePriceIdMonthly;

    // For demo purposes, use mock price IDs if not set
    const mockPriceId = `price_${planSlug}_${billingCycle}_mock`;

    // Get or create customer
    const customer = await getOrCreateCustomer(
      (user as any).id,
      user.email!,
      user.name || ''
    );

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await createCheckoutSession(
      customer.id,
      priceId || mockPriceId,
      `${baseUrl}/?checkout=success`,
      `${baseUrl}/?checkout=cancel`,
      {
        userId: (user as any).id,
        planSlug,
        billingCycle,
      }
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
