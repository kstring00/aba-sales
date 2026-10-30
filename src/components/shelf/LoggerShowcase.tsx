import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { Notebook, Sprig } from "@/components/illustrations/Shapes";

/**
 * Section four. The real tool, shown as it is: a screenshot of the actual
 * logger interface with a synthetic nickname, inside a phone frame.
 */
export function LoggerShowcase() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#e6f4ea] via-glass to-sky py-[var(--section-y)]" aria-labelledby="logger-h">
      <Notebook tone="leaf" className="pointer-events-none absolute -left-16 top-10 hidden w-72 opacity-50 lg:block" />
      <Sprig className="pointer-events-none absolute bottom-6 right-8 hidden w-20 lg:block" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
        <div>
          <p className="text-[13px] uppercase tracking-[0.2em] text-leaf-text">Free · no account · stays on your phone</p>
          <h2 id="logger-h" className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.6rem)]">One less thing to keep in your <span className="display-italic">head.</span></h2>
          <p className="mt-5 text-ink-soft">
            The ABC logger is a simple place to record what you noticed, what happened right before, and what happened right after, so you can
            bring clear notes to the people on your child&apos;s team. Three taps. Nothing leaves your phone unless you email yourself the export.
          </p>
          <ul className="mt-6 grid gap-3 text-[15px] text-ink-soft sm:grid-cols-2">
            {["Your own words for what you see", "Editable time, optional notes", "A clean PDF your BCBA can read in a minute", "Records only. Never advice."].map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-xl bg-white/70 px-4 py-3"><span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-pill bg-leaf" />{t}</li>
            ))}
          </ul>
          <div className="mt-8"><LinkButton href="/abc" variant="primary" size="lg">Open the free ABC Logger</LinkButton></div>
        </div>
        <div className="relative mx-auto w-full max-w-[22rem]">
          <div aria-hidden className="absolute -inset-6 rounded-[48px] bg-white/50 blur-xl" />
          <div className="relative rounded-[40px] border-[10px] border-ink bg-ink p-1 shadow-lift">
            <div className="overflow-hidden rounded-[30px] bg-white">
              <Image src="/screens/abc-logger.png" alt="The ABC logger showing a sample nickname, the Log what happened button, and three example entries listed by time." width={1041} height={1599} sizes="(min-width: 1024px) 22rem, 80vw" className="w-full" />
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] text-ink-mute">Real interface, sample data.</p>
        </div>
      </div>
    </section>
  );
}
