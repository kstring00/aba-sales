"use client";

import { useMemo, useRef, useState } from "react";
import type { Behavior, Entry, EntryWithBehavior } from "@/lib/abc/types";
import { antecedentLabel, consequenceLabel, formatDuration, intensityLabel } from "@/lib/observation";
import { fmtDayLabel, fmtTime, localDateStr } from "@/lib/time/format";
import { LogSheet } from "@/components/abc/LogSheet";

export function EntryList({ entries, behaviors, emptyText }: { entries: EntryWithBehavior[]; behaviors: Behavior[]; emptyText: string }) {
  const [editing, setEditing] = useState<Entry | null>(null);
  const today = localDateStr(new Date());
  const trigger = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  // Focus goes back to the entry that opened the sheet, or to the list when that entry was deleted (audit F-21).
  const close = () => {
    setEditing(null);
    requestAnimationFrame(() => {
      const t = trigger.current;
      if (t && t.isConnected) t.focus({ preventScroll: true });
      else listRef.current?.focus({ preventScroll: true });
    });
  };

  const groups = useMemo(() => {
    const sorted = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const map = new Map<string, EntryWithBehavior[]>();
    for (const e of sorted) {
      const d = localDateStr(new Date(e.occurredAt));
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(e);
    }
    return [...map.entries()];
  }, [entries]);

  if (entries.length === 0) return <p className="text-[15px] text-ink-mute">{emptyText}</p>;

  return (
    <>
      <div className="space-y-8 outline-none" ref={listRef} tabIndex={-1} aria-label="Observations">
        {groups.map(([day, rows]) => (
          <section key={day}>
            <h3 className="mb-3 font-sans text-[13px] font-medium uppercase tracking-wider text-ink-mute">
              {fmtDayLabel(day, today)} <span className="tnum ml-1">· {rows.length}</span>
            </h3>
            <ul className="divide-y divide-line rounded-lg bg-paper shadow-soft">
              {rows.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={(ev) => { trigger.current = ev.currentTarget; setEditing(e); }} className="flex w-full items-start gap-4 px-4 py-4 text-left hover:bg-cream-deep/60"
                    aria-label={`Edit entry: ${e.behaviorLabel} at ${fmtTime(e.occurredAt)}`}>
                    <time dateTime={e.occurredAt} className="tnum w-[4.5rem] shrink-0 pt-0.5 text-[15px] text-ink-mute">{fmtTime(e.occurredAt)}</time>
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] text-ink">{e.behaviorLabel || "—"}</p>
                      {e.antecedentCode || e.consequenceCode ? (
                        <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">
                          {[antecedentLabel(e.antecedentCode, e.antecedentNote), consequenceLabel(e.consequenceCode, e.consequenceNote)].filter(Boolean).join(" → ")}
                        </p>
                      ) : null}
                      {e.durationSeconds != null || e.intensity != null || e.note ? (
                        <p className="mt-1 text-[13px] text-ink-mute">{[formatDuration(e.durationSeconds), intensityLabel(e.intensity), e.note ? "Note" : ""].filter(Boolean).join(" · ")}</p>
                      ) : null}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {editing ? <LogSheet open onClose={close} behaviors={behaviors} mode={{ kind: "edit", entry: editing }} /> : null}
    </>
  );
}
