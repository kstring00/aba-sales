"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { LinkButton } from "@/components/ui/Button";
import { ANTECEDENTS, CONSEQUENCES, antecedentLabel, consequenceLabel } from "@/lib/observation";
import type { AntecedentCode, ConsequenceCode } from "@/lib/abc/types";

const DEMO_LABELS = ["Covering ears", "Dropping to floor", "Running off"];

/**
 * Section five. The real input flow with clearly labeled synthetic data.
 * Nothing is saved: this is a demonstration, and the page says so.
 */
export function AbcDemo() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [behavior, setBehavior] = useState<string | null>(null);
  const [before, setBefore] = useState<AntecedentCode | null>(null);
  const [after, setAfter] = useState<ConsequenceCode | null>(null);
  const reset = () => { setStep(0); setBehavior(null); setBefore(null); setAfter(null); };
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date());

  return (
    <section className="linen py-[var(--section-y)]" aria-labelledby="abc-h">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-20">
        <div>
          <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">Real support, in real life</p>
          <h2 id="abc-h" className="mt-4 text-[clamp(2rem,1.4rem+2.2vw,3.4rem)]">A simple place to record what you noticed.</h2>
          <p className="mt-5 text-ink-soft">
            The ABC logger is free and needs no account. You write down what happened, what came right before, and what came
            right after. It stays in your browser. When you&apos;re ready, it makes a clean PDF for your child&apos;s BCBA or pediatrician.
          </p>
          <p className="mt-4 text-ink-soft">It records observations. It doesn&apos;t interpret them, and it never recommends treatment.</p>
          <ul className="mt-6 space-y-2 text-[15px] text-ink-soft">
            <li className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-sage-deep" />Nothing leaves your phone unless you email yourself an export.</li>
            <li className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-sage-deep" />Your own words for what you see. No labels put on your child.</li>
            <li className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-sage-deep" />One page per week, counts at the end, no conclusions.</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/abc" variant="primary" size="lg">Open the ABC logger</LinkButton>
            <Link href="/sample-export.pdf" className="inline-flex min-h-12 items-center px-2 text-[15px] text-ink-soft underline-offset-4 hover:text-ink hover:underline">See a sample export (PDF)</Link>
          </div>
        </div>

        <div className="lg:pt-4">
          <div className="mx-auto max-w-sm rounded-[28px] bg-paper p-5 shadow-lift" aria-label="Interactive demonstration of the ABC logger using sample data">
            <div className="flex items-center justify-between">
              <span className="rounded-pill bg-cream-deep px-3 py-1 text-[12px] uppercase tracking-wider text-ink-mute">Demo · sample data</span>
              <span className="tnum text-[12px] text-ink-mute">{time}</span>
            </div>
            <div className="mt-4 min-h-[17rem]">
              {step === 0 ? (
                <>
                  <h3 className="text-[1.25rem]">What did you notice?</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {DEMO_LABELS.map((l) => <Chip key={l} onClick={() => { setBehavior(l); setStep(1); }}>{l}</Chip>)}
                  </div>
                  <p className="mt-4 text-[13px] text-ink-mute">In the real logger these are your own labels.</p>
                </>
              ) : null}
              {step === 1 ? (
                <>
                  <h3 className="text-[1.25rem]">Right before?</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ANTECEDENTS.filter((a) => a.code !== "something_else").map((a) => <Chip key={a.code} onClick={() => { setBefore(a.code); setStep(2); }}>{a.label}</Chip>)}
                  </div>
                </>
              ) : null}
              {step === 2 ? (
                <>
                  <h3 className="text-[1.25rem]">Right after?</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {CONSEQUENCES.filter((c) => c.code !== "something_else").map((c) => <Chip key={c.code} onClick={() => { setAfter(c.code); setStep(3); }}>{c.label}</Chip>)}
                  </div>
                </>
              ) : null}
              {step === 3 ? (
                <>
                  <h3 className="text-[1.25rem]">That&apos;s an entry.</h3>
                  <dl className="mt-4 divide-y divide-line rounded-md bg-cream text-[15px]">
                    <div className="px-4 py-3"><dt className="text-[12px] uppercase tracking-wider text-ink-mute">Noticed</dt><dd>{behavior}</dd></div>
                    <div className="px-4 py-3"><dt className="text-[12px] uppercase tracking-wider text-ink-mute">Right before</dt><dd>{antecedentLabel(before)}</dd></div>
                    <div className="px-4 py-3"><dt className="text-[12px] uppercase tracking-wider text-ink-mute">Right after</dt><dd>{consequenceLabel(after)}</dd></div>
                  </dl>
                  <p className="mt-4 text-[13px] text-ink-mute">Three taps. In the logger you can add how long, intensity, a note, and the exact time. Nothing from this demo was saved.</p>
                  <button type="button" onClick={reset} className="mt-3 min-h-11 text-[15px] text-ink underline underline-offset-4">Try again</button>
                </>
              ) : null}
            </div>
            <ol className="mt-2 flex gap-1.5" aria-label={`Demo step ${Math.min(step + 1, 4)} of 4`}>
              {[0, 1, 2, 3].map((i) => <li key={i} aria-hidden className={`h-1 flex-1 rounded-pill ${i <= step ? "bg-sage" : "bg-line"}`} />)}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
