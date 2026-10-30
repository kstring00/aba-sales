import type Stripe from "stripe";
import type { SubscriptionStatus } from "@/lib/database.types";

/**
 * Pure mapping from Stripe events to our subscriptions row. Kept free of IO so
 * it can be unit-tested with signed fixture events and no network.
 */
export type SubscriptionUpsert = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
};

export function mapStatus(s: Stripe.Subscription.Status | string): SubscriptionStatus {
  switch (s) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete";
    case "paused":
    default:
      return "inactive";
  }
}

function periodEnd(sub: Stripe.Subscription): string | null {
  // API versions from 2025 moved current_period_end onto subscription items.
  const legacy = (sub as unknown as { current_period_end?: number }).current_period_end;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  const ts = legacy ?? item?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

function idOf(x: string | { id: string } | null | undefined): string | null {
  if (!x) return null;
  return typeof x === "string" ? x : x.id;
}

export function subscriptionToRow(sub: Stripe.Subscription, userId: string): SubscriptionUpsert {
  return {
    user_id: userId,
    stripe_customer_id: idOf(sub.customer as string | { id: string }),
    stripe_subscription_id: sub.id,
    status: mapStatus(sub.status),
    price_id: sub.items?.data?.[0]?.price?.id ?? null,
    current_period_end: periodEnd(sub),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  };
}

export type WebhookDeps = {
  upsert: (row: SubscriptionUpsert) => Promise<void>;
  userIdForCustomer: (customerId: string) => Promise<string | null>;
};

/** Returns a short description of what was done, for logs. Never throws on unknown events. */
export async function handleStripeEvent(event: Stripe.Event, deps: WebhookDeps): Promise<string> {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.client_reference_id ?? s.metadata?.user_id ?? null;
      const customer = idOf(s.customer as string | { id: string });
      if (!userId || s.mode !== "subscription") return "ignored checkout (no user or not a subscription)";
      await deps.upsert({
        user_id: userId,
        stripe_customer_id: customer,
        stripe_subscription_id: idOf(s.subscription as string | { id: string }),
        // The subscription.* events that follow carry the authoritative status.
        status: s.payment_status === "paid" ? "active" : "incomplete",
        price_id: null,
        current_period_end: null,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      });
      return `checkout completed for ${userId}`;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = idOf(sub.customer as string | { id: string });
      const userId = sub.metadata?.user_id ?? (customer ? await deps.userIdForCustomer(customer) : null);
      if (!userId) return `no user for subscription ${sub.id}`;
      const row = subscriptionToRow(sub, userId);
      if (event.type === "customer.subscription.deleted") row.status = "canceled";
      await deps.upsert(row);
      return `${event.type} → ${row.status} for ${userId}`;
    }
    default:
      return `ignored ${event.type}`;
  }
}
