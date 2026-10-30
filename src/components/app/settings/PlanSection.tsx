import { startCheckout, openBillingPortal } from "@/app/app/billing/actions";
import { Button } from "@/components/ui/Button";
import { PlanComparison } from "@/components/site/PlanComparison";
import type { SubscriptionRow } from "@/lib/database.types";

type Props = {
  isPro: boolean;
  subscription: Pick<SubscriptionRow, "status" | "current_period_end" | "cancel_at_period_end" | "price_id"> | null;
  stripeReady: boolean;
  notice?: string;
};

const NOTICES: Record<string, string> = {
  success: "Welcome to Pro. It can take a few seconds to show up here.",
  canceled: "No charge was made. You can come back to this any time.",
  unconfigured: "Pro isn't switched on for this deployment yet, so nothing was charged.",
  nocustomer: "There's no billing record for this account yet.",
  error: "Stripe didn't return a checkout page. Nothing was charged. Please try again.",
};

export function PlanSection({ isPro, subscription, stripeReady, notice }: Props) {
  const renews = subscription?.current_period_end
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(subscription.current_period_end))
    : null;

  return (
    <div id="plan" className="space-y-5">
      {notice && NOTICES[notice] ? (
        <p role="status" className="rounded-md bg-sage-tint px-4 py-3 text-[15px]">
          {NOTICES[notice]}
        </p>
      ) : null}

      <div className="rounded-lg bg-paper p-5 shadow-soft">
        <p className="text-[13px] uppercase tracking-wider text-ink-mute">Your plan</p>
        <p className="mt-1 text-[1.3rem]">{isPro ? "Pro" : "Free"}</p>
        {isPro && renews ? (
          <p className="mt-1 text-[15px] text-ink-soft">
            {subscription?.cancel_at_period_end ? `Pro until ${renews}, then back to Free.` : `Renews ${renews}.`}
          </p>
        ) : null}
        {!isPro ? (
          <p className="mt-1 text-[15px] text-ink-soft">Everything essential, free forever. Pro adds the extras below.</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {isPro ? (
            <form action={openBillingPortal}>
              <Button type="submit" variant="secondary">Manage billing</Button>
            </form>
          ) : (
            <>
              <form action={startCheckout}>
                <input type="hidden" name="plan" value="monthly" />
                <Button type="submit" variant="primary" disabled={!stripeReady}>Go Pro · $6/month</Button>
              </form>
              <form action={startCheckout}>
                <input type="hidden" name="plan" value="yearly" />
                <Button type="submit" variant="secondary" disabled={!stripeReady}>$49/year</Button>
              </form>
            </>
          )}
        </div>
        {!stripeReady ? (
          <p className="mt-3 text-[13px] text-ink-mute">Billing isn&apos;t connected on this deployment yet.</p>
        ) : (
          <p className="mt-3 text-[13px] text-ink-mute">Test mode. Cancel anytime; you keep Pro until the period ends.</p>
        )}
      </div>

      <PlanComparison compact />
    </div>
  );
}
