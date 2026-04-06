import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { stripe, STRIPE_PRICE_ID } from '$lib/server/stripe';
import { verifyToken, getUserById, updateUserSubscription } from '$lib/server/auth';

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();
  if (!user) redirect(302, '/login');
  return { subscriptionStatus: user.subscriptionStatus };
};

export const actions: Actions = {
  checkout: async ({ cookies, url }) => {
    const token = cookies.get('auth_token');
    if (!token) redirect(302, '/login');
    const payload = verifyToken(token);
    if (!payload) redirect(302, '/login');

    const user = await getUserById(payload.userId);
    if (!user) redirect(302, '/login');

    if (!STRIPE_PRICE_ID) {
      return fail(500, { error: 'Stripe is not configured. Please set STRIPE_PRICE_ID.' });
    }

    try {
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          metadata: { userId: user.id, username: user.username }
        });
        customerId = customer.id;
        await updateUserSubscription(user.id, { stripeCustomerId: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
        mode: 'subscription',
        success_url: `${url.origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url.origin}/subscribe`,
        metadata: { userId: user.id }
      });

      redirect(302, session.url!);
    } catch (err) {
      console.error('Stripe checkout error:', err);
      return fail(500, { error: 'Failed to create checkout session. Please try again.' });
    }
  }
};
