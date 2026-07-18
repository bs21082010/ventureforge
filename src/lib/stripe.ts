import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    description: "Perfect for getting started",
    priceId: null,
    amount: 0,
    features: [
      "1 business plan",
      "Basic financial projections",
      "Export to PDF",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    description: "For serious entrepreneurs",
    priceId: "price_pro_monthly",
    amount: 2900,
    features: [
      "Unlimited business plans",
      "AI-powered analysis",
      "Advanced financial engine",
      "Data source integrations",
      "Priority support",
    ],
  },
  business: {
    name: "Business",
    description: "For teams and agencies",
    priceId: "price_business_monthly",
    amount: 9900,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Compliance automation",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
  },
} as const;

export type PlanTier = keyof typeof PLANS;
