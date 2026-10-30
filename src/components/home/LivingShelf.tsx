import Link from "next/link";
import { PaperObject } from "@/components/shop/PaperObject";
import { EmailCapture } from "@/components/shop/EmailCapture";
import { LinkButton } from "@/components/ui/Button";
import type { ProductSummary } from "@/lib/shopify/types";

/**
 * Section four, and Interaction One. Real products as paper objects standing
 * on an oak shelf. Hover or focus lifts one forward; selecting opens it.
 * On phones the shelf scrolls sideways with snap points. Every object is a
 * plain link, so nothing depends on the effect.
 */
export function LivingShelf({ products }: { products: ProductSummary[] }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-[var(--section-y)] sm:px-8" aria-labelledby="shelf-h">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[36rem]">
          <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">The Support Shelf</p>
          <h2 id="shelf-h" className="mt-4 text-[clamp(2rem,1.4rem+2.2vw,3.4rem)]">Small, useful things, within reach.</h2>
          <p className="mt-4 text-ink-soft">Printable and editable downloads, made like stationery you&apos;d want to keep. Pick one up to see what&apos;s inside.</p>
        </div>
        {products.length > 0 ? <Link href="/shelf" className="text-[15px] text-ink-soft underline-offset-4 hover:text-ink hover:underline">See the whole shelf</Link> : null}
      </div>

      {products.length === 0 ? (
        <div className="mt-10 rounded-lg bg-paper p-8 shadow-soft">
          <h3>The first downloads are being finished.</h3>
          <p className="mt-3 max-w-[48ch] text-ink-soft">The free ABC logger is ready now. Leave your email and we&apos;ll write once when the shelf is stocked.</p>
          <div className="mt-6 max-w-md"><EmailCapture source="home-shelf" /></div>
        </div>
      ) : (
        <div className="relative mt-12">
          {/* Objects */}
          <ul className="scroll-quiet relative z-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-2 pb-6 pt-6 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4" aria-label="Downloads on the shelf">
            {products.slice(0, 4).map((p, i) => (
              <li key={p.id} className="w-[72vw] shrink-0 snap-center sm:w-auto">
                <PaperObject product={p} index={i} />
              </li>
            ))}
          </ul>
          {/* The board */}
          <div aria-hidden className="relative -mt-2 h-4 rounded-[3px] bg-wood shadow-shelf">
            <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[3px] bg-white/25" />
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-wood-deep/60" />
          </div>
          <div aria-hidden className="mx-auto h-10 w-[92%] bg-gradient-to-b from-ink/10 to-transparent blur-md" />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-ink-mute">
        <span>Delivered by email in under a minute.</span>
        <span>You customize everything.</span>
        <span>No treatment recommendations.</span>
      </div>
      {products.length > 0 ? <div className="mt-8"><LinkButton href="/shelf" variant="secondary" size="lg">Browse the shelf</LinkButton></div> : null}
    </section>
  );
}
