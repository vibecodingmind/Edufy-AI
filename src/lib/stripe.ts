import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
});

export const STRIPE_CONFIG = {
  currency: 'usd',
  billingReason: {
    subscription_create: 'subscription_create',
    subscription_update: 'subscription_update',
    subscription_cycle: 'subscription_cycle',
  },
};

// Create or retrieve Stripe customer
export async function getOrCreateCustomer(userId: string, email: string, name: string) {
  const { db } = await import('@/lib/db');
  
  const subscription = await db.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.stripeCustomerId) {
    const customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
    return customer as Stripe.Customer;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  return customer;
}

// Create checkout session
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata,
    },
  });

  return session;
}

// Create billing portal session
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Handle webhook events
export async function handleWebhookEvent(event: Stripe.Event) {
  const { db } = await import('@/lib/db');

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planSlug = session.metadata?.planSlug;
      const billingCycle = session.metadata?.billingCycle;

      if (!userId || !planSlug) break;

      const plan = await db.subscriptionPlan.findUnique({
        where: { slug: planSlug },
      });

      if (!plan) break;

      // Update or create subscription
      await db.subscription.upsert({
        where: { userId },
        update: {
          planId: plan.id,
          status: 'active',
          billingCycle: billingCycle || 'monthly',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          startDate: new Date(),
          endDate: billingCycle === 'yearly' 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          userId,
          planId: plan.id,
          status: 'active',
          billingCycle: billingCycle || 'monthly',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          startDate: new Date(),
          endDate: billingCycle === 'yearly'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Create invoice record
      await db.invoice.create({
        data: {
          subscriptionId: (await db.subscription.findUnique({ where: { userId } }))!.id,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || 'usd',
          status: 'paid',
          stripeInvoiceId: session.invoice as string,
          paidDate: new Date(),
        },
      });

      // Log activity
      await db.activity.create({
        data: {
          userId,
          type: 'subscription_created',
          title: 'Subscription Activated',
          description: `Subscribed to ${plan.name} plan (${billingCycle})`,
        },
      }).catch(() => {});

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      const userSubscription = await db.subscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!userSubscription) break;

      await db.subscription.update({
        where: { id: userSubscription.id },
        data: {
          status: subscription.status === 'active' ? 'active' : 
                  subscription.status === 'canceled' ? 'cancelled' :
                  subscription.status === 'past_due' ? 'expired' : 'pending',
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const userSubscription = await db.subscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!userSubscription) break;

      await db.subscription.update({
        where: { id: userSubscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const userSubscription = await db.subscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!userSubscription) break;

      await db.invoice.create({
        data: {
          subscriptionId: userSubscription.id,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          status: 'paid',
          stripeInvoiceId: invoice.id,
          paidDate: new Date(),
        },
      });

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const userSubscription = await db.subscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!userSubscription) break;

      await db.invoice.create({
        data: {
          subscriptionId: userSubscription.id,
          amount: invoice.amount_due / 100,
          currency: invoice.currency,
          status: 'failed',
          stripeInvoiceId: invoice.id,
        },
      });

      // Notify user
      const user = await db.user.findFirst({
        where: { subscription: { stripeCustomerId: customerId } },
      });

      if (user) {
        await db.notification.create({
          data: {
            userId: user.id,
            type: 'error',
            title: 'Payment Failed',
            message: 'Your subscription payment failed. Please update your payment method.',
          },
        });
      }

      break;
    }
  }
}
