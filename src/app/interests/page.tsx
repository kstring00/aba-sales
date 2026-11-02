import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { InterestExplorer } from "@/components/interests/InterestExplorer";

export const metadata: Metadata = {
  title: "Interest Explorer",
  description: "Find hobbies and activities to try, starting from what your child already loves. Pick what they're drawn to and get ideas, sorted by kind of experience.",
};

/** The Interest Explorer: interactive on screen, printable, and a PDF for the fridge. Nothing leaves the device. */
export default function InterestsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <p className="kicker print:hidden">Interest Explorer</p>
        <h1 className="mt-3 max-w-[20ch] text-[clamp(2.2rem,1.6rem+2.2vw,3.6rem)]">
          Start from what they <em>already love</em>.
        </h1>
        <p className="mt-5 max-w-[58ch] text-[1.1rem] text-ink-soft print:hidden">
          Pick what your child is drawn to and get hobbies and activities to try, sorted by the kind of experience behind them. Every child is different, so these are ideas, not prescriptions. Your choices stay on this device.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px] print:hidden">
          <a href="/downloads/interest-explorer.pdf" download="Interest Explorer.pdf" className="inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4">Download the printable version (PDF)</a>
          <Link href="/learn/hobbies-to-try" className="inline-flex min-h-11 items-center text-ink-soft underline underline-offset-4">How to find a good fit</Link>
          <Link href="/events" className="inline-flex min-h-11 items-center text-ink-soft underline underline-offset-4">Sensory-friendly outings in Houston</Link>
        </div>
        <div className="mt-10">
          <InterestExplorer />
        </div>
        <p className="mt-12 max-w-[60ch] text-[13px] text-ink-mute print:hidden">
          These are general ideas to try, not treatment recommendations. If trying new things is usually distressing for your child, talk with their pediatrician or team.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
