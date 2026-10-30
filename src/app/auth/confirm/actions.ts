"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { reasonFor } from "@/lib/auth-errors";

const OTP_TYPES = new Set(["email", "magiclink", "signup", "invite", "recovery", "email_change"]);

function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

/**
 * Finishes a sign-in. Two inputs are accepted:
 *   - token_hash + type: from an email template that links straight to
 *     /auth/confirm. Verified with verifyOtp, so it works in any browser and
 *     is unaffected by link scanners (they only GET; we verify on POST).
 *   - code: the PKCE code from the default Supabase template or OAuth.
 */
export async function confirmSignIn(formData: FormData): Promise<void> {
  const next = safeNext(String(formData.get("next") ?? ""));
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "");
  const code = String(formData.get("code") ?? "");
  const supabase = await createClient();

  let message = "";
  if (tokenHash && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({ type: type as "email", token_hash: tokenHash });
    if (!error) redirect(next);
    message = error.message;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
    message = error.message;
  } else {
    message = "missing";
  }

  console.warn(`[auth] confirm failed: ${message}`);
  redirect(`/sign-in?error=callback&reason=${encodeURIComponent(reasonFor(message))}&next=${encodeURIComponent(next)}`);
}
