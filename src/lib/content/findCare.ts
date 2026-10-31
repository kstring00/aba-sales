import type { Resource } from "./data";

/**
 * Find care: which content blocks and which outside resources make up the
 * result for a set of answers. Pure, so all 18 combinations are tested.
 * No provider is ever named or ranked; resources are directories and
 * programs only.
 */
export type Age = "under-3" | "3-5" | "6-plus";
export type Coverage = "medicaid" | "private" | "none";
export type State = "TX" | "other";
export type Answers = { age: Age; coverage: Coverage; state: State };

export const AGES: Age[] = ["under-3", "3-5", "6-plus"];
export const COVERAGES: Coverage[] = ["medicaid", "private", "none"];
export const STATES: State[] = ["TX", "other"];

export const BLOCK = {
  under3: "Where to search: under 3",
  school: "Where to search: school-age",
  medicaid: "Where to search: Medicaid or CHIP",
  private: "Where to search: private insurance",
  none: "Where to search: no coverage or not sure",
  outside: "Outside Texas",
  questions: "Questions to ask a provider",
  script: "A short call script",
  redFlags: "Red flags",
  waitlist: "What a waitlist usually involves",
} as const;

export function parseAnswers(q: { get(k: string): string | null }): Partial<Answers> {
  const age = q.get("age") as Age | null;
  const coverage = q.get("coverage") as Coverage | null;
  const state = q.get("state") as State | null;
  return {
    age: age && AGES.includes(age) ? age : undefined,
    coverage: coverage && COVERAGES.includes(coverage) ? coverage : undefined,
    state: state && STATES.includes(state) ? state : undefined,
  };
}

export function careBlocks(a: Answers): string[] {
  return [
    a.age === "under-3" ? BLOCK.under3 : BLOCK.school,
    a.coverage === "medicaid" ? BLOCK.medicaid : a.coverage === "private" ? BLOCK.private : BLOCK.none,
    ...(a.state === "other" ? [BLOCK.outside] : []),
    BLOCK.questions,
    BLOCK.script,
    BLOCK.redFlags,
    BLOCK.waitlist,
  ];
}

export function careResources<R extends Resource>(a: Answers, all: R[]): R[] {
  return all.filter((r) => {
    if (r.category !== "find-care") return false;
    if (r.region !== "US" && !(a.state === "TX" && r.region === "TX")) return false;
    const ages = r.appliesTo?.age;
    const cov = r.appliesTo?.coverage;
    if (ages && !ages.includes(a.age)) return false;
    if (cov && !cov.includes(a.coverage)) return false;
    return true;
  });
}
