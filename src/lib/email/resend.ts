/**
 * Resend, called over plain HTTPS (no SDK, one less dependency).
 *
 * Decision: email addresses live in Resend Contacts rather than Shopify,
 * because tagging a Shopify customer needs the Admin API, which this app
 * never touches. The list is one Resend Segment (RESEND_SEGMENT_ID); which
 * form someone used is a contact property, not a separate list.
 *
 * Request shapes follow Resend's current Contacts API (Audiences were
 * replaced by Segments in November 2025), checked against resend-node.
 */
import { publicEnv } from "@/lib/env";

const API = "https://api.resend.com";

/** Contact property holding which form a person signed up on. */
export const SOURCE_PROPERTY = "signup_source";

/** Can we send email at all (exports)? */
export function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Is the email list switched on (key plus a segment to add people to)? */
export function listConfigured() {
  return resendConfigured() && Boolean(segmentId());
}

function segmentId() {
  return (process.env.RESEND_SEGMENT_ID ?? "").trim();
}

function headers() {
  return { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" };
}

/** Form names come from the page; keep them short and plain. */
export function cleanSource(source: string) {
  return source.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "site";
}

/**
 * Resend answers a duplicate with 409 or 422 and an "already exists"
 * message. 409 is also used for concurrency errors, so the status alone
 * isn't enough.
 */
async function alreadyExists(res: Response) {
  if (res.status !== 409 && res.status !== 422) return false;
  const body = await res.text().catch(() => "");
  return /already\s+(exists|a\s+member|in)/i.test(body);
}

// The property must exist before a contact can use it. Created once per
// server instance; if that fails, contacts are still saved without it.
let propertyReady: Promise<boolean> | null = null;
function ensureSourceProperty(): Promise<boolean> {
  propertyReady ??= (async () => {
    const res = await fetch(`${API}/contact-properties`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ key: SOURCE_PROPERTY, type: "string", fallback_value: null }),
    });
    if (res.ok || (await alreadyExists(res))) return true;
    console.warn(`[resend] contact property ${SOURCE_PROPERTY} unavailable: ${res.status}`);
    propertyReady = null; // try again next time
    return false;
  })().catch(() => {
    propertyReady = null;
    return false;
  });
  return propertyReady;
}

/** For tests. */
export function resetResendCache() {
  propertyReady = null;
}

/**
 * Add someone to the list. Call this only after an explicit opt-in.
 * An address that's already a contact counts as success: it's added to
 * the segment and nothing else about it changes (an earlier unsubscribe
 * stays in place).
 */
export async function addToList(email: string, source: string): Promise<void> {
  const segment = segmentId();
  if (!resendConfigured() || !segment) throw new Error("Resend list not configured");
  const withSource = await ensureSourceProperty();

  const res = await fetch(`${API}/contacts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email,
      unsubscribed: false,
      segments: [{ id: segment }],
      ...(withSource ? { properties: { [SOURCE_PROPERTY]: cleanSource(source) } } : {}),
    }),
  });
  if (res.ok) return;
  if (!(await alreadyExists(res))) throw new Error(`Resend contact ${res.status}`);

  const add = await fetch(`${API}/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segment)}`, {
    method: "POST",
    headers: headers(),
  });
  if (!add.ok && !(await alreadyExists(add))) throw new Error(`Resend segment ${add.status}`);
}

export type Attachment = { filename: string; content: string /* base64 */ };

/**
 * Sends one email. Replies go to a real person's mailbox: nothing receives
 * mail at the sending domain.
 */
export async function sendEmail(opts: { to: string; subject: string; html: string; text: string; attachments?: Attachment[] }): Promise<void> {
  const from = process.env.RESEND_FROM ?? "The Support Shelf <onboarding@resend.dev>";
  const res = await fetch(`${API}/emails`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      from,
      to: [opts.to],
      reply_to: publicEnv.contactEmail,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      attachments: opts.attachments,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send ${res.status}: ${body.slice(0, 200)}`);
  }
}
