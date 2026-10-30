import "server-only";

/**
 * Cancels a user's Stripe subscription immediately as part of account
 * deletion. Safe no-op when Stripe is not configured.
 */
export async function cancelStripeForUser(stripeSubscriptionId: string | null | undefined): Promise<void> {
  if (!stripeSubscriptionId || !process.env.STRIPE_SECRET_KEY) return;
  const { getStripe } = await import("@/lib/billing/stripe");
  const stripe = getStripe();
  try {
    await stripe.subscriptions.cancel(stripeSubscriptionId);
  } catch {
    // Already canceled or missing. Deletion continues regardless.
  }
}
