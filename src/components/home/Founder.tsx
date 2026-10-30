import Link from "next/link";
import { Photo } from "@/components/site/Photo";
import { ASSETS } from "@/lib/assets";

/** Section seven. A resource maker who paid attention, not a clinical authority. */
export function Founder() {
  return (
    <section className="linen py-[var(--section-y)]" aria-labelledby="why-h">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <Photo asset={ASSETS.founder} sizes="(min-width: 1024px) 30vw, 100vw" className="max-w-sm" />
        <div>
          <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">Why this shelf exists</p>
          <h2 id="why-h" className="mt-4 text-[clamp(2rem,1.4rem+2.2vw,3.4rem)]">Most of the work happens outside the therapy room.</h2>
          <div className="mt-6 max-w-[58ch] space-y-4 text-ink-soft">
            <p>
              I&apos;ve seen how much of it there is. The questions, the paperwork, the routines, and everything families are trying to hold together between appointments.
              I started The Support Shelf because I wanted to make practical resources that feel clear, thoughtful, and genuinely useful.
            </p>
            <p>
              I&apos;m a Registered Behavior Technician. That means I&apos;ve worked directly with children in ABA programs under the supervision of a Board Certified Behavior Analyst,
              and spent a lot of time in hallways and doorways with their parents. It doesn&apos;t make me a clinical authority, and nothing here is clinical advice.
              It makes me someone who noticed what would have helped, and decided to make it well.
            </p>
          </div>
          <dl className="mt-8 grid gap-4 text-[15px] sm:grid-cols-2">
            <div className="rounded-lg bg-paper p-4 shadow-soft">
              <dt className="text-[12px] uppercase tracking-wider text-ink-mute">Made by</dt>
              <dd className="mt-1 text-ink">A Registered Behavior Technician (RBT)</dd>
            </div>
            <div className="rounded-lg bg-paper p-4 shadow-soft">
              <dt className="text-[12px] uppercase tracking-wider text-ink-mute">Clinical review</dt>
              <dd className="mt-1 text-ink">Pending. We&apos;ll name the reviewer here when a review is complete, not before.</dd>
            </div>
          </dl>
          <p className="mt-6"><Link href="/about" className="text-[15px] text-ink-soft underline underline-offset-4 hover:text-ink">More about the shelf and what it isn&apos;t</Link></p>
        </div>
      </div>
    </section>
  );
}
