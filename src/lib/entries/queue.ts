"use client";

/**
 * Entry submission with a stable interface. Milestone 2: direct writes.
 * Milestone 4 wraps these in a durable local queue so saves succeed offline.
 */
import type { EntryRow } from "@/lib/database.types";
import { deleteEntry, insertEntry, updateEntry, type EntryDraft } from "@/lib/entries/client";

export type SubmitResult = { entry: EntryRow; pending: boolean };

export async function submitEntry(draft: EntryDraft, userId: string): Promise<SubmitResult> {
  const entry = await insertEntry(draft, userId);
  return { entry, pending: false };
}

export async function submitEntryUpdate(
  id: string,
  patch: Partial<Omit<EntryDraft, "id" | "child_id">>,
  _userId: string,
): Promise<SubmitResult> {
  void _userId;
  const entry = await updateEntry(id, patch);
  return { entry, pending: false };
}

export async function submitEntryDelete(id: string, _userId: string): Promise<void> {
  void _userId;
  await deleteEntry(id);
}
