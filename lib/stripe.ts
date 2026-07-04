import Stripe from "stripe";

export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function getStripe(): Stripe | null {
  if (!isStripeEnabled()) return null;

  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });
}

export const PLANS = {
  developer: {
    name: "Developer",
    price: 1900,
    priceId: process.env.STRIPE_DEVELOPER_PRICE_ID,
  },
  business: {
    name: "Business",
    price: 4900,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID,
  },
} as const;