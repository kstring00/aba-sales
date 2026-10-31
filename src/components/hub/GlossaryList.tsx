"use client";

import { useMemo, useState } from "react";
import type { GlossaryTerm } from "@/lib/content/data";
import { ui } from "@/lib/content/data";

const CATS = ["people", "documents", "therapy terms", "insurance & services", "school"] as const;

/** Grouped by category, A–Z jump, search as you type. Everything runs in the browser. */
export function GlossaryList({ terms }: { terms: GlossaryTerm[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return terms;
    return terms.filter((t) => [t.term, t.full, t.short, ...t.aliases].some((x) => x.toLowerCase().includes(n)));
  }, [q, terms]);
  const letters = [...new Set(terms.map((t) => t.term[0].toUpperCase()))].sort();
  const anchorFor = (L: string) => [...terms].sort((a, b) => a.term.localeCompare(b.term)).find((t) => t.term[0].toUpperCase() === L)?.slug;
  return (
    <div>
      <label htmlFor="gl-search" className="block text-[15px] font-medium text-ink">{ui.glossary.search}</label>
      <input id="gl-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={ui.glossary.searchPlaceholder} autoComplete="off"
        className="mt-2 min-h-12 w-full rounded-pill border border-line-strong bg-paper px-5 text-[16px] text-ink focus:border-sage-deep focus:outline-none" />
      <nav aria-label={ui.glossary.jump} className="mt-4 flex flex-wrap gap-1">
        {letters.map((L) => <a key={L} href={`#${anchorFor(L)}`} className="inline-flex h-11 min-w-11 items-center justify-center rounded-md text-[15px] font-medium text-heading hover:bg-cream-deep">{L}</a>)}
      </nav>
      <p aria-live="polite" className="sr-only">{shown.length} terms</p>
      {shown.length === 0 ? <p className="mt-6 text-ink-mute">{ui.glossary.noMatch}</p> : null}
      {CATS.map((c) => {
        const list = shown.filter((t) => t.category === c).sort((a, b) => a.term.localeCompare(b.term));
        if (!list.length) return null;
        return (
          <section key={c} className="mt-10" aria-labelledby={`cat-${c.replace(/\W+/g, "-")}`}>
            <h2 id={`cat-${c.replace(/\W+/g, "-")}`} className="text-[1.5rem]">{ui.glossary.categories[c]}</h2>
            <dl className="mt-4 divide-y divide-line rounded-lg border border-line bg-paper">
              {list.map((t) => (
                <div key={t.slug} id={t.slug} className="scroll-mt-6 px-5 py-4">
                  <dt className="font-display text-[1.2rem] text-heading">{t.term}{t.full ? <span className="ml-2 font-sans text-[14px] text-ink-mute">{t.full}</span> : null}</dt>
                  <dd className="mt-1 text-[15px] text-ink-soft">{t.short || ui.glossary.pendingDefinition}{t.long ? <span className="mt-2 block">{t.long}</span> : null}{t.status !== "published" ? <span className="ml-2 rounded-pill bg-honey-soft px-2 py-0.5 text-[12px] text-ink">{t.status}</span> : null}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
