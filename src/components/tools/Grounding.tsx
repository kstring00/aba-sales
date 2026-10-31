"use client";

import { useEffect, useRef, useState } from "react";
import { ui } from "@/lib/content/data";

const T = ui.tools.ground;
const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/**
 * 5-4-3-2-1 grounding, one step per screen. Optional tap-to-count dots.
 * Focus moves to each new step's heading so screen readers hear it; the
 * transition is opacity/transform only and is skipped under reduced motion.
 */
export function Grounding({ together = false }: { together?: boolean }) {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<number[]>([0, 0, 0, 0, 0]);
  const heading = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  const done = step >= T.steps.length;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    heading.current?.focus();
  }, [step]);

  if (done) {
    return (
      <div className="tool-step flex flex-col items-center gap-5 text-center" key="done">
        <h2 ref={heading} tabIndex={-1} className={`outline-none ${together ? "text-[clamp(2.4rem,9vw,3.6rem)]" : "text-[clamp(2rem,7vw,3rem)]"}`}>{T.doneTitle}</h2>
        <p className="max-w-[36ch] text-[1.1rem] text-ink-soft">{T.doneText}</p>
        <button type="button" className="sd-btn primary" onClick={() => { setFound([0, 0, 0, 0, 0]); setStep(0); }}>{T.again}</button>
      </div>
    );
  }

  const s = T.steps[step];
  const n = found[step];
  return (
    <div className="tool-step flex flex-col items-center gap-6 text-center" key={step}>
      <p className="text-[14px] uppercase tracking-[0.18em] text-ink-mute">{fill(T.stepOf, { n: step + 1 })}</p>
      <h2 ref={heading} tabIndex={-1} className="outline-none">
        <span className={`block font-display tnum text-accent-text ${together ? "text-[clamp(5rem,26vw,9rem)]" : "text-[clamp(4rem,20vw,7rem)]"} leading-none`}>{s.count}</span>
        <span className={`mt-2 block ${together ? "text-[clamp(1.8rem,7vw,2.6rem)]" : "text-[clamp(1.5rem,5vw,2.2rem)]"}`}>{together ? s.together : s.text}</span>
      </h2>
      <div className="flex flex-wrap justify-center gap-3" role="group" aria-label={fill(T.counted, { n, total: s.count })}>
        {Array.from({ length: s.count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={i < n}
            aria-label={`${T.found} ${i + 1}`}
            onClick={() => setFound((f) => f.map((v, k) => (k === step ? (i < v ? i : i + 1) : v)))}
            className={`rounded-pill border-2 transition-colors ${together ? "h-16 w-16" : "h-12 w-12"} ${i < n ? "border-accent-text bg-accent-text" : "border-line-strong bg-paper"}`}
          />
        ))}
      </div>
      <p className="tnum text-[15px] text-ink-soft" aria-live="polite">{fill(T.counted, { n, total: s.count })}</p>
      <div className="flex gap-3">
        {step > 0 ? <button type="button" className="sd-btn" onClick={() => setStep(step - 1)}>{T.back}</button> : null}
        <button type="button" className={`sd-btn primary ${together ? "!min-h-14 !text-[18px]" : ""}`} onClick={() => setStep(step + 1)}>{T.next}</button>
      </div>
    </div>
  );
}
