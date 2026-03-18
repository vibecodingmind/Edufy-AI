import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/subscriptions - Get current user's subscription
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.userId },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      // Create free subscription if none exists
      const freePlan = await db.subscriptionPlan.findUnique({
        where: { slug: 'free' },
      });

      if (freePlan) {
        const newSubscription = await db.subscription.create({
          data: {
            userId: session.userId,
            planId: freePlan.id,
            status: 'active',
            billingCycle: 'monthly',
          },
          include: { plan: true },
        });
        return NextResponse.json({ subscription: newSubscription });
      }
    }

    // Check if we need to reset monthly usage
    const now = new Date();
    const lastReset = subscription?.lastUsageReset ? new Date(subscription.lastUsageReset) : null;
    const shouldReset = !lastReset || 
      (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear());

    if (subscription && shouldReset) {
      const updated = await db.subscription.update({
        where: { id: subscription.id },
        data: {
          examsThisMonth: 0,
          lastUsageReset: now,
        },
        include: { plan: true },
      });
      return NextResponse.json({ subscription: updated });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Subscribe to a plan
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planSlug, billingCycle } = await request.json();

    if (!planSlug) {
      return NextResponse.json({ error: 'Plan slug is required' }, { status: 400 });
    }

    const plan = await db.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Calculate end date based on billing cycle
    const startDate = new Date();
    let endDate: Date;
    
    if (billingCycle === 'yearly') {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // For free plan, just create/update without payment
    if (planSlug === 'free') {
      const subscription = await db.subscription.upsert({
        where: { userId: session.userId },
        update: {
          planId: plan.id,
          status: 'active',
          billingCycle: billingCycle || 'monthly',
          startDate,
          endDate,
          cancelledAt: null,
        },
        create: {
          userId: session.userId,
          planId: plan.id,
          status: 'active',
          billingCycle: billingCycle || 'monthly',
          startDate,
          endDate,
        },
        include: { plan: true },
      });

      return NextResponse.json({ subscription });
    }

    // For paid plans, we would integrate with Stripe here
    // For now, we'll create a pending subscription
    const subscription = await db.subscription.upsert({
      where: { userId: session.userId },
      update: {
        planId: plan.id,
        status: 'pending',
        billingCycle: billingCycle || 'monthly',
        startDate,
        endDate,
      },
      create: {
        userId: session.userId,
        planId: plan.id,
        status: 'pending',
        billingCycle: billingCycle || 'monthly',
        startDate,
        endDate,
      },
      include: { plan: true },
    });

    return NextResponse.json({ 
      subscription,
      message: 'Subscription created. Payment integration required for paid plans.',
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions - Cancel subscription
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.userId },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Downgrade to free plan
    const freePlan = await db.subscriptionPlan.findUnique({
      where: { slug: 'free' },
    });

    if (!freePlan) {
      return NextResponse.json({ error: 'Free plan not found' }, { status: 500 });
    }

    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: freePlan.id,
        status: 'cancelled',
        cancelledAt: new Date(),
      },
      include: { plan: true },
    });

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
