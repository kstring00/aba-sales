import Link from "next/link";

/** Section seven. A resource maker who paid attention, not a clinical authority. */
export function Founder() {
  return (
    <section className="linen py-[var(--section-y)]" aria-labelledby="why-h">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="max-w-[52rem]">
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
          <p className="mt-8 inline-block rounded-lg bg-paper px-4 py-3 text-[15px] text-ink shadow-soft">Made by a Registered Behavior Technician (RBT).</p>
          <p className="mt-6"><Link href="/about" className="text-[15px] text-ink-soft underline underline-offset-4 hover:text-ink">More about the shelf and what it isn&apos;t</Link></p>
        </div>
      </div>
    </section>
  );
}
