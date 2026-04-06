import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY environment variable is required in production');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.acacia'
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
