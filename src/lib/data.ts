import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { BehaviorRow, ChildRow, EntryRow, CaregiverRole } from "@/lib/database.types";
import { DEFAULT_TZ, TZ_COOKIE, isValidTimeZone } from "@/lib/time/zoned";

export const CHILD_COOKIE = "ss_child";

export type ChildWithRole = ChildRow & { role: CaregiverRole };
export type EntryWithBehavior = EntryRow & { behavior_label: string };

export async function getTimeZone(): Promise<string> {
  const store = await cookies();
  const tz = store.get(TZ_COOKIE)?.value;
  return isValidTimeZone(tz) ? tz : DEFAULT_TZ;
}

/** All children the signed-in user is linked to, owners first, then by creation. */
export async function getChildren(): Promise<ChildWithRole[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("child_caregivers")
    .select("role, children(id, nickname, created_by, created_at)")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  const rows: ChildWithRole[] = [];
  for (const r of data as unknown as Array<{ role: CaregiverRole; children: ChildRow | null }>) {
    if (r.children) rows.push({ ...r.children, role: r.role });
  }
  rows.sort((a, b) => (a.role === b.role ? a.created_at.localeCompare(b.created_at) : a.role === "owner" ? -1 : 1));
  return rows;
}

/** The child the parent last chose, or the first one. Never a child they lack access to. */
export async function getSelectedChild(children: ChildWithRole[]): Promise<ChildWithRole | null> {
  if (children.length === 0) return null;
  const store = await cookies();
  const wanted = store.get(CHILD_COOKIE)?.value;
  return children.find((c) => c.id === wanted) ?? children[0];
}

export async function getBehaviors(childId: string, includeInactive = false): Promise<BehaviorRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("behaviors")
    .select("*")
    .eq("child_id", childId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (!includeInactive) q = q.eq("is_active", true);
  const { data } = await q;
  return data ?? [];
}

export type EntryFilters = {
  from?: Date;
  to?: Date; // exclusive
  behaviorId?: string;
  limit?: number;
};

export async function getEntries(childId: string, f: EntryFilters = {}): Promise<EntryWithBehavior[]> {
  const supabase = await createClient();
  let q = supabase
    .from("entries")
    .select("*, behaviors(label)")
    .eq("child_id", childId)
    .order("occurred_at", { ascending: false })
    .limit(f.limit ?? 500);
  if (f.from) q = q.gte("occurred_at", f.from.toISOString());
  if (f.to) q = q.lt("occurred_at", f.to.toISOString());
  if (f.behaviorId) q = q.eq("behavior_id", f.behaviorId);
  const { data } = await q;
  const rows = (data ?? []) as unknown as Array<EntryRow & { behaviors: { label: string } | null }>;
  return rows.map(({ behaviors, ...e }) => ({ ...e, behavior_label: behaviors?.label ?? "" }));
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data;
}
