import Link from "next/link";
import Image from "next/image";
import { Binder, Blobs, Notebook, Sheets } from "@/components/illustrations/Shapes";
import { EmailCapture } from "@/components/shop/EmailCapture";
import { metaFor } from "@/lib/resources";
import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";

const TONES = ["ocean", "coral", "teal", "leaf"] as const;

/**
 * Section three, the centerpiece. Real products as tangible objects standing
 * on a sea-glass shelf: binders with tabs, notebooks, sheets. Hover and focus
 * bring one forward; everything is a plain link and reads fine as a grid.
 */
export function DigitalShelf({ products }: { products: ProductSummary[] }) {
  return (
    <section id="shelf" className="relative scroll-mt-20 overflow-hidden bg-glass py-[var(--section-y)]" aria-labelledby="dshelf-h">
      <Blobs className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[38rem]">
            <p className="text-[13px] uppercase tracking-[0.2em] text-teal">The shelf</p>
            <h2 id="dshelf-h" className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.6rem)]">Beautiful tools, <span className="display-italic">within reach.</span></h2>
            <p className="mt-4 text-ink-soft">Printable and editable downloads, delivered by email in under a minute. You customize everything. Pick one up to see every page.</p>
          </div>
          {products.length ? <p className="text-[14px] text-ink-mute">{products.length} available now</p> : null}
        </div>

        {products.length === 0 ? (
          <div className="mt-12 rounded-[28px] bg-white/80 p-8 shadow-soft backdrop-blur">
            <h3>The shelf is being stocked.</h3>
            <p className="mt-3 max-w-[48ch] text-ink-soft">The free ABC logger is ready now. Leave your email and we&apos;ll write once when the first downloads are up.</p>
            <div className="mt-6 max-w-md"><EmailCapture source="shelf-empty" /></div>
          </div>
        ) : (
          <div className="mt-14">
            <ul className="scroll-quiet relative z-10 -mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-8 pt-4 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4" aria-label="Downloads on the shelf">
              {products.slice(0, 8).map((p, i) => (
                <li key={p.id} className="w-[72vw] shrink-0 snap-center sm:w-auto">
                  <ShelfObject product={p} index={i} />
                </li>
              ))}
            </ul>
            {/* The shelf board, in the palette: a deep teal plank with a sunlit edge. */}
            <div aria-hidden className="relative -mt-4 h-5 rounded-[4px] bg-teal shadow-shelf">
              <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-[4px] bg-sun/70" />
            </div>
            <div aria-hidden className="mx-auto h-12 w-[94%] bg-gradient-to-b from-teal/20 to-transparent blur-md" />
          </div>
        )}

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-mute">
          <li>Delivered by email in under a minute.</li>
          <li>You customize everything.</li>
          <li>No treatment recommendations.</li>
        </ul>
      </div>
    </section>
  );
}

function ShelfObject({ product, index }: { product: ProductSummary; index: number }) {
  const tone = TONES[index % TONES.length];
  const meta = metaFor(product.handle);
  const price = formatMoney(product.price);
  const Art = index % 3 === 0 ? Binder : index % 3 === 1 ? Notebook : Sheets;
  return (
    <Link
      href={`/products/${product.handle}`}
      className="group block rounded-[20px] outline-none transition-transform duration-300 ease-out hover:-translate-y-3 focus-visible:-translate-y-3 motion-reduce:transform-none motion-reduce:hover:transform-none"
    >
      <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[20px] bg-white shadow-lift transition-shadow duration-300 group-hover:shadow-[0_40px_60px_-24px_rgba(8,108,115,0.45)]">
        {product.featuredImage ? (
          <Image src={product.featuredImage.url} alt={product.featuredImage.altText ?? `${product.title} preview`} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 72vw" className="object-cover" />
        ) : Art === Binder ? (
          <Binder tone={tone === "leaf" ? "leaf" : tone} className="w-[78%] translate-y-4 drop-shadow-[0_16px_20px_rgba(21,58,66,0.25)]" />
        ) : Art === Notebook ? (
          <Notebook tone={tone === "coral" ? "coral" : tone === "leaf" ? "leaf" : "turq"} className="w-[92%] translate-y-6 drop-shadow-[0_16px_20px_rgba(21,58,66,0.25)]" />
        ) : (
          <Sheets className="w-[80%] translate-y-6 drop-shadow-[0_16px_20px_rgba(21,58,66,0.25)]" />
        )}
        <span className="absolute left-4 top-4 rounded-pill bg-white/95 px-3 py-1 text-[12px] font-medium uppercase tracking-wider text-teal shadow-soft">{price === "Free" ? "Free" : price}</span>
      </div>
      <div className="px-1 pt-4">
        <h3 className="text-[1.15rem] leading-snug">{product.title}</h3>
        <p className="mt-1 text-[14px] text-ink-soft">{meta?.task ?? product.benefit}</p>
        {meta ? <p className="mt-1 text-[13px] text-ink-mute">For: {meta.who}</p> : null}
      </div>
    </Link>
  );
}
