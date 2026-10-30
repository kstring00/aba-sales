import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reasonFor } from "@/lib/auth-errors";

/**
 * OAuth (Google) and default-template magic links land here with ?code=.
 * Google is always the same browser, so exchanging immediately is fine.
 * For email links we prefer /auth/confirm (see README); if a code arrives
 * here anyway we exchange it and explain clearly when that fails.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const rawNext = searchParams.get("next") ?? "/app";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/app";

  // Behind a proxy (Vercel), trust the forwarded host and protocol together.
  const fHost = request.headers.get("x-forwarded-host");
  const fProto = request.headers.get("x-forwarded-proto");
  const base = fHost ? `${fProto ?? new URL(origin).protocol.replace(":", "")}://${fHost}` : origin;

  // A token_hash link that was pointed here: hand it to the confirm page (no consumption on GET).
  if (tokenHash) {
    const type = searchParams.get("type") ?? "email";
    return NextResponse.redirect(
      `${base}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(type)}&next=${encodeURIComponent(next)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${base}${next}`);
    // Error text from Supabase Auth carries no user data; log it so a failed
    // sign-in can be diagnosed from Vercel logs.
    console.warn(`[auth] callback exchange failed: ${error.message}`);
    return NextResponse.redirect(
      `${base}/sign-in?error=callback&reason=${encodeURIComponent(reasonFor(error.message))}&next=${encodeURIComponent(next)}`,
    );
  }

  return NextResponse.redirect(`${base}/sign-in?error=callback&reason=missing`);
}
