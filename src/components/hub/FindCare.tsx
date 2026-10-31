"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Resource } from "@/lib/content/data";
import { ui } from "@/lib/content/data";
import { AGES, COVERAGES, STATES, careBlocks, careResources, type Answers } from "@/lib/content/findCare";

const T = ui.findCare;

/**
 * Three questions; the answers live only in the address (read on the server,
 * written with history.replaceState, so no request fires). The card is assembled from server-rendered blocks
 * and the visible resources. No provider is named; no location is read.
 */
export function FindCare({ initial, blocks, resources, waitlistHref, notAffiliated }: {
  initial: Partial<Answers>;
  blocks: Record<string, ReactNode>;
  resources: (Resource & { needsVerify: boolean })[];
  waitlistHref: string | null;
  notAffiliated: string;
}) {
  // Answers start from the server-read address (no shift on load) and are written back with replaceState (no request).
  const [a, setA] = useState<Partial<Answers>>(initial);
  const set = (k: keyof Answers, v: string) => {
    const nextA = { ...a, [k]: v };
    setA(nextA);
    const next = new URLSearchParams(window.location.search);
    next.set(k, v);
    window.history.replaceState(null, "", `?${next.toString()}`);
  };
  const complete = a.age && a.coverage && a.state;
  const list = complete ? careResources(a as Answers, resources) : [];

  const group = (k: keyof Answers, legend: string, options: readonly string[], labels: Record<string, string>) => (
    <fieldset className="mt-6">
      <legend className="font-display text-[1.25rem] text-ink">{legend}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = a[k] === o;
          return (
            <label key={o} className={`inline-flex min-h-12 cursor-pointer items-center rounded-pill border px-5 text-[16px] ${on ? "border-sage-deep bg-sage-deep text-paper" : "border-line-strong bg-paper text-ink"}`}>
              <input type="radio" name={k} value={o} checked={on} onChange={() => set(k, o)} className="sr-only" />
              {labels[o]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <div>
      {group("age", T.age, AGES, T.ages)}
      {group("coverage", T.coverage, COVERAGES, T.coverages)}
      {group("state", T.state, STATES, T.states)}
      <p className="mt-4 text-[13.5px] text-ink-mute">{T.share} {T.noNames}</p>

      <section aria-labelledby="fc-result" aria-live="polite" className="mt-10">
        <h2 id="fc-result" className="text-[1.8rem]">{T.resultHeading}</h2>
        {!complete ? <p className="mt-3 text-ink-mute">{T.answerAll}</p> : (
          <div className="mt-4 space-y-8">
            {careBlocks(a as Answers).map((h) => (
              <section key={h} className="paper-card p-5">
                <h3 className="text-[1.25rem]">{h}</h3>
                <div className="mt-2">{blocks[h]}</div>
                {h === "What a waitlist usually involves" && waitlistHref ? (
                  <Link href={waitlistHref} prefetch={false} className="mt-3 inline-flex min-h-11 items-center font-medium text-heading underline underline-offset-4">{T.waitlistLink} →</Link>
                ) : null}
              </section>
            ))}
            {list.length ? (
              <section aria-labelledby="fc-res" className="space-y-3">
                <h3 id="fc-res" className="text-[1.25rem]">{T.resourcesHeading}</h3>
                <ul className="space-y-3">
                  {list.map((r) => (
                    <li key={r.id} className={`rounded-lg border p-4 ${r.needsVerify ? "border-dashed border-honey bg-honey-soft" : "border-line bg-paper"}`}>
                      <p className="font-medium text-heading">{r.title}</p>
                      {r.needsVerify ? <p className="mt-1 text-[13.5px] text-ink">{T.verifyWarning}</p> : (
                        <>
                          <p className="mt-1 text-[15px] text-ink-soft">{r.whatFor}</p>
                          {r.url ? <a href={r.url.href} target="_blank" rel="noopener" className="mt-2 inline-flex min-h-11 items-center text-heading underline underline-offset-4">{r.url.label}</a> : null}
                          {r.action ? <a href={r.action.href} className="mt-2 ml-4 inline-flex min-h-11 items-center text-heading underline underline-offset-4">{r.action.label}</a> : null}
                          <p className="mt-1 text-[13px] text-ink-mute">{notAffiliated}</p>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {a.state === "other" ? <p className="text-[14px] text-ink-mute">{T.outsideNote}</p> : null}
          </div>
        )}
      </section>
    </div>
  );
}
