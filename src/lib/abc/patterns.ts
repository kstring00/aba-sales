/**
 * "What you're noticing": descriptive counts only. Every sentence shown to
 * a parent comes from a template in content/tracker.json; this module only
 * counts. Nothing here says why anything happened.
 */
import type { EntryWithBehavior } from "./types";
import { antecedentLabel, consequenceLabel } from "@/lib/observation";
import { byHour, fmtHour, peakWindow } from "./views";

export const MIN_FOR_PATTERNS = 5;

export type Top = { label: string; count: number } | null;

export type Patterns = {
  total: number;
  before: Top;
  after: Top;
  time: { from: string; to: string; count: number } | null;
  early: Top;
  earlyShare: { withEarly: number; total: number };
};

function top(values: string[]): Top {
  const m = new Map<string, number>();
  for (const v of values) if (v) m.set(v, (m.get(v) ?? 0) + 1);
  let best: Top = null;
  for (const [label, count] of m) if (!best || count > best.count || (count === best.count && label < best.label)) best = { label, count };
  return best;
}

const beforeOf = (e: EntryWithBehavior) =>
  e.antecedentCode === "something_else" ? (e.antecedentNote?.trim() ?? "") : e.antecedentCode && e.antecedentCode !== "not_sure" ? antecedentLabel(e.antecedentCode) : "";
const afterOf = (e: EntryWithBehavior) =>
  e.consequenceCode === "something_else" ? (e.consequenceNote?.trim() ?? "") : e.consequenceCode && e.consequenceCode !== "not_sure" ? consequenceLabel(e.consequenceCode) : "";

export function computePatterns(entries: EntryWithBehavior[]): Patterns {
  const hours = byHour(entries);
  const win = peakWindow(hours);
  const early = entries.flatMap((e) => e.earlySigns ?? []);
  return {
    total: entries.length,
    before: top(entries.map(beforeOf)),
    after: top(entries.map(afterOf)),
    time: win ? { from: fmtHour(win[0]), to: fmtHour(win[1]), count: hours[win[0]] + hours[(win[0] + 1) % 24] } : null,
    early: top(early),
    earlyShare: { withEarly: entries.filter((e) => (e.earlySigns ?? []).length > 0).length, total: entries.length },
  };
}
