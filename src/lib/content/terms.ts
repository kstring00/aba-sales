import type { GlossaryTerm } from "./data";

/**
 * Finds glossary terms in plain text. Acronyms (all capitals) match
 * case-sensitively; words match case-insensitively. Plurals ("BCBAs",
 * "IEPs", "prompts") match. Longest match wins, so "replacement behavior"
 * beats "behavior". Pure: used by lesson auto-linking and by Decode.
 */
export type Match = { start: number; end: number; text: string; term: GlossaryTerm };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isAcronym = (s: string) => /^[A-Z0-9][A-Z0-9 &/-]*$/.test(s) && /[A-Z]/.test(s);

export function buildMatcher(terms: GlossaryTerm[]) {
  const forms: { form: string; term: GlossaryTerm }[] = [];
  for (const t of terms) for (const f of [t.term, ...t.aliases]) if (f.trim()) forms.push({ form: f.trim(), term: t });
  forms.sort((a, b) => b.form.length - a.form.length);
  const parts = forms.map(({ form }) => `${escape(form)}(?:e?s)?`);
  if (parts.length === 0) return () => [] as Match[];
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${parts.join("|")})(?![\\p{L}\\p{N}])`, "giu");
  return function find(text: string): Match[] {
    const out: Match[] = [];
    for (const m of text.matchAll(re)) {
      const hit = m[0];
      const base = hit.replace(/e?s$/i, "");
      const entry = forms.find(({ form }) => {
        const same = (x: string) => (isAcronym(form) ? x === form : x.toLowerCase() === form.toLowerCase());
        return same(hit) || same(base) || same(hit.slice(0, -1));
      });
      if (!entry) continue; // acronym in the wrong case, e.g. "aba" in prose
      out.push({ start: m.index!, end: m.index! + hit.length, text: hit, term: entry.term });
    }
    return out;
  };
}

/** Capitalized acronyms (2–6 letters, hyphen-joined parts kept together, e.g. VB-MAPP) not in the glossary, in order, de-duplicated. */
export function unknownAcronyms(text: string, terms: GlossaryTerm[]): string[] {
  const known = new Set(terms.flatMap((t) => [t.term, ...t.aliases]).map((s) => s.toUpperCase()));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of text.matchAll(/(?<![\p{L}\p{N}-])([A-Z]{2,6}(?:-[A-Z]{2,6})*)(?:s)?(?![\p{L}\p{N}-])/gu)) {
    const a = m[1];
    if (known.has(a) || seen.has(a)) continue;
    seen.add(a);
    out.push(a);
  }
  return out;
}
