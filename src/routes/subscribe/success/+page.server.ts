import type { PageServerLoad } from './$types';
import { stripe } from '$lib/server/stripe';
import { verifyToken, updateUserSubscription } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, cookies }) => {
  const sessionId = url.searchParams.get('session_id');
  const token = cookies.get('auth_token');

  if (sessionId && token) {
    const payload = verifyToken(token);
    if (payload) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.status === 'complete') {
          await updateUserSubscription(payload.userId, {
            subscriptionStatus: 'active',
            subscriptionId: session.subscription as string
          });
        }
      } catch (err) {
        console.error('Error verifying checkout session:', err);
      }
    }
  }

  return {};
};
