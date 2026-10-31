import { describe, expect, it } from "vitest";
import { computePatterns } from "@/lib/abc/patterns";
import type { EntryWithBehavior } from "@/lib/abc/types";

// Eight fixture observations; the expected counts below were worked out by hand.
const at = (h: number, m = 0) => new Date(2026, 2, 2, h, m).toISOString();
function e(p: Partial<EntryWithBehavior> & { occurredAt: string }): EntryWithBehavior {
  return { id: Math.random().toString(36), behaviorIds: ["b"], behaviorLabels: ["Screaming"], behaviorLabel: "Screaming", antecedentCode: null, antecedentNote: null, consequenceCode: null, consequenceNote: null, durationSeconds: null, intensity: null, note: null, createdAt: "t", updatedAt: "t", ...p };
}
const FIXTURE: EntryWithBehavior[] = [
  e({ occurredAt: at(7, 40), antecedentCode: "activity_changed", consequenceCode: "comfort_offered", earlySigns: ["Covering ears"] }),
  e({ occurredAt: at(7, 55), antecedentCode: "activity_changed", consequenceCode: "item_provided", earlySigns: ["Covering ears", "Pacing"] }),
  e({ occurredAt: at(8, 10), antecedentCode: "instruction_given", consequenceCode: "comfort_offered" }),
  e({ occurredAt: at(16, 0), antecedentCode: "activity_changed", consequenceCode: "comfort_offered", earlySigns: ["Pacing"] }),
  e({ occurredAt: at(16, 30), antecedentCode: "something_else", antecedentNote: "Loud blender", consequenceCode: "no_response_observed" }),
  e({ occurredAt: at(17, 5), antecedentCode: "activity_changed", consequenceCode: "not_sure", earlySigns: ["Covering ears"] }),
  e({ occurredAt: at(19, 20), antecedentCode: "not_sure", consequenceCode: "comfort_offered" }),
  e({ occurredAt: at(7, 15), antecedentCode: "activity_changed", consequenceCode: "activity_stopped" }),
];

describe("What you're noticing", () => {
  const p = computePatterns(FIXTURE);
  it("most common right before: an activity or location changed, 5 of 8", () => {
    expect(p.before).toEqual({ label: "An activity or location changed", count: 5 });
  });
  it("most common right after: someone offered comfort, 4 of 8 ('Not sure' never wins)", () => {
    expect(p.after).toEqual({ label: "Someone offered comfort", count: 4 });
  });
  it("time cluster: 7am–9am holds 4 (7:15, 7:40, 7:55, 8:10)", () => {
    expect(p.time).toEqual({ from: "7am", to: "9am", count: 4 });
  });
  it("most common early sign: covering ears, 3; moments with any early sign: 4 of 8", () => {
    expect(p.early).toEqual({ label: "Covering ears", count: 3 });
    expect(p.earlyShare).toEqual({ withEarly: 4, total: 8 });
  });
  it("is empty-safe", () => {
    expect(computePatterns([])).toMatchObject({ total: 0, before: null, after: null, time: null, early: null });
  });
});
