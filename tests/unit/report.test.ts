import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/export/report";
import { csvCell, reportToCsv } from "@/lib/export/csv";
import type { EntryWithBehavior } from "@/lib/abc/types";

function entry(p: Partial<EntryWithBehavior> & { occurredAt: string; behaviorLabel: string }): EntryWithBehavior {
  return {
    id: crypto.randomUUID(),
    behaviorId: "b",
    antecedentCode: null,
    antecedentNote: null,
    consequenceCode: null,
    consequenceNote: null,
    durationSeconds: null,
    intensity: null,
    note: null,
    createdAt: p.occurredAt,
    updatedAt: p.occurredAt,
    ...p,
  };
}

const TZ = "America/Chicago";

describe("buildReport", () => {
  it("splits the range into 7-day weeks and assigns entries by local date", () => {
    const entries = [
      // 11:30pm Chicago on Mar 1 = 05:30Z Mar 2. Must land on Mar 1 locally.
      entry({ occurredAt: "2026-03-02T05:30:00Z", behaviorLabel: "Hitting" }),
      entry({ occurredAt: "2026-03-09T15:00:00Z", behaviorLabel: "Screaming", antecedentCode: "instruction_given" }),
      entry({ occurredAt: "2026-03-10T15:00:00Z", behaviorLabel: "Screaming", antecedentCode: "instruction_given", intensity: 2 }),
    ];
    const r = buildReport({ nickname: "Bean", from: "2026-03-01", to: "2026-03-14", tz: TZ, entries });
    expect(r.weeks.map((w) => [w.start, w.end])).toEqual([
      ["2026-03-01", "2026-03-07"],
      ["2026-03-08", "2026-03-14"],
    ]);
    expect(r.weeks[0].rows).toHaveLength(1);
    expect(r.weeks[0].rows[0].date).toBe("2026-03-01");
    expect(r.weeks[1].rows).toHaveLength(2);
    expect(r.total).toBe(3);
  });

  it("counts only, sorted by frequency, with 'Not recorded' for blanks", () => {
    const entries = [
      entry({ occurredAt: "2026-03-02T15:00:00Z", behaviorLabel: "A", antecedentCode: "child_alone" }),
      entry({ occurredAt: "2026-03-02T16:00:00Z", behaviorLabel: "B", antecedentCode: "child_alone" }),
      entry({ occurredAt: "2026-03-02T17:00:00Z", behaviorLabel: "B" }),
    ];
    const r = buildReport({ nickname: "Bean", from: "2026-03-01", to: "2026-03-03", tz: TZ, entries });
    expect(r.byBehavior).toEqual([
      { label: "B", count: 2 },
      { label: "A", count: 1 },
    ]);
    expect(r.byAntecedent).toEqual([
      { label: "The child was alone", count: 2 },
      { label: "Not recorded", count: 1 },
    ]);
    // Nothing in the report object says "because", "function", or "likely".
    const json = JSON.stringify(r).toLowerCase();
    for (const banned of ["because", "function", "likely", "suggests", "indicates"]) {
      expect(json).not.toContain(banned);
    }
  });

  it("a partial final week ends on the requested 'to' date", () => {
    const r = buildReport({ nickname: "Bean", from: "2026-03-01", to: "2026-03-10", tz: TZ, entries: [] });
    expect(r.weeks[1]).toMatchObject({ start: "2026-03-08", end: "2026-03-10" });
  });
});

describe("csv", () => {
  it("escapes quotes, commas, and newlines", () => {
    expect(csvCell('He said "no", then left\nquietly')).toBe('"He said ""no"", then left\nquietly"');
  });
  it("neutralizes spreadsheet formulas", () => {
    expect(csvCell("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(csvCell("-5 minutes")).toBe("'-5 minutes");
    expect(csvCell("@mention")).toBe("'@mention");
  });
  it("writes a header, BOM, and one line per entry", () => {
    const r = buildReport({
      nickname: "Bean",
      from: "2026-03-01",
      to: "2026-03-07",
      tz: TZ,
      entries: [entry({ occurredAt: "2026-03-02T15:00:00Z", behaviorLabel: "Hitting", note: "a, b" })],
    });
    const csv = reportToCsv(r);
    expect(csv.startsWith("﻿date,time,noticed")).toBe(true);
    const lines = csv.trim().split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('"a, b"');
  });
});
