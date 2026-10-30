import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Photo } from "@/components/site/Photo";
import { ASSETS } from "@/lib/assets";

/**
 * Section one. The headline and the primary action arrive first and alone;
 * the photograph is art-directed to leave them room.
 */
export function Welcome({ hasProducts }: { hasProducts: boolean }) {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 pb-[var(--section-y)] pt-6 sm:px-8 sm:pt-12" aria-labelledby="welcome-h">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="max-w-[34rem]">
          <h1 id="welcome-h" className="text-[clamp(2.4rem,1.6rem+3.2vw,4.6rem)] leading-[1.02]">
            You&apos;re carrying a lot. You shouldn&apos;t have to carry it <span className="display-italic">alone.</span>
          </h1>
          <p className="mt-7 max-w-[42ch] text-[1.1rem] text-ink-soft sm:text-[1.2rem]">
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
        <div className="lg:pl-6">
          <Photo asset={ASSETS.ordinaryMoment} priority sizes="(min-width: 1024px) 58vw, 100vw" className="hidden lg:block" />
          <Photo asset={ASSETS.ordinaryMoment} variant="mobile" priority sizes="100vw" className="lg:hidden" />
        </div>
      </div>
    </section>
  );
}
