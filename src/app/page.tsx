import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LinkButton } from "@/components/ui/Button";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmailCapture } from "@/components/shop/EmailCapture";
import { getShelves } from "@/lib/shopify/catalog";

export const metadata: Metadata = {
  title: "The Support Shelf — thoughtfully made tools for ABA families",
  description:
    "Printable and editable downloads for parents and caregivers of kids in ABA therapy, plus a free ABC observation logger that keeps everything on your phone.",
};

export const revalidate = 300;

export default async function HomePage() {
  const shelves = await getShelves();
  const featured = shelves.flatMap((s) => s.products).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero: what, for whom, one CTA — readable in five seconds. */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-[var(--section-y)] pt-10 sm:px-8 sm:pt-20">
          <p className="text-[15px] uppercase tracking-wider text-ink-mute">For parents and caregivers of kids in ABA therapy</p>
          <h1 className="mt-4 max-w-[22ch]">
            Thoughtfully made tools for the people who <span className="display-italic">care.</span>
          </h1>
          <p className="mt-7 max-w-[46ch] text-[1.15rem] text-ink-soft sm:text-[1.3rem]">
            Printable routines, welcome packets, and observation sheets, designed by someone who has sat on the clinic floor and in the hallway with parents.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LinkButton href="/shelf" variant="primary" size="lg">Browse the shelf</LinkButton>
            <Link href="/abc" className="inline-flex min-h-12 items-center px-2 text-[16px] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
              Or try the free ABC logger
            </Link>
          </div>
        </section>

        {/* The shelf motif: products sit on a thin rule. */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-[var(--section-y)] sm:px-8" aria-labelledby="featured-heading">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 id="featured-heading">On the shelf</h2>
            <Link href="/shelf" className="text-[15px] text-ink-soft hover:text-ink">See everything</Link>
          </div>
          {featured.length > 0 ? (
            <div className="shelf-edge pb-12">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i === 0} />
                ))}
              </div>
            </div>
          ) : (
            <div className="shelf-edge pb-12">
              <div className="rounded-lg bg-paper p-8 shadow-shelf">
                <h3>The first downloads are being finished.</h3>
                <p className="mt-3 max-w-[48ch] text-ink-soft">Leave your email and we&apos;ll write once when they&apos;re up.</p>
                <div className="mt-6 max-w-md"><EmailCapture source="home" /></div>
              </div>
            </div>
          )}
        </section>

        {/* The free tool, and the export is the pitch. */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-[var(--section-y)] sm:px-8" aria-labelledby="abc-heading">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="text-[15px] uppercase tracking-wider text-ink-mute">Free, no account</p>
              <h2 id="abc-heading" className="mt-3">Note what happened. Hand it over clean.</h2>
              <p className="mt-5 text-ink-soft">
                The ABC logger records what you noticed, what happened right before, and what happened right after. Three taps.
                Everything stays in your browser. When you&apos;re ready, export a tidy PDF for your BCBA or pediatrician.
              </p>
              <p className="mt-4 text-ink-soft">It records what happened. It never tells you what to do.</p>
              <div className="mt-7"><LinkButton href="/abc" variant="secondary" size="lg">Open the ABC logger</LinkButton></div>
            </div>
            <Link href="/sample-export.pdf" className="lift block rounded-lg bg-paper p-3 shadow-lift" aria-label="Open the sample export PDF">
              <Image
                src="/sample-export-1.png"
                alt="Sample export: one week of observations in a clean table with date, what was noticed, right before, right after, how long, intensity, and note"
                width={935}
                height={1210}
                sizes="(min-width: 768px) 45vw, 90vw"
                className="rounded-md"
              />
            </Link>
          </div>
        </section>

        {/* Credibility, plainly. */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-[var(--section-y)] sm:px-8" aria-labelledby="who-heading">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 id="who-heading">Who makes this</h2>
              <p className="mt-5 text-ink-soft">
                <strong className="text-ink">I&apos;m a Registered Behavior Technician.</strong> I&apos;ve spent three years on the floor with
                kids and in the hallway with their parents. These are the materials I wished those families and clinics had.
              </p>
              <p className="mt-4 text-[14px] text-ink-mute">Clinical review line reserved: reviewed by a BCBA (name to come).</p>
              <div className="mt-6"><Link href="/about" className="text-[15px] text-ink-soft underline underline-offset-4 hover:text-ink">More about the shelf</Link></div>
            </div>
            <div className="rounded-lg bg-paper p-6 shadow-soft">
              <h3>Stay in the loop</h3>
              <p className="mt-2 text-[15px] text-ink-soft">New downloads, a few times a year. No streaks, no nudges.</p>
              <div className="mt-5"><EmailCapture source="home-footer" /></div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
