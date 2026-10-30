import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmptyShelf } from "@/components/shop/EmptyShelf";
import { EmailCapture } from "@/components/shop/EmailCapture";
import { getShelves, SHELVES } from "@/lib/shopify/catalog";

export const metadata: Metadata = {
  title: "The shelf",
  description: "Printable and editable downloads for families and ABA clinics. Delivered by email in under a minute.",
};

export const revalidate = 300;

export default async function ShelfPage() {
  const shelves = await getShelves();
  const total = shelves.reduce((n, s) => n + s.products.length, 0);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">The shelf</h1>
        <p className="mt-5 max-w-[52ch] text-[1.15rem] text-ink-soft">
          Downloads you print or edit yourself. Each one is delivered by email in under a minute, and you can customize everything.
        </p>

        {total === 0 ? (
          <div className="mt-12"><EmptyShelf /></div>
        ) : (
          <>
            <nav aria-label="Shelves" className="mt-8 flex gap-2">
              {SHELVES.map((s) => (
                <a key={s.handle} href={`#${s.handle}`} className="lift min-h-11 rounded-pill border border-line-strong bg-paper px-4 text-[15px] leading-[44px] text-ink-soft hover:text-ink">
                  {s.short}
                </a>
              ))}
            </nav>
            {SHELVES.map((meta) => {
              const col = shelves.find((c) => c.handle === meta.handle);
              return (
                <section key={meta.handle} id={meta.handle} className="mt-14 scroll-mt-24" aria-labelledby={`${meta.handle}-h`}>
                  <div className="mb-6">
                    <h2 id={`${meta.handle}-h`}>{col?.title ?? `The ${meta.short} Shelf`}</h2>
                    <p className="mt-2 max-w-[52ch] text-ink-soft">{col?.description || meta.blurb}</p>
                  </div>
                  {col && col.products.length > 0 ? (
                    <div className="shelf-edge pb-12">
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {col.products.map((p) => (
                          <ProductCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="shelf-edge pb-12">
                      <div className="rounded-lg bg-paper p-6 shadow-shelf sm:p-8">
                        <p className="text-[13px] uppercase tracking-wider text-ink-mute">Coming soon</p>
                        <h3 className="mt-2">The {meta.short} Shelf is being stocked.</h3>
                        <p className="mt-3 max-w-[48ch] text-[15px] text-ink-soft">
                          {meta.handle === "the-clinic-shelf"
                            ? "Onboarding packets, family-communication templates, and the paperwork that sets a tone. Leave your email and we'll write once when they're up."
                            : "Leave your email and we'll write once when the first ones are up."}
                        </p>
                        <div className="mt-5 max-w-md"><EmailCapture source={`shelf-${meta.short.toLowerCase()}`} /></div>
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </>
        )}

        <p className="mt-16 text-[14px] text-ink-mute">
          Everything here is a template or educational material. Nothing is a treatment recommendation.{" "}
          <Link href="/abc" className="underline underline-offset-4">The ABC logger</Link> is free and needs no purchase.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
