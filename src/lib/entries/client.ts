"use client";

import { createClient } from "@/lib/supabase/client";
import type { AntecedentCode, ConsequenceCode, EntryRow } from "@/lib/database.types";

/**
 * Entry writes from the browser. RLS is the authorization boundary; the id is
 * generated on the client so a retried write is idempotent (milestone 4 adds
 * the offline queue around these calls).
 */
export type EntryDraft = {
  id: string;
  child_id: string;
  behavior_id: string;
  occurred_at: string;
  antecedent_code: AntecedentCode | null;
  antecedent_note: string | null;
  consequence_code: ConsequenceCode | null;
  consequence_note: string | null;
  duration_seconds: number | null;
  intensity: number | null;
  note: string | null;
};

export function newEntryId() {
  return crypto.randomUUID();
}

export async function insertEntry(draft: EntryDraft, userId: string): Promise<EntryRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("entries")
    .upsert({ ...draft, created_by: userId }, { onConflict: "id", ignoreDuplicates: true })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  // ignoreDuplicates returned nothing: the row already exists. Fetch it.
  const { data: existing, error: e2 } = await supabase.from("entries").select("*").eq("id", draft.id).single();
  if (e2) throw e2;
  return existing;
}

export async function updateEntry(
  id: string,
  patch: Partial<Omit<EntryDraft, "id" | "child_id">>,
): Promise<EntryRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from("entries").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw error;
}

export async function insertBehavior(childId: string, label: string, sortOrder: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("behaviors")
    .insert({ child_id: childId, label, sort_order: sortOrder })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
