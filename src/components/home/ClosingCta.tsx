import { buttonClass } from "@/components/ui/Button";
import { CornerLeaves, IconArrow, SunAndLeaves, Wave } from "@/components/illustrations/Paper";

export function ClosingCta() {
  return (
    <section aria-labelledby="close-h" className="relative overflow-hidden">
      <Wave className="block" />
      <div className="relative bg-aqua">
        <CornerLeaves side="left" className="pointer-events-none absolute -bottom-6 -left-6 h-40 w-40 opacity-80 sm:h-56 sm:w-56" />
        <CornerLeaves side="right" className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 opacity-80 sm:h-56 sm:w-56" />
        <SunAndLeaves className="pointer-events-none absolute right-0 top-2 hidden h-32 w-64 opacity-80 xl:block" />
        <div className="relative mx-auto max-w-3xl px-5 pb-24 pt-12 text-center sm:px-8 sm:pb-32 sm:pt-16">
          <h2 id="close-h">
            You don&apos;t have to figure everything <em>out alone</em>.
          </h2>
          <p className="mx-auto mt-5 max-w-[50ch] text-[1.02rem] text-ink-soft">
            Choose a shelf, take one tool, and use it this week. The rest can wait until it can&apos;t.
          </p>
          <a href="#shelves" className={buttonClass("primary", "lg", "mt-8")}>
            Find my shelf <IconArrow className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
