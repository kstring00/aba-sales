"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { HELPS, IDEAS, INTERESTS, matchIdeas, type HelpId, type InterestId } from "@/lib/interests";

type Mark = "tried" | "liked" | "no";
const MARKS: Array<{ id: Mark; label: string }> = [
  { id: "tried", label: "Tried" },
  { id: "liked", label: "Liked" },
  { id: "no", label: "Not for us" },
];
const KEY = "ss-interest-explorer";

type Saved = { interests: InterestId[]; helps: HelpId[]; marks: Record<string, Mark> };
const EMPTY: Saved = { interests: [], helps: [], marks: {} };

// A tiny localStorage-backed store (same pattern as the ABC tracker): the
// server renders EMPTY, the client reads what this device saved. If storage
// is blocked the page still works for the visit; it just won't remember.
let cache: { raw: string | null; value: Saved } = { raw: null, value: EMPTY };
let memory: Saved = EMPTY;
const listeners = new Set<() => void>();

function read(): Saved {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return memory;
  }
  if (raw === null) return memory;
  if (raw !== cache.raw) {
    try {
      const v = JSON.parse(raw) as Partial<Saved>;
      cache = { raw, value: { interests: v.interests ?? [], helps: v.helps ?? [], marks: v.marks ?? {} } };
    } catch {
      cache = { raw, value: EMPTY };
    }
  }
  return cache.value;
}
function write(next: Saved) {
  memory = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: kept in memory for this visit */
  }
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/**
 * Pick what your child is drawn to (and, optionally, what helps), get ideas
 * to try, and mark each one. Choices stay on this device only. Nothing is
 * sent anywhere.
 */
export function InterestExplorer() {
  const saved = useSyncExternalStore(subscribe, read, () => EMPTY);
  const { interests, helps, marks } = saved;
  const update = (patch: Partial<Saved>) => write({ ...read(), ...patch });
  const setInterests = (fn: (l: InterestId[]) => InterestId[]) => update({ interests: fn(read().interests) });
  const setHelps = (fn: (l: HelpId[]) => HelpId[]) => update({ helps: fn(read().helps) });
  const setMarks = (fn: (m: Record<string, Mark>) => Record<string, Mark>) => update({ marks: fn(read().marks) });

  const ideas = useMemo(() => (interests.length ? matchIdeas(interests, helps) : []), [interests, helps]);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const liked = IDEAS.filter((i) => marks[i.id] === "liked");

  return (
    <div>
      <section aria-labelledby="ie-1" className="print:hidden">
        <h2 id="ie-1" className="text-[1.35rem]">1. What does your child get absorbed in?</h2>
        <p className="mt-1 text-[15px] text-ink-mute">Pick as many as fit. Think about what they choose when nobody is choosing for them.</p>
        <div role="group" aria-label="Interests" className="mt-4 grid gap-2 sm:grid-cols-2">
          {INTERESTS.map((x) => (
            <Chip key={x.id} selected={interests.includes(x.id)} onClick={() => setInterests((l) => toggle(l, x.id))} className="w-full justify-start py-2">
              <span>
                <span className="block font-medium text-ink">{x.label}</span>
                <span className="block text-[13.5px] text-ink-mute">{x.hint}</span>
              </span>
            </Chip>
          ))}
        </div>
      </section>

      <section aria-labelledby="ie-2" className="mt-8 print:hidden">
        <h2 id="ie-2" className="text-[1.35rem]">2. What usually helps? <span className="text-[15px] font-normal text-ink-mute">(optional)</span></h2>
        <div role="group" aria-label="What helps" className="mt-4 flex flex-wrap gap-2">
          {HELPS.map((x) => (
            <Chip key={x.id} selected={helps.includes(x.id)} onClick={() => setHelps((l) => toggle(l, x.id))}>{x.label}</Chip>
          ))}
        </div>
      </section>

      <section aria-labelledby="ie-3" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="ie-3" className="text-[1.35rem]">{interests.length ? "Ideas to try" : "Your ideas will show here"}</h2>
          {ideas.length ? (
            <Button type="button" size="sm" className="print:hidden" onClick={() => window.print()}>Print my list</Button>
          ) : null}
        </div>
        <p aria-live="polite" className="mt-1 text-[14px] text-ink-mute">
          {interests.length ? `${ideas.length} ideas, best matches first. Mark each one as you go; it stays on this device.` : "Pick at least one interest above."}
        </p>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {ideas.map((i) => (
            <li key={i.id} className="paper-card flex flex-col p-5 print:break-inside-avoid print:shadow-none">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[1.15rem] leading-snug">{i.name}</h3>
                <span className="shrink-0 rounded-pill border border-line px-2.5 py-0.5 text-[12.5px] text-ink-mute">{i.where} · {i.cost}</span>
              </div>
              <p className="mt-2 text-[15px] text-ink">{i.why}</p>
              <p className="mt-2 text-[14px] text-ink-soft"><span className="font-medium text-ink">Makes it easier:</span> {i.easier}</p>
              <div role="group" aria-label={`Mark ${i.name}`} className="mt-4 flex flex-wrap gap-2">
                {MARKS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={marks[i.id] === m.id}
                    onClick={() => setMarks((s) => { const n = { ...s }; if (n[i.id] === m.id) delete n[i.id]; else n[i.id] = m.id; return n; })}
                    className={`min-h-10 rounded-pill border px-3 text-[14px] ${marks[i.id] === m.id ? "border-sage-deep bg-sage-tint text-ink" : "border-line-strong bg-paper text-ink-soft hover:border-ink-faint"}`}
                  >
                    {marks[i.id] === m.id ? "✓ " : ""}{m.label}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {liked.length ? (
        <section aria-labelledby="ie-4" className="paper-card mt-10 p-5">
          <h2 id="ie-4" className="text-[1.2rem]">What we liked</h2>
          <ul className="mt-2 space-y-1 text-[15px] text-ink">{liked.map((i) => <li key={i.id}>· {i.name}</li>)}</ul>
          <p className="mt-3 text-[14px] text-ink-mute">Worth sharing with your child&apos;s teacher, sitter or team: it&apos;s a quick picture of what works.</p>
        </section>
      ) : null}
    </div>
  );
}
