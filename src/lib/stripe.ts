import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
} as const;

export type BillingPlan = "free" | "starter" | "pro";
