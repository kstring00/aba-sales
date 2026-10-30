/**
 * Pure aggregations for the two non-list views. Counts only. The captions
 * state what was recorded and never why.
 */
import type { EntryWithBehavior } from "./types";
import { antecedentLabel } from "@/lib/observation";

export function fmtHour(h: number) {
  const hh = ((h % 24) + 24) % 24;
  if (hh === 0) return "12am";
  if (hh === 12) return "12pm";
  return hh < 12 ? `${hh}am` : `${hh - 12}pm`;
}

export function byHour(entries: EntryWithBehavior[]): number[] {
  const out = new Array<number>(24).fill(0);
  for (const e of entries) out[new Date(e.occurredAt).getHours()] += 1;
  return out;
}

/** Best 2-hour window by count, or null when empty. */
export function peakWindow(hours: number[]): [number, number] | null {
  if (hours.every((n) => n === 0)) return null;
  let best = -1;
  let start = 0;
  for (let h = 0; h < 24; h++) {
    const sum = hours[h] + hours[(h + 1) % 24];
    if (sum > best) {
      best = sum;
      start = h;
    }
  }
  return [start, (start + 2) % 24];
}

export function hourCaption(hours: number[]): string | null {
  const p = peakWindow(hours);
  return p ? `Most entries: ${fmtHour(p[0])}–${fmtHour(p[1])}` : null;
}

export type Count = { label: string; count: number };

export function byAntecedent(entries: EntryWithBehavior[]): Count[] {
  const m = new Map<string, number>();
  for (const e of entries) {
    const k = e.antecedentCode ? (e.antecedentCode === "something_else" ? "Something else" : antecedentLabel(e.antecedentCode)) : "Not recorded";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function antecedentCaption(counts: Count[], total: number): string | null {
  const top = counts.find((c) => c.label !== "Not recorded");
  return top ? `Most often recorded right before: ${top.label} (${top.count} of ${total})` : null;
}
