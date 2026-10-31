"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import type { GlossaryTerm } from "@/lib/content/data";
import { fill, ui } from "@/lib/content/data";
import { buildMatcher, unknownAcronyms } from "@/lib/content/terms";

const T = ui.decode;

/**
 * Decode my paperwork. Pure browser work: no fetch, no storage, nothing
 * leaves the device. Highlights every glossary term and alias in what was
 * pasted and lists the definitions in reading order.
 */
export function Decode({ terms, contactEmail, productHref }: { terms: GlossaryTerm[]; contactEmail: string; productHref: string | null }) {
  const [text, setText] = useState("");
  const find = useMemo(() => buildMatcher(terms), [terms]);
  const matches = useMemo(() => find(text), [find, text]);
  const unknown = useMemo(() => unknownAcronyms(text, terms), [text, terms]);
  const ordered = useMemo(() => {
    const seen = new Set<string>();
    return matches.filter((m) => (seen.has(m.term.slug) ? false : (seen.add(m.term.slug), true)));
  }, [matches]);

  const highlighted: React.ReactNode[] = [];
  let at = 0;
  for (const m of matches) {
    highlighted.push(text.slice(at, m.start));
    highlighted.push(<mark key={m.start} className="rounded-sm bg-honey-soft px-0.5 text-ink">{m.text}</mark>);
    at = m.end;
  }
  highlighted.push(text.slice(at));

  return (
    <div className="space-y-8">
      <p className="rounded-md bg-sage-tint px-4 py-3 text-[15px] text-ink">{T.privacy}</p>
      <div>
        <label htmlFor="decode-in" className="block text-[16px] font-medium text-ink">{T.label}</label>
        <textarea id="decode-in" value={text} onChange={(e) => setText(e.target.value)} rows={7} spellCheck={false} autoComplete="off"
          className="mt-2 w-full rounded-lg border border-line-strong bg-paper px-4 py-3 text-[16px] leading-relaxed text-ink focus:border-sage-deep focus:outline-none" />
      </div>
      {text.trim() ? (
        <>
          <section aria-labelledby="dc-hl">
            <h2 id="dc-hl" className="text-[1.3rem]">{T.highlighted}</h2>
            <p className="mt-3 whitespace-pre-wrap rounded-lg border border-line bg-paper p-4 text-[16px] leading-relaxed">{highlighted.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</p>
          </section>
          <section aria-labelledby="dc-found" aria-live="polite">
            <h2 id="dc-found" className="text-[1.3rem]">{T.found}</h2>
            {ordered.length ? (
              <dl className="mt-3 divide-y divide-line rounded-lg border border-line bg-paper">
                {ordered.map((m) => (
                  <div key={m.term.slug} className="px-4 py-3">
                    <dt className="font-medium text-heading">{m.term.term}{m.term.full ? <span className="ml-2 font-normal text-ink-mute">{m.term.full}</span> : null}</dt>
                    <dd className="mt-1 text-[15px] text-ink-soft">{m.term.short || ui.glossary.pendingDefinition} <Link href={`/learn/glossary#${m.term.slug}`} prefetch={false} className="text-heading underline underline-offset-4" aria-label={`${m.term.term} in the glossary`}>→</Link></dd>
                  </div>
                ))}
              </dl>
            ) : <p className="mt-3 text-ink-mute">{T.none}</p>}
          </section>
          {unknown.length ? (
            <section aria-labelledby="dc-unknown">
              <h2 id="dc-unknown" className="text-[1.3rem]">{T.unknownHeading}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {unknown.map((u) => (
                  <li key={u} className="flex items-center gap-2 rounded-pill border border-line-strong bg-paper pl-4 pr-1 text-[15px]">
                    <span className="font-medium">{u}</span>
                    <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(fill(T.suggestSubject, { term: u }))}`} className="inline-flex min-h-11 items-center rounded-pill px-3 text-heading underline underline-offset-4">{T.suggest}</a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
      {productHref ? (
        <p className="rounded-lg bg-cream-deep p-5 text-[15px] text-ink">
          {T.nextStep} <Link href={productHref} prefetch={false} className="font-medium text-heading underline underline-offset-4">{T.nextStepLink}</Link>
        </p>
      ) : null}
    </div>
  );
}
