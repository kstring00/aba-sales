import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { buildReport } from "@/lib/export/report";
import { renderReportPdf } from "@/lib/export/pdf";
import { loadFontBytesFromDisk } from "@/lib/export/fonts.server";
import { addToAudience, resendConfigured, sendEmail } from "@/lib/email/resend";
import { isDateStr, isValidTimeZone } from "@/lib/time/zoned";

export const dynamic = "force-dynamic";

/**
 * "Email me my export". Entries arrive in the request, become a PDF, go out
 * through Resend, and are gone when the response is sent. Nothing is stored
 * except the email address (for sending, and for the list if asked).
 */
const entrySchema = z.object({
  id: z.string().max(80),
  behaviorId: z.string().max(80),
  behaviorLabel: z.string().max(60),
  occurredAt: z.string().datetime(),
  antecedentCode: z.string().max(40).nullable(),
  antecedentNote: z.string().max(500).nullable(),
  consequenceCode: z.string().max(40).nullable(),
  consequenceNote: z.string().max(500).nullable(),
  durationSeconds: z.number().int().min(0).max(86400).nullable(),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable(),
  note: z.string().max(2000).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  keepInTouch: z.boolean().default(false),
  nickname: z.string().trim().min(1).max(40),
  tz: z.string().max(64),
  from: z.string(),
  to: z.string(),
  entries: z.array(entrySchema).max(5000),
});

// Simple per-IP limiter: 5 sends per 10 minutes per instance.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

export async function POST(request: NextRequest) {
  if (!resendConfigured()) return NextResponse.json({ error: "Email isn't switched on for this site yet. Download the PDF instead." }, { status: 503 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ error: "That's a lot of exports in a row. Please wait a few minutes." }, { status: 429 });

  const raw = await request.text();
  if (raw.length > 2_000_000) return NextResponse.json({ error: "Too much data in one email. Export a shorter range." }, { status: 413 });
  const parsed = bodySchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return NextResponse.json({ error: "Something about that export didn't look right." }, { status: 400 });
  const { email, keepInTouch, nickname, entries } = parsed.data;
  const tz = isValidTimeZone(parsed.data.tz) ? parsed.data.tz : "America/Chicago";
  const from = isDateStr(parsed.data.from) ? parsed.data.from : new Date().toISOString().slice(0, 10);
  const to = isDateStr(parsed.data.to) && parsed.data.to >= from ? parsed.data.to : from;

  try {
    const report = buildReport({
      nickname,
      from,
      to,
      tz,
      entries: entries.map((e) => ({ ...e, antecedentCode: e.antecedentCode as never, consequenceCode: e.consequenceCode as never })),
    });
    const pdf = await renderReportPdf(report, await loadFontBytesFromDisk());
    const filename = `support-shelf-${nickname.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${from}-to-${to}.pdf`;
    await sendEmail({
      to: email,
      subject: `Your ABC export for ${nickname}`,
      text: `Attached: your observations for ${nickname}, ${from} to ${to} (${report.total} entries).\n\nThis PDF describes what was recorded. It doesn't say why anything happened.\n\nThe Support Shelf`,
      html: `<p>Attached: your observations for <strong>${escapeHtml(nickname)}</strong>, ${from} to ${to} (${report.total} ${report.total === 1 ? "entry" : "entries"}).</p><p>This PDF describes what was recorded. It doesn't say why anything happened.</p><p>— The Support Shelf</p>`,
      attachments: [{ filename, content: Buffer.from(pdf).toString("base64") }],
    });
    if (keepInTouch) await addToAudience(email, "abc-export").catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Error text only; never the entries.
    console.warn(`[abc-export] failed: ${e instanceof Error ? e.message : String(e)}`);
    const msg = e instanceof Error && /testing domain|verify a domain|own email/i.test(e.message)
      ? "Email sending is still being set up for addresses other than ours. Please download the PDF instead."
      : "We couldn't send that just now. Download the PDF instead, or try again in a minute.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
