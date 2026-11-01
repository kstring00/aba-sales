"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { addToList, listConfigured, sendEmail, unsubscribeContact } from "@/lib/email/resend";
import { confirmationEmail } from "@/lib/email/templates";
import { listUnsubscribeHeaders, unsubscribePageUrl, verifyUnsubscribe } from "@/lib/email/unsubscribe";

export type JoinState = { ok?: true; error?: string } | null;

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().max(60).optional(),
  website: z.string().max(0).optional(),
});

// Sign-ups send an email, so the form must not become a way to flood
// someone's inbox: 5 per 10 minutes per IP, and one confirmation per
// address per day (per server instance).
const byIp = new Map<string, number[]>();
const confirmedAt = new Map<string, number>();
const TEN_MIN = 10 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

function ipLimited(ip: string) {
  const now = Date.now();
  const hits = (byIp.get(ip) ?? []).filter((t) => now - t < TEN_MIN);
  hits.push(now);
  byIp.set(ip, hits);
  return hits.length > 5;
}

/**
 * Email list sign-up. Submitting this form is the opt-in, so the address
 * goes into the Resend segment, with the form name as a contact property,
 * and gets one "You're on the list" email with an unsubscribe link.
 * Nothing else is kept.
 */
export async function joinList(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? undefined,
    website: formData.get("website") ?? "",
  });
  if (!parsed.success) return { error: "That email doesn't look right." };
  if (!listConfigured()) {
    console.warn("[email-list] sign-up refused: RESEND_API_KEY or RESEND_SEGMENT_ID is missing. See /api/health/email.");
    return { error: "The list isn't open yet. Please check back soon." };
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (ipLimited(ip)) return { error: "That's a lot of sign-ups in a row. Please wait a few minutes." };

  const { email } = parsed.data;
  const source = parsed.data.source ?? "site";
  try {
    await addToList(email, source);
  } catch {
    return { error: "We couldn't save that just now. Please try again in a moment." };
  }

  // The sign-up is saved; a failed confirmation shouldn't undo it.
  const last = confirmedAt.get(email);
  if (!last || Date.now() - last > DAY) {
    confirmedAt.set(email, Date.now());
    const mail = confirmationEmail({ source, unsubscribeUrl: unsubscribePageUrl(email) });
    await sendEmail({ to: email, ...mail, headers: listUnsubscribeHeaders(email) }).catch((e) =>
      console.warn(`[email-list] confirmation failed: ${e instanceof Error ? e.message : String(e)}`),
    );
  }
  return { ok: true };
}

/** "Unsubscribe" button on /unsubscribe. */
export async function unsubscribe(_prev: { done?: true; error?: string } | null, formData: FormData): Promise<{ done?: true; error?: string } | null> {
  const email = String(formData.get("e") ?? "").trim().toLowerCase();
  const token = String(formData.get("t") ?? "");
  if (!verifyUnsubscribe(email, token)) return { error: "That link doesn't look right." };
  try {
    await unsubscribeContact(email);
    return { done: true };
  } catch {
    return { error: "We couldn't do that just now. Please try again in a minute." };
  }
}
