"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { EntryWithBehavior } from "@/lib/abc/types";
import { buildReport } from "@/lib/export/report";
import { reportToCsv } from "@/lib/export/csv";
import { downloadBlob, slugify } from "@/lib/export/download";
import { addDays, toDateStr } from "@/lib/time/zoned";

type Props = { nickname: string; entries: EntryWithBehavior[] };

export function exportRange(entries: EntryWithBehavior[], tz: string) {
  const today = toDateStr(new Date(), tz);
  if (entries.length === 0) return { from: addDays(today, -6), to: today };
  const dates = entries.map((e) => toDateStr(new Date(e.occurredAt), tz)).sort();
  return { from: dates[0], to: today < dates[dates.length - 1] ? dates[dates.length - 1] : today };
}

/**
 * Compact export actions: PDF and CSV built in the browser, plus "Email me
 * my export", the one time entries leave the device, and only to the parent.
 */
export function ExportActions({ nickname, entries }: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<"pdf" | "csv" | "email" | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [keep, setKeep] = useState(false); // never pre-ticked (audit F-05)
  const [status, setStatus] = useState<{ ok?: true; error?: string } | null>(null);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const none = entries.length === 0;

  function report() {
    const { from, to } = exportRange(entries, tz);
    return buildReport({ nickname, from, to, tz, entries });
  }

  async function pdf() {
    setBusy("pdf");
    try {
      const r = report();
      const [{ renderReportPdf }, { loadFontBytesFromPublic }] = await Promise.all([import("@/lib/export/pdf"), import("@/lib/export/fonts.client")]);
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
      const { from, to } = exportRange(entries, tz);
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

  return (
    <div id="export" className="scroll-mt-24">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" size="sm" onClick={() => void pdf()} disabled={busy !== null || none}>{busy === "pdf" ? "Building…" : "Download PDF"}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={csv} disabled={busy !== null || none}>{busy === "csv" ? "Building…" : "Download CSV"}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setEmailOpen((o) => !o)} aria-expanded={emailOpen} disabled={none}>Email me my export</Button>
      </div>
      {none ? <p className="mt-2 text-[13px] text-ink-mute">Save an entry and the buttons wake up.</p> : null}
      {emailOpen ? (
        <form onSubmit={(e) => void sendEmail(e)} className="mt-4 space-y-3 rounded-md bg-cream p-4">
          <label htmlFor="export-email" className="block text-[15px] text-ink">Email me my export</label>
          <p className="text-[13.5px] text-ink-soft">Pressing send is the one time entries leave your phone: we turn them into the same PDF, email it to you, and discard them. We don&apos;t keep a copy.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input id="export-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Button type="submit" variant="secondary" disabled={busy !== null}>{busy === "email" ? "Sending…" : "Send"}</Button>
          </div>
          <div className="flex items-start gap-3 text-[13.5px] text-ink-soft">
            <input id="export-keep" type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--sage-deep)]" />
            <label htmlFor="export-keep">Also tell me when new downloads reach the shelf. A few emails a year, unsubscribe any time.</label>
          </div>
          {status?.ok ? <p role="status" className="text-[14px] text-ink">Sent. Check your inbox (and spam, once).</p> : null}
          {status?.error ? <p role="alert" className="text-[14px] text-ink">{status.error}</p> : null}
        </form>
      ) : null}
      <p className="mt-3 text-[13px] text-ink-mute">Clearing your browser data clears these entries. Export first.</p>
    </div>
  );
}
