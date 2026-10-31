"use client";

import Link from "next/link";
import type { EntryWithBehavior } from "@/lib/abc/types";
import { computePatterns, MIN_FOR_PATTERNS } from "@/lib/abc/patterns";
import { fill, showItem, tracker } from "@/lib/content/data";

const T = tracker.insights;
const Q = tracker.questionsToBring;

/**
 * "What you're noticing": descriptive pattern cards from templates, each
 * with a plain count. Then a general lesson link and questions the parent
 * could bring to someone qualified. Never a cause, never advice.
 */
export function Insights({ entries, lessonVisible }: { entries: EntryWithBehavior[]; lessonVisible: boolean }) {
  if (entries.length < MIN_FOR_PATTERNS) return <p className="text-[15px] text-ink-mute">{T.tooFew}</p>;
  const p = computePatterns(entries);
  const of = (n: number) => fill(T.of, { n, total: p.total });
  const cards: { title: string; count: string }[] = [];
  if (p.before) cards.push({ title: fill(T.cards.before, { label: p.before.label }), count: of(p.before.count) });
  if (p.after) cards.push({ title: fill(T.cards.after, { label: p.after.label }), count: of(p.after.count) });
  if (p.time) cards.push({ title: fill(T.cards.time, { from: p.time.from, to: p.time.to }), count: of(p.time.count) });
  if (p.early) cards.push({ title: fill(T.cards.early, { label: p.early.label }), count: of(p.early.count) });
  if (p.earlyShare.withEarly > 0) cards.push({ title: T.cards.earlyShare, count: of(p.earlyShare.withEarly) });

  const questions: string[] = [];
  if (p.before) questions.push(fill(Q.before, { label: p.before.label }));
  if (p.after) questions.push(fill(Q.after, { label: p.after.label }));
  if (p.time) questions.push(fill(Q.time, { from: p.time.from, to: p.time.to }));
  if (p.early) questions.push(fill(Q.early, { label: p.early.label }));

  return (
    <div className="space-y-6">
      <ul className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.title} className="rounded-lg border border-line bg-cream p-4">
            <p className="text-[15.5px] text-ink">{c.title}</p>
            <p className="tnum mt-1 font-display text-[1.4rem] text-accent-text">{c.count}</p>
          </li>
        ))}
      </ul>
      <p className="text-[13px] text-ink-mute">{T.countNote}</p>
      {lessonVisible ? <Link href="/learn/why-behavior-happens" className="inline-flex min-h-11 items-center text-[15px] font-medium text-heading underline underline-offset-4">{T.lessonLink} →</Link> : null}
      {showItem(Q) && questions.length ? (
        <section aria-labelledby="ins-q" className="rounded-lg bg-sage-tint p-5">
          <h3 id="ins-q" className="text-[1.1rem]">{Q.heading}</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] text-ink-soft">
            {questions.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
