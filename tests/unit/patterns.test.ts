import { describe, expect, it } from "vitest";
import { buildPatterns, fmtHour, peakWindow } from "@/lib/patterns";
import type { EntryWithBehavior } from "@/lib/data";

function e(iso: string, label = "Hitting", antecedent: EntryWithBehavior["antecedent_code"] = null): EntryWithBehavior {
  return {
    id: iso + label,
    child_id: "c",
    behavior_id: "b",
    behavior_label: label,
    occurred_at: iso,
    antecedent_code: antecedent,
    antecedent_note: null,
    consequence_code: null,
    consequence_note: null,
    duration_seconds: null,
    intensity: null,
    note: null,
    created_by: null,
    created_at: iso,
    updated_at: iso,
  };
}

describe("patterns", () => {
  it("buckets by local hour and weekday", () => {
    // 22:30Z on a Tuesday = 5:30pm Chicago (CDT) Tuesday.
    const p = buildPatterns([e("2026-06-02T22:30:00Z"), e("2026-06-02T23:10:00Z")], "America/Chicago");
    expect(p.byHour[17]).toBe(1);
    expect(p.byHour[18]).toBe(1);
    expect(p.byDow[2]).toBe(2);
    expect(p.captions.hour).toBe("Most entries: 5pm–7pm");
    expect(p.captions.dow).toBe("Most entries: Tuesdays (2 of 2)");
  });

  it("captions are facts about counts, never interpretations", () => {
    const p = buildPatterns(
      [e("2026-06-02T13:00:00Z", "A", "instruction_given"), e("2026-06-03T13:00:00Z", "A", "instruction_given"), e("2026-06-04T13:00:00Z", "B")],
      "UTC",
    );
    expect(p.captions.antecedent).toBe("Most often recorded right before: An instruction was given (2 of 3)");
    expect(p.captions.behavior).toBe("Most often noticed: A (2 of 3)");
    const text = JSON.stringify(p.captions).toLowerCase();
    for (const banned of ["because", "trigger", "function", "likely", "means", "suggests"]) expect(text).not.toContain(banned);
  });

  it("empty input yields null captions and zero buckets", () => {
    const p = buildPatterns([], "UTC");
    expect(p.total).toBe(0);
    expect(p.captions).toEqual({ hour: null, dow: null, antecedent: null, behavior: null });
    expect(peakWindow(p.byHour)).toBeNull();
  });

  it("formats hours and wraps the peak window at midnight", () => {
    expect(fmtHour(0)).toBe("12am");
    expect(fmtHour(12)).toBe("12pm");
    expect(fmtHour(23)).toBe("11pm");
    const byHour = new Array(24).fill(0);
    byHour[23] = 3;
    byHour[0] = 3;
    expect(peakWindow(byHour)).toEqual([23, 1]);
  });
});
