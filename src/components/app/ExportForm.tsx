"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Input, Label } from "@/components/ui/Field";
import { buttonClass } from "@/components/ui/Button";
import { addDays } from "@/lib/time/zoned";

type Props = { childId: string; today: string; defaultFrom: string; hasEntries: boolean };

const PRESETS = [
  { label: "Last 7 days", days: 6 },
  { label: "Last 4 weeks", days: 27 },
  { label: "Last 3 months", days: 90 },
];

/** Plain links to the download routes. Works without JavaScript too. */
export function ExportForm({ childId, today, defaultFrom, hasEntries }: Props) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);
  const valid = from <= to;
  const qs = `?child=${childId}&from=${from}&to=${to}`;

  return (
    <div className="space-y-6 rounded-lg bg-paper p-5 shadow-soft">
      <div className="space-y-3">
        <p className="text-[15px] font-medium">Date range</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const f = addDays(today, -p.days);
            const active = from === f && to === today;
            return (
              <Chip key={p.label} selected={active} onClick={() => { setFrom(f); setTo(today); }}>
                {p.label}
              </Chip>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="ex-from" className="text-[13px] text-ink-mute">From</Label>
            <Input id="ex-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="!text-[15px]" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ex-to" className="text-[13px] text-ink-mute">To</Label>
            <Input id="ex-to" type="date" value={to} max={today} onChange={(e) => setTo(e.target.value)} className="!text-[15px]" />
          </div>
        </div>
        {!valid ? <p className="text-[14px]">The start date is after the end date.</p> : null}
      </div>

      <div className="space-y-3">
        <a
          href={valid ? `/app/export/pdf${qs}` : undefined}
          aria-disabled={!valid}
          className={buttonClass("primary", "lg", `w-full ${valid ? "" : "pointer-events-none opacity-50"}`)}
          download
        >
          Download PDF
        </a>
        <a
          href={valid ? `/app/export/csv${qs}` : undefined}
          aria-disabled={!valid}
          className={buttonClass("secondary", "md", `w-full ${valid ? "" : "pointer-events-none opacity-50"}`)}
          download
        >
          Download CSV
        </a>
        {!hasEntries ? (
          <p className="text-center text-[14px] text-ink-mute">Nothing logged yet. The PDF will say so, politely.</p>
        ) : null}
      </div>
    </div>
  );
}
