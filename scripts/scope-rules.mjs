/**
 * Scope rules for parent-facing content. The founder is an RBT, not a BCBA:
 * content may educate in general terms but must never tell a parent why
 * their child does something, what function a behavior serves, what
 * intervention to use, or promise outcomes. Shared by scope-check.mjs and
 * the unit tests.
 */
export const RULES = [
  { id: "explains-child", re: /\byour child (is|was) (doing|seeking|trying|wanting|getting|avoiding|escaping)\b/i, why: "explains why a specific child does something" },
  { id: "this-means", re: /\bthis means your child\b/i, why: "interprets a child's behavior" },
  { id: "ignore", re: /\bignore (the|this|that|their|his|her) (behaviou?r|tantrum|meltdown)/i, why: "prescribes an intervention" },
  { id: "extinction", re: /\bextinction\b/i, why: "names an intervention" },
  { id: "function", re: /\b(the function (is|of (the|this|that|your))|serves the function)\b/i, why: "assigns a function to behavior" },
  { id: "diagnose", re: /\bdiagnos/i, why: "diagnostic language" },
  { id: "cure", re: /\bcur(e|es|ed|ing)\b/i, why: "outcome claim" },
  { id: "will-stop", re: /\bwill (stop|reduce|eliminate|fix|end)\b/i, why: "outcome promise" },
  { id: "guarantee", re: /\bguarantee/i, why: "outcome promise" },
  { id: "noncompliant", re: /\bnon-?complian/i, why: "deficit language" },
  { id: "manipulative", re: /\bmanipulat/i, why: "deficit language" },
  { id: "misbehave", re: /\bmisbehav/i, why: "deficit language" },
  { id: "suffers", re: /\bsuffers? from\b/i, why: "deficit language" },
  { id: "seeking-attention", re: /\b(attention|sensory)[- ]seeking\b/i, why: "assigns a function to behavior" },
];

/** A `scope-ok: <reason>` marker exempts its own line and the next one. The reason must say something. */
export const ESCAPE = /scope-ok:\s*(.{10,})/i;

/** Checks plain text (Markdown, TS, or a JSON string value). Returns hits with 1-based line numbers. */
export function checkText(text, { allowEscape = true } = {}) {
  const lines = text.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const exempt = allowEscape && (ESCAPE.test(lines[i]) || (i > 0 && ESCAPE.test(lines[i - 1])));
    if (exempt) continue;
    for (const r of RULES) {
      const m = lines[i].match(r.re);
      if (m) hits.push({ line: i + 1, rule: r.id, why: r.why, match: m[0], text: lines[i].trim().slice(0, 160) });
    }
  }
  return hits;
}

/** Walks JSON; an object with "scopeOk": "<reason ≥ 10 chars>" exempts every string inside it. */
export function checkJson(value, pathParts = []) {
  const hits = [];
  if (typeof value === "string") {
    for (const h of checkText(value, { allowEscape: false })) hits.push({ ...h, line: pathParts.join(".") });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => hits.push(...checkJson(v, [...pathParts, i])));
  } else if (value && typeof value === "object") {
    if (typeof value.scopeOk === "string" && value.scopeOk.trim().length >= 10) return hits;
    for (const [k, v] of Object.entries(value)) if (!k.startsWith("_")) hits.push(...checkJson(v, [...pathParts, k]));
  }
  return hits;
}
