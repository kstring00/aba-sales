"use server";

import { z } from "zod";
import { addToList, listConfigured } from "@/lib/email/resend";

export type JoinState = { ok?: true; error?: string } | null;

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().max(60).optional(),
  website: z.string().max(0).optional(),
});

/**
 * Email list sign-up. Submitting this form is the opt-in, so the address
 * goes into the Resend segment, with the form name as a contact property.
 * Nothing else is kept.
 */
export async function joinList(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? undefined,
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) return { error: "That email doesn't look right." };
  if (!listConfigured()) return { error: "The list isn't open yet. Please check back soon." };
  try {
    await addToList(parsed.data.email, parsed.data.source ?? "site");
    return { ok: true };
  } catch {
    return { error: "We couldn't save that just now. Please try again in a moment." };
  }
}
