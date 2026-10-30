import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Server-only Stripe client. TEST MODE keys only until launch. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!client) client = new Stripe(key, { typescript: true });
  return client;
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
