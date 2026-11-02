"use client";

import { useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import type { SensoryEvent } from "@/lib/events";

type Filter = "all" | "dated" | "recurring" | "any" | "free";

const FILTERS: Array<{ id: Filter; label: string; test: (e: SensoryEvent) => boolean }> = [
  { id: "all", label: "Everything", test: () => true },
  { id: "dated", label: "Coming up", test: (e) => e.kind === "One date" },
  { id: "recurring", label: "Every week or month", test: (e) => e.kind === "Recurring" },
  { id: "any", label: "Any day", test: (e) => e.kind === "Any day" },
  { id: "free", label: "Free", test: (e) => /^free/i.test(e.cost ?? "") },
];

/** Same pattern as the Jobs page: one-tap chips, a live count, plain cards. */
export function EventList({ events, dates, checked }: { events: SensoryEvent[]; dates: Record<string, string | null>; checked: Record<string, string | null> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = useMemo(() => events.filter(FILTERS.find((f) => f.id === filter)!.test), [events, filter]);
  const available = FILTERS.filter((f) => f.id === "all" || events.some(f.test));

  return (
    <div>
      {available.length > 2 ? (
        <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
          {available.map((f) => (
            <Chip key={f.id} selected={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</Chip>
          ))}
        </div>
      ) : null}
      <p aria-live="polite" className="mt-4 text-[14px] text-ink-mute">
        {shown.length === 1 ? "1 outing" : `${shown.length} outings`}
      </p>
      <ul className="mt-3 space-y-5">
        {shown.map((e) => <EventCard key={e.handle} event={e} date={dates[e.handle] ?? null} checked={checked[e.handle] ?? null} />)}
      </ul>
    </div>
  );
}

function EventCard({ event, date, checked }: { event: SensoryEvent; date: string | null; checked: string | null }) {
  const facts = [event.area, event.cost].filter(Boolean) as string[];
  const label = event.kind === "One date" && date ? date : event.kind === "Any day" ? "Any day" : "Recurring";
  return (
    <li className="paper-card p-5 sm:p-6">
      <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-sage-deep">{label}</p>
      <h2 className="mt-2 text-[1.35rem] leading-snug">{event.name}</h2>
      <p className="mt-1 text-[16px] text-ink-soft">{event.venue}</p>
      <p className="mt-2 text-[15.5px] text-ink">{event.when}</p>
      {facts.length ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Details">
          {facts.map((x) => <li key={x} className="rounded-pill border border-line px-3 py-1 text-[14px] text-ink-soft">{x}</li>)}
        </ul>
      ) : null}
      <h3 className="mt-5 font-sans text-[13px] font-medium uppercase tracking-[0.12em] text-ink-mute">What&apos;s different</h3>
      <ul className="mt-2 space-y-1.5 text-[15.5px] text-ink">
        {event.adapted.map((a) => <li key={a} className="flex gap-2"><span aria-hidden className="text-sage-deep">·</span>{a}</li>)}
      </ul>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <a href={event.url} target="_blank" rel="noopener noreferrer" className="lift inline-flex min-h-12 items-center gap-2 rounded-pill bg-clay px-5 text-[16px] font-medium text-paper no-underline hover:bg-clay-deep">
          {event.kind === "Any day" ? "Details" : "Details and tickets"}
          <span className="sr-only"> for {event.name} at {event.venue} (opens in a new tab)</span>
          <span aria-hidden>↗</span>
        </a>
        {checked ? <p className="text-[13px] text-ink-mute">Checked {checked}</p> : null}
      </div>
    </li>
  );
}
