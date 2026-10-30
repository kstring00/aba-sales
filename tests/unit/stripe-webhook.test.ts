import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import { handleStripeEvent, mapStatus, subscriptionToRow, type SubscriptionUpsert } from "@/lib/billing/webhook";

const SECRET = "whsec_test_secret_for_unit_tests";
const stripe = new Stripe("sk_test_unused", { typescript: true });

function signed(event: object) {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  return { payload, header };
}

function subEvent(type: string, overrides: Record<string, unknown> = {}) {
  return {
    id: "evt_1",
    object: "event",
    type,
    api_version: "2025-01-01",
    created: 1700000000,
    data: {
      object: {
        id: "sub_123",
        object: "subscription",
        customer: "cus_123",
        status: "active",
        cancel_at_period_end: false,
        metadata: { user_id: "user-abc" },
        items: { data: [{ id: "si_1", price: { id: "price_monthly" }, current_period_end: 1750000000 }] },
        ...overrides,
      },
    },
    livemode: false,
    pending_webhooks: 1,
    request: null,
  };
}

describe("stripe webhook", () => {
  it("rejects a tampered payload", () => {
    const { payload, header } = signed(subEvent("customer.subscription.updated"));
    expect(() => stripe.webhooks.constructEvent(payload + " ", header, SECRET)).toThrow();
    expect(() => stripe.webhooks.constructEvent(payload, header, "whsec_other")).toThrow();
  });

  it("verifies a correctly signed event and maps it to a subscriptions row", async () => {
    const { payload, header } = signed(subEvent("customer.subscription.updated"));
    const event = stripe.webhooks.constructEvent(payload, header, SECRET);
    const rows: SubscriptionUpsert[] = [];
    const summary = await handleStripeEvent(event, {
      upsert: async (r) => {
        rows.push(r);
      },
      userIdForCustomer: async () => null,
    });
    expect(summary).toContain("active");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      user_id: "user-abc",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      status: "active",
      price_id: "price_monthly",
      current_period_end: new Date(1750000000 * 1000).toISOString(),
      cancel_at_period_end: false,
    });
  });

  it("falls back to the customer lookup when metadata has no user id", async () => {
    const { payload, header } = signed(subEvent("customer.subscription.created", { metadata: {} }));
    const event = stripe.webhooks.constructEvent(payload, header, SECRET);
    const rows: SubscriptionUpsert[] = [];
    await handleStripeEvent(event, {
      upsert: async (r) => {
        rows.push(r);
      },
      userIdForCustomer: async (c) => (c === "cus_123" ? "user-from-lookup" : null),
    });
    expect(rows[0].user_id).toBe("user-from-lookup");
  });

  it("marks deleted subscriptions canceled and maps unusual statuses", async () => {
    const { payload, header } = signed(subEvent("customer.subscription.deleted", { status: "active" }));
    const event = stripe.webhooks.constructEvent(payload, header, SECRET);
    const rows: SubscriptionUpsert[] = [];
    await handleStripeEvent(event, { upsert: async (r) => { rows.push(r); }, userIdForCustomer: async () => null });
    expect(rows[0].status).toBe("canceled");
    expect(mapStatus("incomplete_expired")).toBe("incomplete");
    expect(mapStatus("paused")).toBe("inactive");
    expect(mapStatus("trialing")).toBe("trialing");
  });

  it("records the customer on checkout completion and ignores unrelated events", async () => {
    const checkout = {
      ...subEvent("checkout.session.completed"),
      data: {
        object: {
          id: "cs_1",
          object: "checkout.session",
          mode: "subscription",
          client_reference_id: "user-abc",
          customer: "cus_123",
          subscription: "sub_123",
          payment_status: "paid",
        },
      },
    };
    const { payload, header } = signed(checkout);
    const event = stripe.webhooks.constructEvent(payload, header, SECRET);
    const rows: SubscriptionUpsert[] = [];
    await handleStripeEvent(event, { upsert: async (r) => { rows.push(r); }, userIdForCustomer: async () => null });
    expect(rows[0]).toMatchObject({ user_id: "user-abc", stripe_customer_id: "cus_123", status: "active" });

    const other = signed({ ...subEvent("invoice.paid") });
    const ev2 = stripe.webhooks.constructEvent(other.payload, other.header, SECRET);
    const summary = await handleStripeEvent(ev2, { upsert: async () => { throw new Error("should not write"); }, userIdForCustomer: async () => null });
    expect(summary).toContain("ignored");
  });

  it("reads legacy current_period_end when present", () => {
    const sub = subEvent("x", { current_period_end: 1760000000 }).data.object as unknown as Stripe.Subscription;
    expect(subscriptionToRow(sub, "u").current_period_end).toBe(new Date(1760000000 * 1000).toISOString());
  });
});
