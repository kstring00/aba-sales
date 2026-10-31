import { describe, expect, it } from "vitest";
import { checkJson, checkText } from "../../scripts/scope-rules.mjs";
import { parseFrontMatter, splitSections } from "@/lib/content/frontmatter";

describe("scope check", () => {
  it("fails on prescriptive and diagnostic wording", () => {
    for (const bad of ["Your child is seeking attention.", "ignore the behavior", "use extinction", "The function is escape.", "This will stop meltdowns.", "attention-seeking", "a cure", "noncompliant", "suffers from autism"]) {
      expect(checkText(bad).length, bad).toBeGreaterThan(0);
    }
  });
  it("passes descriptive, general wording", () => {
    for (const good of ["6 of 8 moments came right after an instruction.", "Write what you saw, not what it means.", "Keep it secure.", "Ask your BCBA what could help."]) {
      expect(checkText(good), good).toEqual([]);
    }
  });
  it("honors a reasoned escape on the line above, but not an empty one", () => {
    expect(checkText("<!-- scope-ok: quoting a myth to correct it -->\nignore the behavior")).toEqual([]);
    expect(checkText("<!-- scope-ok: -->\nignore the behavior").length).toBe(1);
  });
  it("checks JSON strings and honors scopeOk on an object", () => {
    expect(checkJson({ a: { short: "Use extinction." } }).length).toBe(1);
    expect(checkJson({ a: { short: "Use extinction.", scopeOk: "naming a term in the glossary" } })).toEqual([]);
  });
});

describe("content front matter", () => {
  const md = `---\ntitle: Right now\ndescription: For a hard moment.\nstatus: pending\nrelated: for-you, learn\nsources:\n- A source | https://example.org/a\n---\n\n## First\n\n<!-- WRITE: something -->\n\n## Second\n\nReal words.\n`;
  it("reads flat keys, comma lists and source lines", () => {
    const { data } = parseFrontMatter("x.md", md);
    expect(data).toMatchObject({ title: "Right now", status: "pending", related: ["for-you", "learn"], sources: [{ title: "A source", url: "https://example.org/a" }] });
  });
  it("splits ## sections and marks note-only sections as pending", () => {
    const { body } = parseFrontMatter("x.md", md);
    expect(splitSections(body).map((s) => [s.heading, s.pending])).toEqual([["First", true], ["Second", false]]);
  });
  it("rejects a bad status or a malformed source", () => {
    expect(() => parseFrontMatter("x.md", "---\ntitle: T\nstatus: live\n---\n")).toThrow(/status/);
    expect(() => parseFrontMatter("x.md", "---\ntitle: T\nsources:\n- no link\n---\n")).toThrow(/source/);
  });
});
