import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

/**
 * Section one. Kicker, headline, and the primary action arrive first and
 * alone. Typography carries the composition; no imagery ships until real
 * photography exists.
 */
export function Welcome({ hasProducts }: { hasProducts: boolean }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pb-[var(--section-y)] pt-8 sm:px-8 sm:pt-16" aria-labelledby="welcome-h">
      <div className="max-w-[46rem]">
        <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute sm:text-[14px]">Printable tools for parents of kids in ABA therapy.</p>
        <h1 id="welcome-h" className="mt-5 text-[clamp(2.4rem,1.6rem+3.4vw,5rem)] leading-[1.02]">
          You&apos;re carrying a lot. You shouldn&apos;t have to carry it <span className="display-italic">alone.</span>
        </h1>
        <p className="mt-7 max-w-[44ch] text-[1.1rem] text-ink-soft sm:text-[1.25rem]">
          Between appointments, everyday routines, paperwork, and the moments no one else sees, there&apos;s a lot to navigate.
          The Support Shelf brings together thoughtfully made tools to help you feel a little more prepared, organized, and supported.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <LinkButton href="#find" variant="primary" size="lg">Find something that helps</LinkButton>
          <Link href="/abc" className="inline-flex min-h-12 items-center px-2 text-[16px] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            Try the free ABC logger
          </Link>
        </div>
        <p className="mt-5 text-[14px] text-ink-mute">
          {hasProducts ? "Free tools and a small shelf of downloads. No account needed." : "The free logger is ready now. The shelf is being stocked."}
        </p>
      </div>
    </section>
  );
}
