import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/billing/stripe";
import { handleStripeEvent } from "@/lib/billing/webhook";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Stripe → subscriptions table. The only writer of that table.
 * Signature is verified against the raw body before anything is parsed.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = request.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "webhook not configured" }, { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  const summary = await handleStripeEvent(event, {
    upsert: async (row) => {
      const { error } = await admin.from("subscriptions").upsert(row, { onConflict: "user_id" });
      if (error) throw error;
    },
    userIdForCustomer: async (customerId) => {
      const { data } = await admin.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
      return data?.user_id ?? null;
    },
  });

  // No prompts, no PII: just the event type and a status word.
  console.log(`[stripe] ${event.id} ${summary}`);
  return NextResponse.json({ received: true });
}
