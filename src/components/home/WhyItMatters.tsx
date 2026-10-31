import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { IconChecklist, IconHeart, IconLeaf, SampleLogSheet } from "@/components/illustrations/Paper";
import { D } from "@/components/home/drawer-icons";

const POINTS = [
  { Icon: IconLeaf, t: "Practical and parent-friendly", d: "Printables you can use the same day, written in plain language." },
  { Icon: IconHeart, t: "Made by an RBT", d: "Kyle Stringham, a Registered Behavior Technician who sees what parents carry." },
  { Icon: IconChecklist, t: "Observe, don't diagnose", d: "These tools record and organize. Your BCBA writes the plan." },
];

/**
 * An editorial spread: the case for small tools on the left, the free ABC
 * Tracker's printed sheet on a desk on the right. The sheet is the product
 * preview; it is a real render of the printable's first page.
 */
export function WhyItMatters({ printableHref }: { printableHref?: string | null }) {
  return (
    <section aria-labelledby="why-h" className="grid w-full items-center gap-10 pb-14 pt-6 sm:pb-20 sm:pt-10 lg:grid-cols-[minmax(0,11fr)_minmax(0,10fr)] lg:gap-16">
      <Reveal>
        <p className="sd-eyebrow">Why it matters</p>
        <h2 id="why-h" className="text-[clamp(2rem,1.5rem+1.8vw,3.4rem)] text-heading">
          Small, useful things, <em>within reach</em>.
        </h2>
        <p className="mt-5 max-w-[52ch] text-[1.05rem] leading-relaxed text-ink-soft">
          The Support Shelf is a small, growing library of printable tools for families whose kids are in ABA therapy. Each one does a single job well: organize, prepare, notice, and write down what happened.
        </p>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {POINTS.map(({ Icon, t, d }) => (
            <li key={t} className="flex gap-4 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-sage-tint text-accent-text">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[16px] font-medium text-heading">{t}</p>
                <p className="text-[14.5px] text-ink-soft">{d}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/about#founder" className="mt-6 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-heading underline decoration-accent decoration-2 underline-offset-[6px] hover:text-accent-text">
          Read a note from the founder <D.arrow className="h-4 w-4" />
        </Link>
      </Reveal>

      <Reveal delay={80}>
        <figure className="desk">
          <div className="desk-stack" aria-hidden />
          <div className="desk-sheet">
            <SampleLogSheet label="Sample page from the Home ABC Printable: a weekly log with columns for when, right before, what happened, and right after" className="h-auto w-full rounded-[4px]" />
          </div>
          <span className="desk-clip" aria-hidden />
          <figcaption className="desk-caption">
            <span>
              <b>What your BCBA actually wants to see.</b> The free ABC Tracker exports a sheet like this, one page per week.
              {printableHref ? (
                <>
                  {" "}Prefer paper? <Link href={printableHref} className="text-heading underline underline-offset-4">Home ABC Printable</Link> is the same sheet, free.
                </>
              ) : null}
            </span>
            <Link href="/abc" className="sd-btn">Open ABC Tracker <D.arrow /></Link>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
