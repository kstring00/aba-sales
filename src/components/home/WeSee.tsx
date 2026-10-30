import { Reveal } from "@/components/site/Reveal";

const LINES = [
  "The appointments you prepare for.",
  "The questions you remember after you've left.",
  "The forms you fill out.",
  "The routines you keep trying to make work.",
  "The moments you're proud of.",
  "The days you wish someone could make one thing easier.",
];

/** Section two. Recognition, not a list of hardships: six observations, one idea. */
export function WeSee() {
  return (
    <section className="linen py-[var(--section-y)]" aria-labelledby="wesee-h">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="max-w-[44rem]">
          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">We see the work you do</p>
            <h2 id="wesee-h" className="mt-4 text-[clamp(2rem,1.4rem+2.2vw,3.4rem)]">Most of it happens where no one is watching.</h2>
            <ol className="mt-10 space-y-5">
              {LINES.map((line, i) => (
                <Reveal as="li" key={line} delay={i * 60} className="flex items-baseline gap-4 text-[1.2rem] text-ink-soft sm:text-[1.35rem]">
                  <span aria-hidden className="h-px w-6 shrink-0 translate-y-[-0.35em] bg-clay-warm" />
                  <span className="font-display">{line}</span>
                </Reveal>
              ))}
            </ol>
            <Reveal className="mt-12">
              <p className="text-[clamp(1.5rem,1.2rem+1.2vw,2.2rem)] leading-tight text-ink">
                You deserve support <span className="display-italic">through all of it.</span>
              </p>
              <p className="mt-4 max-w-[48ch] text-[15px] text-ink-mute">
                Not every family carries the same things. This shelf is for whichever of them is yours.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
