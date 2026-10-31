"use client";

import Link from "next/link";
import type { EntryWithBehavior } from "@/lib/abc/types";
import { buildReport, fmtRangeLabel, type ReportRow } from "@/lib/export/report";
import { sampleEntries } from "@/lib/export/fixtures";
import { ExportActions, exportRange } from "@/components/abc/ExportPanel";
import { I } from "@/components/abc/icons";

/**
 * "What your BCBA receives": the latest week of the parent's own entries as
 * the export table. Before anything is logged, the made-up sample shows
 * what the table will look like, and says so.
 */
export function BcbaPreview({ nickname, entries, hydrated }: { nickname: string; entries: EntryWithBehavior[]; hydrated: boolean }) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const live = entries.length > 0;
  const source = live ? entries : sampleEntries();
  const name = live ? nickname : "Bean";
  const { from, to } = live ? exportRange(entries, tz) : { from: "2026-03-02", to: "2026-03-08" };
  const report = buildReport({ nickname: name, from, to, tz, entries: source });
  const week = [...report.weeks].reverse().find((w) => w.rows.length) ?? report.weeks[report.weeks.length - 1];
  const rows = week ? week.rows.slice(-6) : [];

  return (
    <section className="paper-card p-5 sm:p-6" aria-labelledby="bcba-h">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-mint text-mint-deep"><I.chart className="h-6 w-6" /></span>
        <div className="min-w-0 flex-1">
          <h2 id="bcba-h" className="text-[1.25rem]">What your BCBA receives</h2>
          <p className="mt-1 text-[14px] text-ink-soft">A clear, organized summary of your entries that makes patterns easier to see.</p>
        </div>
        {!live ? (
          <Link href="/sample-export.pdf" className="lift hidden min-h-10 items-center gap-1.5 rounded-pill border border-line-strong bg-paper px-3 text-[13.5px] font-medium text-ink hover:border-ink sm:inline-flex" target="_blank" rel="noopener">
            View sample <span aria-hidden>→</span>
          </Link>
        ) : null}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-line">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line bg-cream px-4 py-3">
          <div>
            <p className="font-display text-[1rem] text-ink">Week of {week ? fmtRangeLabel(week.start, week.end) : fmtRangeLabel(from, to)}</p>
            <p className="tnum text-[12.5px] text-ink-mute">{week?.rows.length ?? 0} {week?.rows.length === 1 ? "observation" : "observations"}{name ? ` · ${name}` : ""}</p>
          </div>
          <p className="text-[12px] text-ink-mute">{!hydrated ? "" : live ? "Your entries" : "Sample"}</p>
        </div>
        <div className="scroll-fade overflow-x-auto" tabIndex={0} role="region" aria-label="Weekly observations table">
          <table className="w-full min-w-[34rem] text-left text-[12.5px]">
            <thead className="bg-cream-deep/60 text-[12px] uppercase tracking-wide text-ink-mute">
              <tr>
                <Th>Date / time</Th><Th>Behavior</Th><Th>Right before</Th><Th>Right after</Th><Th>Intensity</Th><Th>Duration</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!hydrated ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-ink-mute">Loading…</td></tr>
              ) : rows.length ? rows.map((r) => <Row key={r.id} r={r} />) : (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-ink-mute">Nothing in this week yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-1 text-[12px] text-ink-mute sm:hidden" aria-hidden>Swipe sideways to see every column →</p>
      <p className="mt-3 text-[13px] text-ink-mute">
        {live
          ? "One page per week, counts at the end, no interpretation. One row per observation; your reflection, when you add one, is labelled as yours."
          : "One page per week, counts at the end, no interpretation. One row per observation, even when several behaviors happened together. This sample uses made-up data."}
      </p>
      <div className="mt-4 border-t border-line pt-4">
        <ExportActions nickname={nickname} entries={entries} />
      </div>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th scope="col" className="whitespace-nowrap px-3 py-2 font-medium">{children}</th>;
}

function Row({ r }: { r: ReportRow }) {
  const [, m, d] = r.date.split("-");
  const cell = "px-3 py-2 align-top text-ink-soft";
  return (
    <tr>
      <td className={`${cell} tnum whitespace-nowrap`}>{Number(m)}/{Number(d)} {r.time}</td>
      <td className={`${cell} text-ink`}>{r.noticed}</td>
      <td className={cell}>{r.beforeNote && r.before === "Something else" ? r.beforeNote : r.before || "—"}</td>
      <td className={cell}>{r.afterNote && r.after === "Something else" ? r.afterNote : r.after || "—"}</td>
      <td className={cell}>{r.intensity || "—"}</td>
      <td className={`${cell} tnum`}>{r.duration || "—"}</td>
    </tr>
  );
}
