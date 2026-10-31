import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { IconChecklist, IconHeart, IconLeaf, SampleLogSheet } from "@/components/illustrations/Paper";

const MARKS = [
  { Icon: IconLeaf, label: "Practical & parent-friendly" },
  { Icon: IconHeart, label: "Made by an RBT" },
  { Icon: IconChecklist, label: "Observe, don't diagnose" },
];

/**
 * Answers "who made this?" without a testimonial. The frame on the right is
 * the first log sheet from the Home ABC Printable, rendered as SVG. A real
 * testimonial carousel is added only when real ones exist.
 */
export function WhyItMatters() {
  return (
    <section aria-labelledby="why-h" className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-[var(--section-y)] sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
      <Reveal>
        <p className="kicker">Why it matters</p>
        <h2 id="why-h" className="mt-3">
          Small, useful things, <em>within reach</em>.
        </h2>
        <p className="mt-6 max-w-[52ch] text-[1.05rem] text-ink-soft">
          The Support Shelf is a small, growing library of printable tools for families whose kids are in ABA therapy. Each one does a single job well: organize, prepare, notice, and write down what happened.
        </p>
        <p className="mt-4 max-w-[52ch] text-[15.5px] text-ink-soft">
          Made by Kyle Stringham, a Registered Behavior Technician who works with kids in ABA therapy and sees what their parents carry. These tools record and organize; they don&apos;t make clinical claims, and nothing here tells you what to do about a behavior.{" "}
          <Link href="/about#founder" className="text-ink underline underline-offset-4 hover:text-clay-text">Read a note from the founder</Link>
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {MARKS.map(({ Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-[14.5px] text-ink">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-paper shadow-soft">
                <Icon className="h-6 w-6" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={80}>
        <figure className="relative mx-auto max-w-md">
          <div aria-hidden className="absolute -right-4 -top-6 text-sun">
            <svg viewBox="0 0 60 60" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M30 6v10M48 12l-7 7M54 30H44M12 12l7 7M6 30h10" />
            </svg>
          </div>
          <div className="paper-card rotate-[0.6deg] p-4 shadow-lift sm:p-5">
            <SampleLogSheet label="Sample page from the Home ABC Printable: a weekly log with columns for when, right before, what happened, and right after" className="h-auto w-full rounded-sm border border-line" />
          </div>
          <figcaption className="mt-4 text-center text-[15px] text-ink-soft">
            What your BCBA actually wants to see.
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
