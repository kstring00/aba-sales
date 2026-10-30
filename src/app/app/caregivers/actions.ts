"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { isPro } from "@/lib/pro";
import { assertChildOwner, AccessError } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { hashToken, looksLikeToken, newToken } from "@/lib/tokens";
import { publicEnv } from "@/lib/env";
import { CHILD_COOKIE } from "@/lib/data";
import { addDays, isDateStr } from "@/lib/time/zoned";

export type InviteState = { ok?: true; link?: string; email?: string; error?: string } | null;

const emailSchema = z.string().trim().toLowerCase().email().max(254);

/**
 * Pro owners invite a second caregiver by email. The database function
 * re-checks ownership and Pro; the raw token lives only in the link.
 * Email delivery is a TODO; for now the owner copies the link.
 */
export async function inviteCaregiver(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const user = await requireUser("/app/settings");
  const childId = String(formData.get("child_id") ?? "");
  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { error: "That email doesn't look right." };
  if (email.data === (user.email ?? "").toLowerCase()) return { error: "That's your own email. Invite the other caregiver's address." };
  try {
    await assertChildOwner(childId);
    if (!(await isPro(user.id))) return { error: "Inviting a second caregiver is part of Pro." };
    const { token, hash } = newToken();
    const supabase = await createClient();
    const { error } = await supabase.rpc("create_caregiver_invite", { p_child_id: childId, p_email: email.data, p_token_hash: hash });
    if (error) return { error: error.message.includes("Pro") ? "Inviting a second caregiver is part of Pro." : "We couldn't create that invite just now." };
    revalidatePath("/app/settings");
    return { ok: true, link: `${publicEnv.siteUrl}/invite/${token}`, email: email.data };
  } catch (e) {
    return { error: e instanceof AccessError ? e.message : "We couldn't create that invite just now." };
  }
}

export async function revokeInvite(formData: FormData): Promise<void> {
  await requireUser("/app/settings");
  const id = String(formData.get("invite_id") ?? "");
  const supabase = await createClient();
  await supabase.from("caregiver_invites").update({ revoked_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/app/settings");
}

export async function removeCaregiver(formData: FormData): Promise<void> {
  await requireUser("/app/settings");
  const childId = String(formData.get("child_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  await assertChildOwner(childId);
  const supabase = await createClient();
  // RLS only allows removing rows with role = caregiver; the owner link is protected.
  await supabase.from("child_caregivers").delete().eq("child_id", childId).eq("user_id", userId);
  revalidatePath("/app", "layout");
}

const INVITE_ERROR_KEYS = ["different email", "expired", "already used", "revoked", "not found", "already have access"] as const;

/**
 * Explicit acceptance. Opening the link never consumes it; pressing Accept
 * does. The database function checks the email, expiry, revocation, and
 * replay, and only ever grants the caregiver role.
 */
export async function acceptInvite(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const user = await requireUser(`/invite/${token}`);
  void user;
  if (!looksLikeToken(token)) redirect(`/invite/${token}?error=${encodeURIComponent("not found")}`);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_caregiver_invite", { p_token_hash: hashToken(token) });
  if (error || !data) {
    const key = INVITE_ERROR_KEYS.find((k) => error?.message.includes(k)) ?? "not found";
    redirect(`/invite/${token}?error=${encodeURIComponent(key)}`);
  }
  const store = await cookies();
  store.set(CHILD_COOKIE, data as string, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/app", "layout");
  redirect("/app?joined=1");
}

// ── Share links (Pro): read-only, expire in 30 days ─────────────────────────
export type ShareState = { ok?: true; link?: string; error?: string } | null;

export async function createShareLink(_prev: ShareState, formData: FormData): Promise<ShareState> {
  const user = await requireUser("/app/export");
  const childId = String(formData.get("child_id") ?? "");
  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "");
  if (!isDateStr(from) || !isDateStr(to) || from > to || addDays(from, 366) < to) return { error: "Pick a valid date range of a year or less." };
  try {
    await assertChildOwner(childId);
    if (!(await isPro(user.id))) return { error: "Share links are part of Pro." };
    const { token, hash } = newToken();
    const supabase = await createClient();
    const { error } = await supabase.from("share_links").insert({
      child_id: childId,
      created_by: user.id,
      token_hash: hash,
      range_start: from,
      range_end: to,
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
    if (error) return { error: "We couldn't create that link just now." };
    revalidatePath("/app/export");
    return { ok: true, link: `${publicEnv.siteUrl}/share/${token}` };
  } catch (e) {
    return { error: e instanceof AccessError ? e.message : "We couldn't create that link just now." };
  }
}

export async function revokeShareLink(formData: FormData): Promise<void> {
  await requireUser("/app/export");
  const id = String(formData.get("link_id") ?? "");
  const supabase = await createClient();
  await supabase.from("share_links").update({ revoked_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/app/export");
}
