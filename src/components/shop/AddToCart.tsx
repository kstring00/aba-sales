"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { addLine, type CartActionState } from "@/app/cart/actions";

export function AddToCart({ variantId, available, price, compact = false }: { variantId: string; available: boolean; price: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<CartActionState, FormData>(addLine, null);
  if (!available || !variantId) {
    return <p className="text-[15px] text-ink-mute">Not available right now.</p>;
  }
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="variantId" value={variantId} />
      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Adding…" : price === "Free" ? "Get it free →" : compact ? "Get it →" : `Get it · ${price} →`}
      </Button>
      {state?.error ? <p role="alert" className="text-[14px]">{state.error}</p> : null}
      {!compact ? <p className="text-[13px] text-ink-mute">Checkout is handled by Shopify. Files arrive by email.</p> : null}
    </form>
  );
}
