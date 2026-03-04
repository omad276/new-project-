import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backward compatibility
export const stripe = {
  get customers() {
    return getStripe().customers;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

export const PLANS = {
  free: {
    name: 'Starter',
    price: 0,
    priceId: null,
    features: [
      '10 route calculations/month',
      'Basic cost breakdown',
      '3 route corridors',
      'Email support',
    ],
    limits: {
      monthlyAnalyses: 10,
    },
  },
  pro: {
    name: 'Professional',
    price: 99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited route calculations',
      'Detailed cost analytics',
      'API access',
      'Priority support',
      'Custom cargo profiles',
      'Historical data export',
    ],
    limits: {
      monthlyAnalyses: -1, // unlimited
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Everything in Professional',
      'AI-powered route optimization',
      'Real-time risk monitoring',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
    limits: {
      monthlyAnalyses: -1, // unlimited
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanType {
  if (priceId === PLANS.pro.priceId) return 'pro';
  if (priceId === PLANS.enterprise.priceId) return 'enterprise';
  return 'free';
}
