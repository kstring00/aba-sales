"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { BehaviorRow, EntryRow } from "@/lib/database.types";
import type { EntryWithBehavior } from "@/lib/data";
import { antecedentLabel, consequenceLabel, formatDuration, intensityLabel } from "@/lib/observation";
import { fmtDayLabel, fmtTime, localDateStr } from "@/lib/time/format";
import { LogSheet, type LogSheetMode } from "@/components/app/LogSheet";
import { useSync } from "@/components/app/SyncProvider";
import { refreshIfSynced } from "@/lib/entries/refresh";

type Props = {
  entries: EntryWithBehavior[];
  behaviors: BehaviorRow[];
  childId: string;
  userId: string;
  /** Only show entries that fall on the viewer's local "today". */
  todayOnly?: boolean;
  groupByDay?: boolean;
  emptyText?: string;
};

export function EntryList({ entries, behaviors: initialBehaviors, childId, userId, todayOnly, groupByDay, emptyText }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(entries);
  const [behaviors, setBehaviors] = useState(initialBehaviors);
  const [editing, setEditing] = useState<EntryWithBehavior | null>(null);
  // Parents re-key this component when server data changes, so state resets
  // without prop-to-state effects. `mounted` avoids a hydration mismatch when
  // formatting times in the viewer's zone.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const today = mounted ? localDateStr(new Date()) : null;

  const { pending } = useSync();
  const pendingIds = useMemo(() => new Set(pending.map((op) => op.entryId)), [pending]);

  const visible = useMemo(() => {
    if (!mounted) return [];
    // Entries saved on this device but not yet on the server still belong in the list.
    const queued: EntryWithBehavior[] = pending
      .filter((op) => op.kind === "insert" && op.optimistic && op.childId === childId && !items.some((e) => e.id === op.entryId))
      .map((op) => ({
        ...(op.optimistic as EntryRow),
        behavior_label: behaviors.find((b) => b.id === op.optimistic!.behavior_id)?.label ?? "",
      }));
    const merged = [...items, ...queued];
    const list = todayOnly ? merged.filter((e) => localDateStr(new Date(e.occurred_at)) === today) : merged;
    return [...list].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  }, [items, todayOnly, today, mounted, pending, childId, behaviors]);

  const groups = useMemo(() => {
    if (!groupByDay) return [{ day: null as string | null, rows: visible }];
    const map = new Map<string, EntryWithBehavior[]>();
    for (const e of visible) {
      const d = localDateStr(new Date(e.occurred_at));
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(e);
    }
    return [...map.entries()].map(([day, rows]) => ({ day, rows }));
  }, [visible, groupByDay]);

  const mode: LogSheetMode | null = editing ? { kind: "edit", entry: editing } : null;

  if (!mounted) {
    return <div className="h-16" aria-hidden />;
  }

  if (visible.length === 0) {
    return <p className="text-[15px] text-ink-mute">{emptyText ?? "Nothing logged yet."}</p>;
  }

  return (
    <>
      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.day ?? "all"}>
            {g.day ? (
              <h2 className="mb-3 font-sans text-[13px] font-medium uppercase tracking-wider text-ink-mute">
                {fmtDayLabel(g.day, today!)} <span className="ml-1 tnum">· {g.rows.length}</span>
              </h2>
            ) : null}
            <ul className="divide-y divide-line rounded-lg bg-paper shadow-soft">
              {g.rows.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(e)}
                    className="flex w-full items-start gap-4 px-4 py-4 text-left hover:bg-cream-deep/60"
                    aria-label={`Edit entry: ${e.behavior_label} at ${fmtTime(e.occurred_at)}`}
                  >
                    <time dateTime={e.occurred_at} className="tnum w-[4.5rem] shrink-0 pt-0.5 text-[15px] text-ink-mute">
                      {fmtTime(e.occurred_at)}
                    </time>
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] text-ink">
                        {e.behavior_label}
                        {pendingIds.has(e.id) ? (
                          <span className="ml-2 align-middle text-[12px] uppercase tracking-wider text-ink-mute" title="Saved on this phone, will sync">
                            will sync
                          </span>
                        ) : null}
                      </p>
                      {e.antecedent_code || e.consequence_code ? (
                        <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">
                          {[
                            antecedentLabel(e.antecedent_code, e.antecedent_note),
                            consequenceLabel(e.consequence_code, e.consequence_note),
                          ]
                            .filter(Boolean)
                            .join(" → ")}
                        </p>
                      ) : null}
                      {e.duration_seconds != null || e.intensity != null || e.note ? (
                        <p className="mt-1 text-[13px] text-ink-mute">
                          {[formatDuration(e.duration_seconds), intensityLabel(e.intensity), e.note ? "Note" : ""]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {mode ? (
        <LogSheet
          open={Boolean(editing)}
          onClose={() => setEditing(null)}
          childId={childId}
          userId={userId}
          behaviors={behaviors}
          mode={mode}
          onBehaviorAdded={(b) => setBehaviors((bs) => [...bs, b])}
          onSaved={(entry: EntryRow, _label, pendingSync) => {
            const label = behaviors.find((b) => b.id === entry.behavior_id)?.label ?? "";
            setItems((list) => {
              const exists = list.some((x) => x.id === entry.id);
              const row = { ...entry, behavior_label: label };
              return exists ? list.map((x) => (x.id === entry.id ? row : x)) : [row, ...list];
            });
            refreshIfSynced(router, pendingSync);
          }}
          onDeleted={(id) => {
            setItems((list) => list.filter((x) => x.id !== id));
            refreshIfSynced(router, typeof navigator !== "undefined" && !navigator.onLine);
          }}
        />
      ) : null}
    </>
  );
}
