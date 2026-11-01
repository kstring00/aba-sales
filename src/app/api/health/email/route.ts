import { NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const API = "https://api.resend.com";
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

/**
 * Read-only diagnostics for email, no secrets: which Resend settings this
 * environment has, whether the key can reach the list segment (contacts
 * need a Full access key), and whether the From address is on a verified
 * domain. Open /api/health/email on the deployment. Nothing is sent and no
 * contact is created.
 */
export async function GET() {
  const key = process.env.RESEND_API_KEY ?? "";
  const segment = (process.env.RESEND_SEGMENT_ID ?? "").trim();
  const from = process.env.RESEND_FROM ?? "";
  const fromDomain = /@([^>\s]+)>?\s*$/.exec(from)?.[1]?.toLowerCase() ?? null;

  const problems: string[] = [];
  const result: Record<string, unknown> = {
    vercelEnv: process.env.VERCEL_ENV ?? null,
    apiKeySet: Boolean(key),
    segmentIdSet: Boolean(segment),
    fromSet: Boolean(from),
    fromDomain,
    replyTo: publicEnv.contactEmail,
    oldAudienceVariableStillSet: Boolean(process.env.RESEND_AUDIENCE_ID),
  };

  if (!key) problems.push("RESEND_API_KEY is not set for this environment.");
  if (!segment) problems.push("RESEND_SEGMENT_ID is not set for this environment.");
  if (!from) problems.push("RESEND_FROM is not set, so mail comes from onboarding@resend.dev, which only delivers to the Resend account owner.");

  if (key) {
    const auth = { Authorization: `Bearer ${key}` };
    if (segment) {
      const res = await fetch(`${API}/segments/${encodeURIComponent(segment)}`, { headers: auth, cache: "no-store" }).catch(() => null);
      result.segmentCheck = res?.status ?? "network error";
      if (!res) problems.push("Couldn't reach Resend to check the segment. Try again in a minute.");
      else if (res.status === 401 || res?.status === 403) problems.push("The API key can't read contacts or segments. Create a Full access key in Resend (a Sending access key can't add people to the list).");
      else if (res.status === 404) problems.push("No segment has that ID. Copy it again from Resend → Audience → Segments.");
      else if (!res.ok) problems.push(`Resend answered ${res.status} when checking the segment.`);
    }
    const res = await fetch(`${API}/domains`, { headers: auth, cache: "no-store" }).catch(() => null);
    if (res?.ok) {
      const body = (await res.json().catch(() => null)) as { data?: Array<{ name: string; status: string }> } | null;
      const domains = body?.data ?? [];
      result.domains = domains.map((d) => ({ name: d.name, status: d.status }));
      const match = fromDomain ? domains.find((d) => d.name.toLowerCase() === fromDomain) : null;
      result.fromDomainVerified = match ? match.status === "verified" : false;
      if (fromDomain && fromDomain !== "resend.dev" && !match) problems.push(`${fromDomain} isn't a domain in this Resend account. Add and verify it, or change RESEND_FROM.`);
      else if (match && match.status !== "verified") problems.push(`${fromDomain} is added in Resend but its status is "${match.status}". Finish the DNS records until it shows Verified.`);
    } else {
      result.domainCheck = res?.status ?? "network error";
      if (!res) problems.push("Couldn't reach Resend to check the sending domain.");
    }
  }

  result.listWorks = result.segmentCheck === 200;
  result.ok = problems.length === 0;
  result.problems = problems;
  return NextResponse.json(result, { status: 200, headers: HEADERS });
}
