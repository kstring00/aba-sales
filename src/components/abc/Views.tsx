"use client";

import type { EntryWithBehavior } from "@/lib/abc/types";
import { antecedentCaption, byAntecedent, byHour, fmtHour, hourCaption } from "@/lib/abc/views";

export function TimeOfDayView({ entries }: { entries: EntryWithBehavior[] }) {
  const hours = byHour(entries);
  const max = Math.max(...hours, 1);
  const caption = hourCaption(hours);
  if (entries.length === 0) return <p className="text-[15px] text-ink-mute">Nothing to count yet.</p>;
  return (
    <section aria-labelledby="tod-h">
      <h3 id="tod-h" className="text-[1.15rem]">By time of day</h3>
      {caption ? <p className="mt-1 text-[14px] text-ink-soft">{caption}</p> : null}
      <div className="mt-4 grid grid-cols-24 gap-[2px]" role="img" aria-label={`Entries by hour of day. ${caption ?? ""}`}>
        {hours.map((n, h) => (
          <div key={h} title={`${fmtHour(h)}: ${n}`} className="h-12 rounded-[3px]"
            style={{ backgroundColor: `color-mix(in oklab, var(--sage) ${Math.round((n / max) * 100)}%, var(--cream-deep))` }} />
        ))}
      </div>
      <div className="tnum mt-1 flex justify-between text-[12px] text-ink-mute"><span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span></div>
      <ul className="mt-4 grid grid-cols-4 gap-2 text-[13px] text-ink-soft sm:grid-cols-6">
        {hours.map((n, h) => (n ? <li key={h} className="tnum">{fmtHour(h)} · {n}</li> : null))}
      </ul>
    </section>
  );
}

export function AntecedentView({ entries }: { entries: EntryWithBehavior[] }) {
  const counts = byAntecedent(entries);
  const max = Math.max(...counts.map((c) => c.count), 1);
  const caption = antecedentCaption(counts, entries.length);
  if (entries.length === 0) return <p className="text-[15px] text-ink-mute">Nothing to count yet.</p>;
  return (
    <section aria-labelledby="ant-h">
      <h3 id="ant-h" className="text-[1.15rem]">By what happened right before</h3>
      {caption ? <p className="mt-1 text-[14px] text-ink-soft">{caption}</p> : null}
      <ul className="mt-4 space-y-3">
        {counts.map((c) => (
          <li key={c.label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[14px]">
            <div className="min-w-0">
              <p className="text-ink">{c.label}</p>
              <div className="mt-1 h-2 rounded-pill bg-cream-deep"><div className="h-2 rounded-pill bg-sage" style={{ width: `${Math.max(3, (c.count / max) * 100)}%` }} /></div>
            </div>
            <span className="tnum w-6 text-right text-ink-soft">{c.count}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[13px] text-ink-mute">Counts of what you recorded. They don&apos;t say why anything happened.</p>
    </section>
  );
}
