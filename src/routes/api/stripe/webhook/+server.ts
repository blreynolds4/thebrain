import type { RequestHandler } from './$types';
import { stripe, STRIPE_WEBHOOK_SECRET } from '$lib/server/stripe';
import { esClient, USERS_INDEX } from '$lib/server/elasticsearch';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const validStatuses = ['active', 'trialing', 'canceled', 'past_due'] as const;
        type ValidStatus = typeof validStatuses[number];
        const status = validStatuses.includes(subscription.status as ValidStatus)
          ? (subscription.status as ValidStatus)
          : 'inactive' as const;
        if (status !== 'inactive') {
          await updateSubscriptionByCustomer(customerId, { subscriptionStatus: status, subscriptionId: subscription.id });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await updateSubscriptionByCustomer(customerId, {
          subscriptionStatus: 'canceled',
          subscriptionId: subscription.id
        });
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response('Handler error', { status: 500 });
  }

  return new Response('ok', { status: 200 });
};

async function updateSubscriptionByCustomer(customerId: string, updates: {
  subscriptionStatus: 'active' | 'trialing' | 'canceled' | 'past_due';
  subscriptionId: string;
}) {
  try {
    const result = await esClient.search({
      index: USERS_INDEX,
      query: { term: { stripeCustomerId: customerId } }
    });
    const hits = result.hits.hits;
    if (hits.length > 0) {
      await esClient.update({
        index: USERS_INDEX,
        id: hits[0]._id as string,
        doc: updates,
        refresh: true
      });
    }
  } catch (err) {
    console.error('Error updating subscription for customer:', customerId, err);
  }
}
