import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Everything the signed-in user can see, as JSON. Free, always. RLS scopes
 * each query, so this is exactly the data they own or were granted.
 */
export async function GET() {
  const user = await requireUser("/app/settings");
  const supabase = await createClient();

  const [profile, links, children, behaviors, entries, subscription] = await Promise.all([
    supabase.from("profiles").select("id, display_name, adult_attested_at, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("child_caregivers").select("child_id, user_id, role, created_at"),
    supabase.from("children").select("*"),
    supabase.from("behaviors").select("*"),
    supabase.from("entries").select("*").order("occurred_at", { ascending: true }).limit(100000),
    supabase.from("subscriptions").select("status, price_id, current_period_end, cancel_at_period_end").eq("user_id", user.id).maybeSingle(),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    format: "the-support-shelf/v1",
    account: { id: user.id, email: user.email, ...profile.data },
    children: children.data ?? [],
    caregiver_links: links.data ?? [],
    behaviors: behaviors.data ?? [],
    entries: entries.data ?? [],
    subscription: subscription.data ?? null,
    notes: [
      "Children are identified by nickname only.",
      "antecedent_code and consequence_code describe observable events, not causes.",
    ],
  };

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="support-shelf-all-data-${date}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
