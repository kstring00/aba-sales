import { describe, expect, it } from "vitest";
import { buildMatcher, unknownAcronyms } from "@/lib/content/terms";
import type { GlossaryTerm } from "@/lib/content/data";

const t = (term: string, aliases: string[] = []): GlossaryTerm => ({ term, slug: term.toLowerCase().replace(/[^a-z0-9]+/g, "-"), full: "", short: "", long: "", aliases, category: "therapy terms", status: "published" });
const TERMS = [t("BCBA", ["Board Certified Behavior Analyst"]), t("RBT"), t("IEP"), t("ARD"), t("FBA"), t("BIP"), t("prior authorization", ["prior auth"]), t("reinforcement"), t("prompt"), t("behavior"), t("replacement behavior"), t("treatment plan"), t("Medicaid")];
const find = buildMatcher(TERMS);

describe("glossary matching", () => {
  it("finds ten known terms in a paragraph, including aliases and plurals, in reading order", () => {
    const text = "The BCBA and two RBTs will update the treatment plan after the FBA. A BIP lists replacement behaviors and prompts. Prior auth from Medicaid is needed before the ARD and the IEP meeting; ask your Board Certified Behavior Analyst about reinforcement.";
    const hits = find(text).map((m) => m.term.term);
    expect(hits).toEqual(["BCBA", "RBT", "treatment plan", "FBA", "BIP", "replacement behavior", "prompt", "prior authorization", "Medicaid", "ARD", "IEP", "BCBA", "reinforcement"]);
    expect(new Set(hits).size).toBeGreaterThanOrEqual(10);
  });
  it("prefers the longest term and ignores acronyms in the wrong case", () => {
    expect(find("replacement behavior").map((m) => m.term.term)).toEqual(["replacement behavior"]);
    expect(find("the iep was late")).toEqual([]);
    expect(find("prompted")).toEqual([]);
  });
  it("lists unknown acronyms once each", () => {
    expect(unknownAcronyms("The BCBA said the VB-MAPP and PFA and PFA again, plus the RBT", TERMS)).toEqual(["VB-MAPP", "PFA"]);
  });
});
