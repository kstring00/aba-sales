import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Logger } from "@/components/abc/Logger";

export const metadata: Metadata = {
  title: "Free ABC logger",
  description:
    "Record what happened, what came right before, and what came right after. Nothing leaves your phone. Export a clean PDF for your BCBA anytime.",
};

export default function AbcPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <div className="max-w-lg">
            <p className="text-[15px] text-ink-soft">
              <strong className="text-ink">Nothing leaves your phone.</strong> Entries live in this browser only. Export anytime, delete anytime.
            </p>
            <h1 className="mt-4 text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">The ABC logger</h1>
            <p className="mt-4 text-ink-soft">
              What you noticed, what happened right before, what happened right after. This records what happened. It never tells you what to do.
            </p>
            <div className="mt-10">
              <Logger />
            </div>
          </div>

          <aside className="lg:pt-24" aria-labelledby="sample-h">
            <h2 id="sample-h" className="font-sans text-[13px] font-medium uppercase tracking-wider text-ink-mute">What your BCBA receives</h2>
            <Link href="/sample-export.pdf" className="lift mt-3 block rounded-lg bg-paper p-3 shadow-lift" aria-label="Open the sample export PDF">
              <Image
                src="/sample-export-1.png"
                alt="Sample export page: a week of observations in a table with date, what was noticed, right before, right after, how long, intensity, and note"
                width={935}
                height={1210}
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="rounded-md"
              />
            </Link>
            <p className="mt-3 text-[14px] text-ink-mute">One page per week, counts at the end, no interpretation. Made with synthetic data.</p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
