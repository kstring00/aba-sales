import "server-only";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { hashToken, looksLikeToken } from "@/lib/tokens";
import { buildReport } from "@/lib/export/report";
import type { EntryRow } from "@/lib/database.types";
import type { EntryWithBehavior } from "@/lib/data";
import { zonedEndOfDay, zonedStartOfDay, DEFAULT_TZ } from "@/lib/time/zoned";

/**
 * Resolves a public share token to a read-only report. Uses the service key
 * because the viewer has no account; the token hash, expiry, and revocation
 * are checked first, and nothing outside the link's child and range is read.
 */
export async function reportForShareToken(token: string) {
  if (!looksLikeToken(token) || !adminConfigured()) return null;
  const admin = createAdminClient();
  const { data: link } = await admin
    .from("share_links")
    .select("id, child_id, range_start, range_end, expires_at, revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!link || link.revoked_at || new Date(link.expires_at).getTime() < Date.now()) return null;
  // Dates arrive as "yyyy-mm-dd"; tolerate a client that sends a full timestamp.
  const rangeStart = String(link.range_start).slice(0, 10);
  const rangeEnd = String(link.range_end).slice(0, 10);

  const { data: child } = await admin.from("children").select("nickname").eq("id", link.child_id).maybeSingle();
  if (!child) return null;

  const tz = DEFAULT_TZ;
  const { data: rows } = await admin
    .from("entries")
    .select("*, behaviors(label)")
    .eq("child_id", link.child_id)
    .gte("occurred_at", zonedStartOfDay(rangeStart, tz).toISOString())
    .lt("occurred_at", zonedEndOfDay(rangeEnd, tz).toISOString())
    .order("occurred_at", { ascending: true })
    .limit(5000);
  const entries: EntryWithBehavior[] = ((rows ?? []) as unknown as Array<EntryRow & { behaviors: { label: string } | null }>).map(
    ({ behaviors, ...e }) => ({ ...e, behavior_label: behaviors?.label ?? "" }),
  );

  return {
    report: buildReport({ nickname: child.nickname, from: rangeStart, to: rangeEnd, tz, entries }),
    expiresAt: link.expires_at,
  };
}
