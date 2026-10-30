/**
 * Resend, called over plain HTTPS (no SDK, one less dependency).
 * Decision: email addresses live in a Resend Audience rather than Shopify,
 * because tagging a Shopify customer needs the Admin API, which this app
 * never touches.
 */
const API = "https://api.resend.com";

export function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function headers() {
  return { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" };
}

export async function addToAudience(email: string, source: string): Promise<void> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) return; // list disabled; sending still works
  const res = await fetch(`${API}/audiences/${audienceId}/contacts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, unsubscribed: false, first_name: "", last_name: source.slice(0, 40) }),
  });
  // 409/422 = already a contact. Fine.
  if (!res.ok && res.status !== 409 && res.status !== 422) {
    throw new Error(`Resend audience ${res.status}`);
  }
}

export type Attachment = { filename: string; content: string /* base64 */ };

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string; attachments?: Attachment[] }): Promise<void> {
  const from = process.env.RESEND_FROM ?? "The Support Shelf <onboarding@resend.dev>";
  const res = await fetch(`${API}/emails`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text, attachments: opts.attachments }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send ${res.status}: ${body.slice(0, 200)}`);
  }
}
