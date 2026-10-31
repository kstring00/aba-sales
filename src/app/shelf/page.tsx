import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EmptyShelfCard, LoggerCard, ProductShelfCard } from "@/components/shop/ShelfCard";
import { ShelfSearch } from "@/components/shop/ShelfSearch";
import { ShelfScene } from "@/components/illustrations/Paper";
import { getShelves } from "@/lib/shopify/catalog";
import { assignShelves, TINT_BG, TINT_TEXT } from "@/lib/shelves";
import { SHELF_CONTENT } from "@/content/shelf-drawer";
import { EmailCapture } from "@/components/shop/EmailCapture";
import { DrawerGlyph } from "@/components/home/drawer-icons";

export const metadata: Metadata = {
  title: "Shelves",
  description: "Every tool on The Support Shelf, by shelf: get organized, make a plan, everyday life, and support at home. Printable downloads and the free ABC logger.",
};

export const revalidate = 300;

/**
 * All four shelves, in full. Same tints and paper objects as the homepage.
 * Each shelf is addressable (#organized, #plan, #everyday, #home) so the
 * homepage's "Explore this shelf" lands on it.
 */
export default async function ShelfPage() {
  const collections = await getShelves();
  const catalog = collections.flatMap((c) => c.products);
  const { shelves, unshelved } = assignShelves(catalog);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-5 pb-6 pt-6 sm:px-8 sm:pt-10">
          <p className="kicker">Browse all support</p>
          <h1 className="mt-3 text-[clamp(2.2rem,1.6rem+2.2vw,3.8rem)]">
            Four shelves, <em>one at a time</em>.
          </h1>
          <p className="mt-5 max-w-[52ch] text-[1.1rem] text-ink-soft">
            Everything here is a printable tool or the free logger. Prices are shown as they are; free means free.
          </p>
          <Suspense fallback={null}>
            <ShelfSearch catalog={catalog} />
          </Suspense>
        </div>

        <div className="mx-auto w-full max-w-7xl space-y-6 px-5 pb-6 sm:px-8 sm:space-y-8">
          {shelves.map((s) => {
            const n = s.products.length + (s.tool ? 1 : 0);
            return (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className={`${TINT_BG[s.tint]} panel grain scroll-mt-6 rounded-xl p-5 sm:p-7 lg:p-8`}>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,9fr)] lg:gap-8">
                  <div className="flex flex-col">
                    <p className={`inline-flex self-start rounded-pill bg-paper/80 px-3 py-1 text-[12px] font-medium uppercase tracking-[0.16em] ${TINT_TEXT[s.tint]}`}>Shelf {s.number}</p>
                    <h2 id={`${s.id}-h`} className="mt-4 text-[clamp(1.9rem,1.5rem+1.4vw,2.8rem)] leading-[1.05]">{s.title}</h2>
                    <p className="mt-3 max-w-[34ch] text-[15.5px] text-ink-soft">{s.description}</p>
                    <div className="mt-auto hidden pt-8 lg:block">
                      <ShelfScene id={s.id} className="h-auto w-full max-w-[17rem]" />
                    </div>
                  </div>
                  <div>
                    {n > 0 ? (
                      <>
                        <div className={`grid gap-5 sm:grid-cols-2 ${n >= 3 ? "xl:grid-cols-3" : ""}`}>
                          {s.tool ? <LoggerCard shelf={s} /> : null}
                          {s.products.map((p) => <ProductShelfCard key={p.id} product={p} tint={s.tint} />)}
                        </div>
                        <div className="board mx-1 mt-3 h-3.5" aria-hidden />
                      </>
                    ) : null}
                    {SHELF_CONTENT[s.id].comingSoon.length ? (
                      <div className={`paper-card ${n > 0 ? "mt-8" : ""} p-5 sm:p-6`} id={`${s.id}-soon`}>
                        <p className={`kicker ${TINT_TEXT[s.tint]}`}>Coming soon to this shelf</p>
                        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                          {SHELF_CONTENT[s.id].comingSoon.map((c) => (
                            <li key={c.title} className="flex gap-3 rounded-md bg-cream p-3">
                              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${TINT_BG[s.tint]} ${TINT_TEXT[s.tint]}`}><DrawerGlyph name={c.icon} className="h-5 w-5" /></span>
                              <span className="min-w-0">
                                <span className="block text-[15px] font-medium text-ink">{c.title}</span>
                                <span className="block text-[13.5px] text-ink-soft">{c.blurb}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 text-[14.5px] text-ink-soft">Being made now, in this order. Leave your email and you&apos;ll hear once when the first one is ready. Nothing else.</p>
                        <div className="mt-3 max-w-md"><EmailCapture source={`shelf-${s.id}-soon`} cta="Tell me first" /></div>
                      </div>
                    ) : n === 0 ? <EmptyShelfCard shelf={s} /> : null}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {unshelved.length ? (
          <section aria-labelledby="more-h" className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
            <h2 id="more-h" className="text-[1.6rem]">Also on the shelf</h2>
            <p className="mt-2 text-[15px] text-ink-soft">Newer items that haven&apos;t been placed on a shelf yet.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {unshelved.map((p) => <ProductShelfCard key={p.id} product={p} tint="sky" />)}
            </div>
          </section>
        ) : null}
        <div className="h-10" />
      </main>
      <SiteFooter />
    </>
  );
}
