"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { EntryWithBehavior } from "@/lib/abc/types";
import { buildReport } from "@/lib/export/report";
import { reportToCsv } from "@/lib/export/csv";
import { renderReportPdf } from "@/lib/export/pdf";
import { loadFontBytesFromPublic } from "@/lib/export/fonts.client";
import { downloadBlob, slugify } from "@/lib/export/download";
import { addDays, toDateStr } from "@/lib/time/zoned";

type Props = { nickname: string; entries: EntryWithBehavior[] };

function range(entries: EntryWithBehavior[], tz: string) {
  const today = toDateStr(new Date(), tz);
  if (entries.length === 0) return { from: addDays(today, -6), to: today };
  const dates = entries.map((e) => toDateStr(new Date(e.occurredAt), tz)).sort();
  return { from: dates[0], to: today < dates[dates.length - 1] ? dates[dates.length - 1] : today };
}

/**
 * One-tap exports, built in the browser. Nothing leaves the device unless the
 * parent presses "Email me my export", and that sends only to them.
 */
export function ExportPanel({ nickname, entries }: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<"pdf" | "csv" | "email" | null>(null);
  const [email, setEmail] = useState("");
  const [keep, setKeep] = useState(true);
  const [status, setStatus] = useState<{ ok?: true; error?: string } | null>(null);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function report() {
    const { from, to } = range(entries, tz);
    return buildReport({ nickname, from, to, tz, entries });
  }

  async function pdf() {
    setBusy("pdf");
    try {
      const r = report();
      const bytes = await renderReportPdf(r, await loadFontBytesFromPublic());
      downloadBlob(bytes, `support-shelf-${slugify(nickname)}-${r.from}-to-${r.to}.pdf`, "application/pdf");
      toast("PDF ready.");
    } catch {
      toast("Couldn't build the PDF. Try again.");
    } finally {
      setBusy(null);
    }
  }

  function csv() {
    setBusy("csv");
    try {
      const r = report();
      downloadBlob(reportToCsv(r), `support-shelf-${slugify(nickname)}-${r.from}-to-${r.to}.csv`, "text/csv;charset=utf-8");
      toast("CSV ready.");
    } finally {
      setBusy(null);
    }
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy("email");
    setStatus(null);
    try {
      const { from, to } = range(entries, tz);
      const res = await fetch("/api/abc/email-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, keepInTouch: keep, nickname, tz, from, to, entries }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "send failed");
      setStatus({ ok: true });
    } catch (err) {
      setStatus({ error: err instanceof Error && err.message !== "send failed" ? err.message : "We couldn't send that just now. Download the PDF instead, or try again in a minute." });
    } finally {
      setBusy(null);
    }
  }

  const none = entries.length === 0;

  return (
    <section id="export" className="scroll-mt-24 rounded-lg bg-paper p-5 shadow-soft" aria-labelledby="export-h">
      <h2 id="export-h" className="text-[1.3rem]">Export</h2>
      <p className="mt-2 text-[15px] text-ink-soft">
        A clean PDF, one page per week with counts at the end, or a CSV for a spreadsheet. Built right here on your device. Free, unlimited.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="primary" size="lg" onClick={() => void pdf()} disabled={busy !== null || none}>
          {busy === "pdf" ? "Building…" : "Download PDF"}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={csv} disabled={busy !== null || none}>
          {busy === "csv" ? "Building…" : "Download CSV"}
        </Button>
      </div>
      {none ? <p className="mt-3 text-[14px] text-ink-mute">Log something first and the buttons wake up.</p> : null}

      <p className="mt-5 rounded-md bg-sage-tint px-4 py-3 text-[14px] text-ink">
        Clearing your browser data clears these entries. Export first.
      </p>

      <form onSubmit={(e) => void sendEmail(e)} className="mt-6 space-y-3 border-t border-line pt-5">
        <label htmlFor="export-email" className="block text-[16px]">Email me my export</label>
        <p className="text-[14px] text-ink-soft">
          Pressing send is the one time entries leave your phone: we turn them into the same PDF, email it to you, and discard them. We don&apos;t keep a copy.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input id="export-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Button type="submit" variant="secondary" disabled={busy !== null || none}>{busy === "email" ? "Sending…" : "Send"}</Button>
        </div>
        <label className="flex items-start gap-3 text-[14px] text-ink-soft">
          <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--sage-deep)]" />
          <span>Also tell me when new downloads reach the shelf. A few emails a year, unsubscribe any time.</span>
        </label>
        {status?.ok ? <p role="status" className="text-[15px] text-ink">Sent. Check your inbox (and spam, once).</p> : null}
        {status?.error ? <p role="alert" className="text-[15px] text-ink">{status.error}</p> : null}
      </form>
    </section>
  );
}
