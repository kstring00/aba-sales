"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  attest: z.literal("on"),
  next: z.string().startsWith("/").max(200).optional(),
});

export type SignInState = { ok?: true; email?: string; error?: string } | null;

function safeNext(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host && process.env.NODE_ENV !== "production") return `${proto}://${host}`;
  return publicEnv.siteUrl;
}

export async function sendMagicLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
    attest: formData.get("attest"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) {
    const attestIssue = parsed.error.issues.some((i) => i.path[0] === "attest");
    return {
      error: attestIssue
        ? "Please confirm you're an adult parent or caregiver."
        : "That email doesn't look right. Check it and try again.",
    };
  }
  const supabase = await createClient();
  const origin = await siteOrigin();
  const next = safeNext(parsed.data.next);
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      data: { adult_attested: true },
    },
  });
  if (error) {
    return { error: "We couldn't send the link just now. Please try again in a moment." };
  }
  return { ok: true, email: parsed.data.email };
}

export async function signInWithGoogle(formData: FormData) {
  const attest = formData.get("attest");
  const next = safeNext(String(formData.get("next") ?? ""));
  if (attest !== "on") {
    redirect(`/sign-in?error=attest&next=${encodeURIComponent(next)}`);
  }
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error || !data.url) {
    redirect(`/sign-in?error=google&next=${encodeURIComponent(next)}`);
  }
  redirect(data.url);
}
