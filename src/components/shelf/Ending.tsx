import { LinkButton } from "@/components/ui/Button";
import { Ribbon, Sprig } from "@/components/illustrations/Shapes";

/** Section seven. A thoughtful close on soft blue-green, with one clear next step. */
export function Ending({ hasProducts }: { hasProducts: boolean }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky to-glass py-[var(--section-y)]" aria-labelledby="end-h">
      <Ribbon className="pointer-events-none absolute inset-x-0 top-6 h-28 w-full opacity-70" />
      <Sprig className="pointer-events-none absolute bottom-0 left-6 hidden w-20 md:block" />
      <div className="relative mx-auto max-w-[46rem] px-5 text-center sm:px-8">
        <h2 id="end-h" className="text-[clamp(2.1rem,1.5rem+2.6vw,3.8rem)]">You don&apos;t have to figure everything out <span className="display-italic">alone.</span></h2>
        <p className="mx-auto mt-6 max-w-[44ch] text-ink-soft">Start with one useful thing. Come back when you need another.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href={hasProducts ? "#shelf" : "/abc"} variant="primary" size="lg">{hasProducts ? "Browse the shelf" : "Try the free logger"}</LinkButton>
          {hasProducts ? <LinkButton href="/abc" variant="secondary" size="lg">Try the free logger</LinkButton> : null}
        </div>
      </div>
    </section>
  );
}
