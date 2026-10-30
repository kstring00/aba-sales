/**
 * Report aggregation. Pure functions, no IO. Counts only — a report states
 * what was recorded and never why anything happened.
 */
import { addDays, toDateStr } from "@/lib/time/zoned";
import { antecedentLabel, consequenceLabel, intensityLabel, formatDuration } from "@/lib/observation";
import type { EntryWithBehavior } from "@/lib/abc/types";

export type ReportRow = {
  id: string;
  occurredAt: Date;
  date: string; // yyyy-mm-dd in tz
  time: string; // h:mm am/pm in tz
  noticed: string;
  before: string;
  beforeNote: string;
  after: string;
  afterNote: string;
  duration: string;
  durationSeconds: number | null;
  intensity: string;
  intensityValue: number | null;
  note: string;
};

export type ReportWeek = { start: string; end: string; rows: ReportRow[] };
export type Count = { label: string; count: number };

export type Report = {
  nickname: string;
  from: string;
  to: string;
  tz: string;
  generatedAt: Date;
  total: number;
  weeks: ReportWeek[];
  byBehavior: Count[];
  byAntecedent: Count[];
  byConsequence: Count[];
  byIntensity: Count[];
};

export function toRow(e: EntryWithBehavior, tz: string): ReportRow {
  const d = new Date(e.occurredAt);
  const time = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(d);
  const beforeBase = e.antecedentCode === "something_else" ? "Something else" : antecedentLabel(e.antecedentCode);
  const afterBase = e.consequenceCode === "something_else" ? "Something else" : consequenceLabel(e.consequenceCode);
  return {
    id: e.id,
    occurredAt: d,
    date: toDateStr(d, tz),
    time,
    noticed: e.behaviorLabel,
    before: beforeBase,
    beforeNote: e.antecedentNote ?? "",
    after: afterBase,
    afterNote: e.consequenceNote ?? "",
    duration: formatDuration(e.durationSeconds),
    durationSeconds: e.durationSeconds,
    intensity: intensityLabel(e.intensity),
    intensityValue: e.intensity,
    note: e.note ?? "",
  };
}

function tally(rows: ReportRow[], pick: (r: ReportRow) => string): Count[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = pick(r) || "Not recorded";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function buildReport(input: {
  nickname: string;
  from: string;
  to: string;
  tz: string;
  entries: EntryWithBehavior[];
  generatedAt?: Date;
}): Report {
  const rows = input.entries.map((e) => toRow(e, input.tz)).sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());

  const weeks: ReportWeek[] = [];
  let start = input.from;
  while (start <= input.to) {
    const end = addDays(start, 6) > input.to ? input.to : addDays(start, 6);
    weeks.push({ start, end, rows: rows.filter((r) => r.date >= start && r.date <= end) });
    start = addDays(end, 1);
  }

  return {
    nickname: input.nickname,
    from: input.from,
    to: input.to,
    tz: input.tz,
    generatedAt: input.generatedAt ?? new Date(),
    total: rows.length,
    weeks,
    byBehavior: tally(rows, (r) => r.noticed),
    byAntecedent: tally(rows, (r) => r.before),
    byConsequence: tally(rows, (r) => r.after),
    byIntensity: tally(rows, (r) => r.intensity),
  };
}

export function fmtRangeLabel(from: string, to: string) {
  const f = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(y, m - 1, d)),
    );
  };
  return from === to ? f(from) : `${f(from)} – ${f(to)}`;
}
