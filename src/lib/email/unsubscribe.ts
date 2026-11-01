import { createHmac, timingSafeEqual } from "node:crypto";
import { publicEnv } from "@/lib/env";

/**
 * Signed unsubscribe links. The token is an HMAC of the address, so a link
 * only works for the address it was sent to, and nobody can unsubscribe
 * someone else by editing the URL. Signed with UNSUBSCRIBE_SECRET when set,
 * otherwise with the Resend API key (server-only; the token never reveals
 * it). Rotating the key invalidates old links; the page then offers email.
 */
function secret() {
  return process.env.UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY || "";
}

export function unsubscribeToken(email: string) {
  return createHmac("sha256", secret()).update(email.trim().toLowerCase()).digest("base64url").slice(0, 32);
}

export function verifyUnsubscribe(email: string, token: string) {
  if (!secret() || !email || !token) return false;
  const a = Buffer.from(unsubscribeToken(email));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

const query = (email: string) => `e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;

/** The page a person lands on (asks before unsubscribing, so link scanners can't). */
export const unsubscribePageUrl = (email: string) => `${publicEnv.siteUrl}/unsubscribe?${query(email)}`;

/** RFC 8058 one-click endpoint for the List-Unsubscribe header. */
export const oneClickUrl = (email: string) => `${publicEnv.siteUrl}/api/unsubscribe?${query(email)}`;

/** Headers mail providers use to show their own "Unsubscribe" button. */
export function listUnsubscribeHeaders(email: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${oneClickUrl(email)}>, <mailto:${publicEnv.contactEmail}?subject=Unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
