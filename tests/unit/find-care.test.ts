import { describe, expect, it } from "vitest";
import { AGES, COVERAGES, STATES, careBlocks, careResources, parseAnswers } from "@/lib/content/findCare";
import { resources } from "@/lib/content/data";

describe("Find care", () => {
  it("renders a sensible card for all 18 combinations", () => {
    const table: Record<string, { blocks: string[]; resources: string[] }> = {};
    for (const age of AGES) for (const coverage of COVERAGES) for (const state of STATES) {
      const a = { age, coverage, state };
      table[`${age} · ${coverage} · ${state}`] = { blocks: careBlocks(a), resources: careResources(a, resources).map((r) => r.id) };
    }
    expect(Object.keys(table)).toHaveLength(18);
    for (const [k, v] of Object.entries(table)) {
      expect(v.blocks.length, k).toBeGreaterThanOrEqual(6);
      expect(v.blocks, k).toContain("Questions to ask a provider");
      expect(v.resources, k).toContain("bacb-registry");
      if (k.endsWith("other")) expect(v.resources.some((id) => id.startsWith("texas")), k).toBe(false);
    }
    expect(table).toMatchSnapshot();
  });
  it("ignores unknown query values", () => {
    expect(parseAnswers(new URLSearchParams("age=9&coverage=private&state=CA"))).toEqual({ age: undefined, coverage: "private", state: undefined });
  });
});
