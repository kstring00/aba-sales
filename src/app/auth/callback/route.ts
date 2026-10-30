import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Exchanges the one-time code from a magic link or OAuth redirect for a session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/app";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/app";

  // Behind a proxy (Vercel), trust the forwarded host and protocol together.
  const fHost = request.headers.get("x-forwarded-host");
  const fProto = request.headers.get("x-forwarded-proto");
  const base = fHost ? `${fProto ?? new URL(origin).protocol.replace(":", "")}://${fHost}` : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${base}${next}`);
  }

  return NextResponse.redirect(`${base}/sign-in?error=callback`);
}
