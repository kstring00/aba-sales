"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStripe, stripeConfigured } from "@/lib/billing/stripe";
import { adminConfigured, createAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

const PRICES: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
};

async function ensureCustomer(userId: string, email: string | undefined): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", userId).maybeSingle();
  if (data?.stripe_customer_id) return data.stripe_customer_id;

  const stripe = getStripe();
  const customer = await stripe.customers.create({ email, metadata: { user_id: userId } });
  // Record it now so a second checkout reuses the same customer.
  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .upsert({ user_id: userId, stripe_customer_id: customer.id, status: "inactive", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return customer.id;
}

/** Starts a Stripe Checkout session for Pro (TEST MODE prices). */
export async function startCheckout(formData: FormData): Promise<void> {
  const user = await requireUser("/app/settings");
  const plan = String(formData.get("plan") ?? "monthly");
  const price = PRICES[plan];
  if (!stripeConfigured() || !adminConfigured() || !price) redirect("/app/settings?billing=unconfigured#plan");

  const customer = await ensureCustomer(user.id, user.email);
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    success_url: `${publicEnv.siteUrl}/app/settings?billing=success#plan`,
    cancel_url: `${publicEnv.siteUrl}/app/settings?billing=canceled#plan`,
  });
  if (!session.url) redirect("/app/settings?billing=error#plan");
  redirect(session.url);
}

/** Opens the Stripe Customer Portal for cancel, card changes, and invoices. */
export async function openBillingPortal(): Promise<void> {
  const user = await requireUser("/app/settings");
  if (!stripeConfigured()) redirect("/app/settings?billing=unconfigured#plan");
  const supabase = await createClient();
  const { data } = await supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!data?.stripe_customer_id) redirect("/app/settings?billing=nocustomer#plan");
  const portal = await getStripe().billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${publicEnv.siteUrl}/app/settings#plan`,
  });
  redirect(portal.url);
}
