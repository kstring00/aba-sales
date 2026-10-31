import Link from "next/link";
import { I } from "@/components/abc/icons";

/** Static explainer cards beside the tracker. Server-rendered; nothing to hydrate. */
export function FunctionExplainer() {
  return (
    <section className="rounded-xl bg-blush p-5 sm:p-6" aria-labelledby="fn-h">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-paper text-blush-deep"><I.book className="h-6 w-6" /></span>
        <div>
          <h2 id="fn-h" className="text-[1.25rem]">Understanding the function of behavior</h2>
          <p className="mt-1 text-[14px] text-ink-soft">Behaviors can serve a purpose. Learning to look for patterns can help you and your BCBA find supportive strategies.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <Stones className="mx-auto h-36 w-32 sm:mx-0" />
        <ul className="space-y-4">
          {[
            { Icon: I.heart, t: "Behaviors can serve a purpose", d: "They may be a way to get something, avoid something, or meet a sensory need." },
            { Icon: I.search, t: "Look for patterns", d: "Noticing what happens before and after can help you spot what the behavior might be communicating." },
            { Icon: I.people, t: "Discuss with your BCBA", d: "Your observations can help guide support strategies at home and in other settings." },
          ].map(({ Icon, t, d }) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-paper text-blush-deep"><Icon className="h-5 w-5" /></span>
              <div>
                <p className="text-[15px] font-medium text-ink">{t}</p>
                <p className="text-[13.5px] text-ink-soft">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <details className="group mt-5">
        <summary className="lift inline-flex min-h-10 cursor-pointer list-none items-center gap-1.5 rounded-pill border border-line-strong bg-paper px-4 text-[14px] font-medium text-ink hover:border-ink [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Read more</span><span className="hidden group-open:inline">Show less</span> <span aria-hidden>→</span>
        </summary>
        <div className="mt-4 space-y-3 text-[14px] text-ink-soft">
          <p>In ABA, the &ldquo;function&rdquo; of a behavior means what it tends to achieve for a child: getting attention, getting out of something, getting access to an item or activity, or meeting a sensory need. The same behavior can serve different purposes on different days.</p>
          <p>That is why the before and after columns matter more than the behavior column. Over a few weeks, patterns in what came right before and what happened right after give your BCBA something concrete to work from.</p>
          <p>Your guess in step 3 is recorded as your reflection. It helps the conversation; it isn&apos;t a conclusion. Your BCBA assesses function with their own tools.</p>
        </div>
      </details>
    </section>
  );
}

export function HowToUse() {
  return (
    <section className="paper-card p-5 sm:p-6" aria-labelledby="how-h">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky text-sky-deep"><I.bulb className="h-6 w-6" /></span>
          <h2 id="how-h" className="pt-1.5 text-[1.25rem]">How to use ABC data</h2>
        </div>
        <Link href="/shelf" className="lift hidden min-h-10 items-center gap-1.5 whitespace-nowrap rounded-pill border border-line-strong bg-paper px-3 text-[13.5px] font-medium text-ink hover:border-ink sm:inline-flex">
          View all resources <span aria-hidden>→</span>
        </Link>
      </div>
      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          ["Observe and record", "Jot down what happened before, during, and after. No need for perfection."],
          ["Look for patterns", "Over time, you may notice common patterns in what comes before and what helps."],
          ["Share and plan", "Bring your notes to your BCBA to support meaningful, collaborative planning."],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-3 sm:block">
            <span className="tnum flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-sky text-[14px] font-medium text-sky-deep sm:mb-2">{i + 1}</span>
            <div>
              <p className="text-[15px] font-medium text-ink">{t}</p>
              <p className="text-[13.5px] text-ink-soft">{d}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href="/shelf" className="mt-4 inline-flex min-h-11 items-center text-[14px] text-ink underline underline-offset-4 sm:hidden">View all resources →</Link>
    </section>
  );
}

/** Stacked stones with a sprig: a calm, abstract illustration. */
function Stones({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden focusable="false">
      <ellipse cx="60" cy="128" rx="40" ry="6" fill="var(--ink)" opacity=".08" />
      <path d="M30 118c0-16 14-26 32-26s34 10 34 26-16 10-34 10-32 6-32-10z" fill="var(--sun)" opacity=".9" />
      <path d="M38 94c-2-14 8-26 24-26s26 10 24 24-12 8-24 8-22 8-24-6z" fill="var(--sage)" />
      <path d="M46 68c-2-12 6-22 16-22s18 8 16 20-8 8-16 8-14 6-16-6z" fill="var(--sky-deep)" opacity=".75" />
      <path d="M86 44l6-10M96 50l10-6M92 36l2-12" stroke="var(--clay-bright)" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 126c2-18 8-30 20-40" stroke="var(--sage-deep)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {[[26, 110, -30], [30, 98, 30], [36, 90, -28]].map(([x, y, r], i) => (
        <path key={i} d="M0 0c6-6 14-6 18 0-4 5-12 5-18 0z" fill={i % 2 ? "var(--sage)" : "#a6c6b3"} transform={`translate(${x} ${y}) rotate(${r})`} />
      ))}
    </svg>
  );
}

