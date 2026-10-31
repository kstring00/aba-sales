import type { Report } from "./report";

/**
 * RFC 4180 CSV. Cells that start with =, +, -, @ or a tab/CR are prefixed
 * with an apostrophe so spreadsheets don't execute them as formulas.
 */
export function csvCell(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const CSV_HEADERS = [
  "date",
  "time",
  "noticed",
  "right_before",
  "right_before_note",
  "right_after",
  "right_after_note",
  "duration_seconds",
  "intensity",
  "note",
  "parent_reflection_might_be",
] as const;

export function reportToCsv(report: Report): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const w of report.weeks) {
    for (const r of w.rows) {
      lines.push(
        [
          r.date,
          r.time,
          r.noticed,
          r.before,
          r.beforeNote,
          r.after,
          r.afterNote,
          r.durationSeconds ?? "",
          r.intensity,
          r.note,
          r.mightBe,
        ]
          .map(csvCell)
          .join(","),
      );
    }
  }
  // BOM so Excel opens UTF-8 correctly.
  return "﻿" + lines.join("\r\n") + "\r\n";
}
