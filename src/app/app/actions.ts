"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { assertChildAccess, assertChildOwner, AccessError } from "@/lib/access";
import { CHILD_COOKIE } from "@/lib/data";
import { TZ_COOKIE, isValidTimeZone } from "@/lib/time/zoned";

export type ActionState = { ok?: true; error?: string } | null;

function fail(e: unknown, fallback: string): ActionState {
  if (e instanceof AccessError) return { error: e.message };
  return { error: fallback };
}

const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

// ── Adult attestation ────────────────────────────────────────────────────────
export async function attestAdult(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (formData.get("attest") !== "on") redirect("/app?attest=required");
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .upsert({ id: user.id, adult_attested_at: new Date().toISOString() }, { onConflict: "id" });
  revalidatePath("/app", "layout");
  redirect("/app");
}

// ── Time zone (set by the client once, read by server queries) ───────────────
export async function setTimeZone(tz: string): Promise<void> {
  if (!isValidTimeZone(tz)) return;
  const store = await cookies();
  store.set(TZ_COOKIE, tz, cookieOpts);
}

// ── Children ─────────────────────────────────────────────────────────────────
const nicknameSchema = z.string().trim().min(1, "Give them a nickname.").max(40, "Keep it under 40 characters.");

export async function createChild(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const nick = nicknameSchema.safeParse(formData.get("nickname"));
  if (!nick.success) return { error: nick.error.issues[0].message };

  const seeds = formData
    .getAll("behavior")
    .map((b) => String(b).trim())
    .filter((b) => b.length > 0 && b.length <= 60)
    .slice(0, 20);

  const supabase = await createClient();
  const { data: child, error } = await supabase
    .from("children")
    .insert({ nickname: nick.data, created_by: user.id })
    .select("id")
    .single();
  if (error || !child) return { error: "We couldn't save that just now. Please try again." };

  if (seeds.length > 0) {
    await supabase
      .from("behaviors")
      .insert(seeds.map((label, i) => ({ child_id: child.id, label, sort_order: i })));
  }

  const store = await cookies();
  store.set(CHILD_COOKIE, child.id, cookieOpts);
  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function selectChild(childId: string): Promise<void> {
  await requireUser();
  await assertChildAccess(childId);
  const store = await cookies();
  store.set(CHILD_COOKIE, childId, cookieOpts);
  revalidatePath("/app", "layout");
}

export async function renameChild(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const childId = String(formData.get("child_id") ?? "");
  const nick = nicknameSchema.safeParse(formData.get("nickname"));
  if (!nick.success) return { error: nick.error.issues[0].message };
  try {
    await assertChildOwner(childId);
    const supabase = await createClient();
    const { error } = await supabase.from("children").update({ nickname: nick.data }).eq("id", childId);
    if (error) throw error;
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e, "We couldn't rename just now.");
  }
}

export async function deleteChild(formData: FormData): Promise<void> {
  await requireUser();
  const childId = String(formData.get("child_id") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  await assertChildOwner(childId);
  const supabase = await createClient();
  const { data: child } = await supabase.from("children").select("nickname").eq("id", childId).single();
  if (!child || confirm.trim().toLowerCase() !== child.nickname.trim().toLowerCase()) {
    redirect("/app/settings?error=confirm");
  }
  await supabase.from("children").delete().eq("id", childId);
  const store = await cookies();
  store.delete(CHILD_COOKIE);
  revalidatePath("/app", "layout");
  redirect("/app/settings?deleted=child");
}

export async function leaveChild(formData: FormData): Promise<void> {
  const user = await requireUser();
  const childId = String(formData.get("child_id") ?? "");
  const supabase = await createClient();
  await supabase.from("child_caregivers").delete().eq("child_id", childId).eq("user_id", user.id);
  const store = await cookies();
  store.delete(CHILD_COOKIE);
  revalidatePath("/app", "layout");
  redirect("/app/settings");
}

// ── Behaviors ────────────────────────────────────────────────────────────────
const labelSchema = z.string().trim().min(1, "Type a short label.").max(60, "Keep it under 60 characters.");

export async function addBehavior(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const childId = String(formData.get("child_id") ?? "");
  const label = labelSchema.safeParse(formData.get("label"));
  if (!label.success) return { error: label.error.issues[0].message };
  try {
    await assertChildAccess(childId);
    const supabase = await createClient();
    const { count } = await supabase
      .from("behaviors")
      .select("id", { count: "exact", head: true })
      .eq("child_id", childId);
    const { error } = await supabase
      .from("behaviors")
      .insert({ child_id: childId, label: label.data, sort_order: count ?? 0 });
    if (error) throw error;
    revalidatePath("/app", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e, "We couldn't add that just now.");
  }
}

export async function renameBehavior(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("behavior_id") ?? "");
  const label = labelSchema.safeParse(formData.get("label"));
  if (!label.success) return { error: label.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.from("behaviors").update({ label: label.data }).eq("id", id);
  if (error) return { error: "We couldn't rename just now." };
  revalidatePath("/app", "layout");
  return { ok: true };
}

export async function setBehaviorActive(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("behavior_id") ?? "");
  const active = formData.get("active") === "true";
  const supabase = await createClient();
  await supabase.from("behaviors").update({ is_active: active }).eq("id", id);
  revalidatePath("/app", "layout");
}

export async function deleteBehavior(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("behavior_id") ?? "");
  const supabase = await createClient();
  // FK is RESTRICT: a behavior with entries can only be hidden, never deleted.
  const { error } = await supabase.from("behaviors").delete().eq("id", id);
  if (error) {
    await supabase.from("behaviors").update({ is_active: false }).eq("id", id);
  }
  revalidatePath("/app", "layout");
}

// ── Sign out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const store = await cookies();
  store.delete(CHILD_COOKIE);
  redirect("/");
}

// ── Account deletion (hard delete, confirmed twice in the UI) ─────────────────
export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/app/settings");
  if (formData.get("understand") !== "on") return { error: "Please tick the box to confirm you understand." };
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") {
    return { error: 'Type DELETE in capital letters to confirm.' };
  }

  const { adminConfigured, createAdminClient } = await import("@/lib/supabase/admin");
  if (!adminConfigured()) {
    return { error: "Deletion isn't available on this deployment yet. Contact us and we'll remove your account by hand." };
  }

  const supabase = await createClient();

  // 1. Stop billing first so nothing renews after the account is gone.
  const { data: sub } = await supabase.from("subscriptions").select("stripe_subscription_id").eq("user_id", user.id).maybeSingle();
  const { cancelStripeForUser } = await import("@/lib/billing/cancel");
  await cancelStripeForUser(sub?.stripe_subscription_id);

  // 2. Delete everything the user owns, as the user (RLS + SECURITY DEFINER).
  const { error: rpcError } = await supabase.rpc("delete_my_owned_data", {});
  if (rpcError) return { error: "We couldn't delete your data just now. Nothing was removed. Please try again." };

  // 3. Delete the auth user with the service key; cascades remove the rest.
  const admin = createAdminClient();
  const { error: adminError } = await admin.auth.admin.deleteUser(user.id);
  if (adminError) return { error: "Your records were removed but the sign-in itself could not be deleted. Please contact us." };

  await supabase.auth.signOut();
  const store = await cookies();
  store.delete(CHILD_COOKIE);
  redirect("/goodbye");
}
