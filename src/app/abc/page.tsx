import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Logger } from "@/components/abc/Logger";
import { getProduct } from "@/lib/shopify/catalog";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Free ABC logger",
  description:
    "Record what happened, what came right before, and what came right after. Nothing leaves your phone. Export a clean PDF for your BCBA anytime.",
};

/**
 * The tool page. First line is the privacy promise; the logger itself is the
 * page. The sample export sits beside it so the destination is visible.
 */
export default async function AbcPage() {
  // Only link to the paper version when the Storefront API actually has it.
  const printable = await getProduct("home-abc-printable");
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-6 sm:px-8 sm:pt-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="max-w-xl">
            <p className="text-[15px] text-ink-soft">
              <strong className="text-ink">Nothing leaves your phone.</strong> Entries live in this browser only. Export anytime, delete anytime.
            </p>
            <h1 className="mt-4 text-[clamp(2.2rem,1.6rem+2.2vw,3.6rem)]">The ABC logger</h1>
            <p className="mt-4 text-ink-soft">
              What you noticed, what happened right before, what happened right after. This records what happened. It never tells you what to do.
            </p>
            <div className="mt-10 rounded-[28px] bg-paper p-5 shadow-soft sm:p-8">
              <Logger />
            </div>
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start lg:pt-20" aria-labelledby="sample-h">
            <h2 id="sample-h" className="font-sans text-[13px] font-medium uppercase tracking-[0.18em] text-ink-mute">What your BCBA receives</h2>
            <Link href="/sample-export.pdf" className="lift mt-3 block rounded-lg bg-paper p-3 shadow-lift" aria-label="Open the sample export PDF">
              <Image
                src="/sample-export-1.png"
                alt="Sample export page: a week of observations in a table with date, what was noticed, right before, right after, how long, intensity, and note"
                width={935}
                height={1210}
                sizes="(min-width: 1024px) 36vw, 90vw"
                className="rounded-md"
              />
            </Link>
            <p className="mt-3 text-[14px] text-ink-mute">One page per week, counts at the end, no interpretation. This sample uses made-up data.</p>
            {printable ? (
              <div className="mt-8 rounded-lg bg-sage-tint p-5 text-[15px] text-ink">
                <p className="font-medium">A paper version exists too.</p>
                <p className="mt-1 text-ink-soft">For the fridge, the car, or a grandparent&apos;s house.</p>
                <Link href={`/products/${printable.handle}`} className="mt-2 inline-block underline underline-offset-4">{printable.title}</Link>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
