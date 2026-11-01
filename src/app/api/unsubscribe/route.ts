import { NextResponse, type NextRequest } from "next/server";
import { unsubscribeContact } from "@/lib/email/resend";
import { verifyUnsubscribe } from "@/lib/email/unsubscribe";

export const dynamic = "force-dynamic";

/**
 * One-click unsubscribe (RFC 8058), used by the List-Unsubscribe header:
 * mail providers POST here when someone presses their built-in Unsubscribe
 * button. A plain visit (GET) goes to the page, which asks first.
 */
export async function POST(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!verifyUnsubscribe(email, token)) return NextResponse.json({ error: "invalid link" }, { status: 400 });
  try {
    await unsubscribeContact(email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "try again" }, { status: 502 });
  }
}

export function GET(request: NextRequest) {
  const url = new URL("/unsubscribe", request.nextUrl.origin);
  request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  return NextResponse.redirect(url, 303);
}
