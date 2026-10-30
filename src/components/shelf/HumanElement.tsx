import Link from "next/link";
import { Sun, Sprig, Folder, Sheets } from "@/components/illustrations/Shapes";

/**
 * Section five. Sincere, uplifting, and illustrated: no photograph ships
 * until a licensed one exists (brief in docs/ASSETS.md), and no testimonials.
 */
export function HumanElement() {
  return (
    <section className="relative overflow-hidden bg-white py-[var(--section-y)]" aria-labelledby="human-h">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="relative mx-auto aspect-square w-full max-w-[26rem]" aria-hidden="true">
          <div className="absolute inset-0 rounded-[46%_54%_50%_50%/55%_45%_55%_45%] bg-sun/70" />
          <Sun className="absolute -left-10 -top-10 w-48 opacity-80" />
          <Folder tone="turq" className="absolute left-[8%] top-[30%] w-[52%] drop-shadow-[0_20px_26px_rgba(21,58,66,0.25)]" />
          <Sheets className="absolute right-[6%] top-[12%] w-[44%] drop-shadow-[0_20px_26px_rgba(21,58,66,0.25)]" />
          <Sprig className="absolute bottom-[4%] right-[14%] w-16" />
        </div>
        <div className="max-w-[36rem]">
          <p className="text-[13px] uppercase tracking-[0.2em] text-coral-text">The human element</p>
          <h2 id="human-h" className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.6rem)]">Behind every note, appointment, and plan is someone who <span className="display-italic">cares.</span></h2>
          <div className="mt-6 space-y-4 text-ink-soft">
            <p>Most of this work happens where no one is watching: the questions remembered in the car, the forms at the kitchen table, the routine tried one more way.</p>
            <p>We can&apos;t take that work away. We can make pieces of it clearer, so more of your energy goes where you want it.</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#shelf" className="inline-flex min-h-12 items-center rounded-pill bg-sky px-5 text-[15px] font-medium text-ink hover:bg-glass">See the tools</Link>
            <Link href="/abc" className="inline-flex min-h-12 items-center rounded-pill px-5 text-[15px] text-ink-soft underline-offset-4 hover:underline">Start with the free logger</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
