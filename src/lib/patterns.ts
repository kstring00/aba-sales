/**
 * Pattern views (Pro). Pure aggregation over entries in the viewer's zone.
 * Captions state facts about the counts and nothing else.
 */
import type { EntryWithBehavior } from "@/lib/data";
import { antecedentLabel } from "@/lib/observation";

export type Patterns = {
  total: number;
  byHour: number[]; // 24
  byDow: number[]; // 7, Sunday first
  byAntecedent: Array<{ label: string; count: number }>;
  byBehavior: Array<{ label: string; count: number }>;
  captions: { hour: string | null; dow: string | null; antecedent: string | null; behavior: string | null };
};

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function localParts(iso: string, tz: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", hour: "numeric", weekday: "short" }).formatToParts(d);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  return { hour, dow: dow < 0 ? 0 : dow };
}

export function fmtHour(h: number) {
  const hh = ((h % 24) + 24) % 24;
  if (hh === 0) return "12am";
  if (hh === 12) return "12pm";
  return hh < 12 ? `${hh}am` : `${hh - 12}pm`;
}

/** Best 2-hour window by count. Returns [startHour, endHourExclusive]. */
export function peakWindow(byHour: number[]): [number, number] | null {
  const total = byHour.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  let best = -1;
  let bestStart = 0;
  for (let h = 0; h < 24; h++) {
    const sum = byHour[h] + byHour[(h + 1) % 24];
    if (sum > best) {
      best = sum;
      bestStart = h;
    }
  }
  return [bestStart, (bestStart + 2) % 24];
}

export function buildPatterns(entries: EntryWithBehavior[], tz: string): Patterns {
  const byHour = new Array<number>(24).fill(0);
  const byDow = new Array<number>(7).fill(0);
  const ant = new Map<string, number>();
  const beh = new Map<string, number>();
  for (const e of entries) {
    const { hour, dow } = localParts(e.occurred_at, tz);
    byHour[hour] += 1;
    byDow[dow] += 1;
    const a = e.antecedent_code ? (e.antecedent_code === "something_else" ? "Something else" : antecedentLabel(e.antecedent_code)) : "Not recorded";
    ant.set(a, (ant.get(a) ?? 0) + 1);
    beh.set(e.behavior_label, (beh.get(e.behavior_label) ?? 0) + 1);
  }
  const sortCounts = (m: Map<string, number>) =>
    [...m.entries()].map(([label, count]) => ({ label, count })).sort((x, y) => y.count - x.count || x.label.localeCompare(y.label));

  const total = entries.length;
  const byAntecedent = sortCounts(ant);
  const byBehavior = sortCounts(beh);
  const peak = peakWindow(byHour);
  const maxDow = Math.max(...byDow);
  const dowIdx = byDow.indexOf(maxDow);
  const topAnt = byAntecedent.find((c) => c.label !== "Not recorded");

  return {
    total,
    byHour,
    byDow,
    byAntecedent,
    byBehavior,
    captions: {
      hour: peak ? `Most entries: ${fmtHour(peak[0])}–${fmtHour(peak[1])}` : null,
      dow: total ? `Most entries: ${DOW[dowIdx]}s (${maxDow} of ${total})` : null,
      antecedent: topAnt ? `Most often recorded right before: ${topAnt.label} (${topAnt.count} of ${total})` : null,
      behavior: byBehavior[0] ? `Most often noticed: ${byBehavior[0].label} (${byBehavior[0].count} of ${total})` : null,
    },
  };
}
