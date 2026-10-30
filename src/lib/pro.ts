import "server-only";
import { createClient } from "@/lib/supabase/server";

export const PRO_ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * The only place Pro entitlement is decided. Server-side, reads the
 * subscriptions row (writable only by the Stripe webhook). Mirrors the SQL
 * function public.is_pro so app and database agree.
 */
export async function isPro(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return false;
  if (!PRO_ACTIVE_STATUSES.has(data.status)) return false;
  if (data.current_period_end) {
    const grace = 3 * 24 * 60 * 60 * 1000;
    if (new Date(data.current_period_end).getTime() + grace < Date.now()) return false;
  }
  return true;
}
