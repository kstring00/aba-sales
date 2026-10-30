import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getEntries, getTimeZone } from "@/lib/data";
import { assertChildAccess } from "@/lib/access";
import { addDays, isDateStr, toDateStr, zonedEndOfDay, zonedStartOfDay } from "@/lib/time/zoned";
import { buildReport } from "./report";

/**
 * Shared by the PDF and CSV routes. Authorization happens twice on purpose:
 * assertChildAccess() refuses early with a clear error, and RLS refuses in
 * the database if anything slipped past.
 */
export async function reportForRequest(params: URLSearchParams) {
  const childId = params.get("child") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(childId)) throw new ExportError(400, "Missing child.");
  await assertChildAccess(childId);

  const tz = await getTimeZone();
  const today = toDateStr(new Date(), tz);
  const to = isDateStr(params.get("to")) ? params.get("to")! : today;
  const from = isDateStr(params.get("from")) ? params.get("from")! : addDays(to, -27);
  if (from > to) throw new ExportError(400, "The start date is after the end date.");
  if (addDays(from, 366) < to) throw new ExportError(400, "Please export a year or less at a time.");

  const supabase = await createClient();
  const { data: child } = await supabase.from("children").select("nickname").eq("id", childId).single();
  if (!child) throw new ExportError(404, "Child not found.");

  const entries = await getEntries(childId, {
    from: zonedStartOfDay(from, tz),
    to: zonedEndOfDay(to, tz),
    limit: 5000,
  });

  const report = buildReport({ nickname: child.nickname, from, to, tz, entries });
  const slug = child.nickname.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "child";
  return { report, filename: `support-shelf-${slug}-${from}-to-${to}` };
}

export class ExportError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
