import type { Patterns } from "@/lib/patterns";
import { fmtHour } from "@/lib/patterns";

const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Server-rendered. No chart library: a heat strip, two sets of bars, captions. */
export function PatternsView({ p, nickname }: { p: Patterns; nickname: string }) {
  const maxHour = Math.max(...p.byHour, 1);
  const maxDow = Math.max(...p.byDow, 1);
  const maxAnt = Math.max(...p.byAntecedent.map((c) => c.count), 1);

  if (p.total === 0) {
    return <p className="text-[15px] text-ink-mute">No entries in this range for {nickname} yet. Patterns appear once there is something to count.</p>;
  }

  return (
    <div className="space-y-10">
      <Block title="By time of day" caption={p.captions.hour}>
        <div className="grid grid-cols-24 gap-[2px]" role="img" aria-label={`Entries by hour of day. ${p.captions.hour ?? ""}`}>
          {p.byHour.map((n, h) => (
            <div
              key={h}
              title={`${fmtHour(h)}: ${n}`}
              className="h-10 rounded-[3px]"
              style={{ backgroundColor: `color-mix(in oklab, var(--sage) ${Math.round((n / maxHour) * 100)}%, var(--cream-deep))` }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[12px] text-ink-mute tnum">
          <span>12am</span>
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </Block>

      <Block title="By what happened right before" caption={p.captions.antecedent}>
        <ul className="space-y-2">
          {p.byAntecedent.map((c) => (
            <li key={c.label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[14px]">
              <div className="min-w-0">
                <p className="truncate text-ink">{c.label}</p>
                <div className="mt-1 h-2 rounded-pill bg-cream-deep">
                  <div className="h-2 rounded-pill bg-sage" style={{ width: `${Math.max(3, (c.count / maxAnt) * 100)}%` }} />
                </div>
              </div>
              <span className="tnum w-6 text-right text-ink-soft">{c.count}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="By day of week" caption={p.captions.dow}>
        <div className="grid grid-cols-7 gap-2" role="img" aria-label={`Entries by day of week. ${p.captions.dow ?? ""}`}>
          {p.byDow.map((n, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end rounded-sm bg-cream-deep">
                <div className="w-full rounded-sm bg-sage" style={{ height: `${Math.max(n ? 6 : 0, (n / maxDow) * 100)}%` }} />
              </div>
              <span className="text-[12px] text-ink-mute">{DOW_SHORT[i]}</span>
              <span className="tnum text-[12px] text-ink-soft">{n}</span>
            </div>
          ))}
        </div>
      </Block>

      <p className="text-[13px] text-ink-mute">
        These are counts of what you recorded. They don&apos;t say why anything happened. If something here feels
        worth discussing, the export puts the same facts in a professional&apos;s hands.
      </p>
    </div>
  );
}

function Block({ title, caption, children }: { title: string; caption: string | null; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[1.15rem]">{title}</h2>
      {caption ? <p className="mt-1 text-[14px] text-ink-soft">{caption}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
