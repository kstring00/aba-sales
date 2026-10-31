import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductShelfCard } from "@/components/shop/ShelfCard";
import { ShelfSearch } from "@/components/shop/ShelfSearch";
import { ShelfScene } from "@/components/illustrations/Paper";
import { DrawerCards } from "@/components/home/DrawerCards";
import { EmailCapture } from "@/components/shop/EmailCapture";
import { getShelves } from "@/lib/shopify/catalog";
import { assignShelves, TINT_BG, TINT_TEXT } from "@/lib/shelves";
import { buildDrawer } from "@/lib/drawer";

export const metadata: Metadata = {
  title: "Shelves",
  description: "Every tool on The Support Shelf, by shelf: get organized, make a plan, everyday life, and support at home. Printable downloads and the free ABC Tracker.",
};

export const revalidate = 300;

/**
 * All four shelves, in full, from the same drawer model the homepage uses
 * (audit F-07): same one-liners, same placement, same cards. Each shelf is
 * addressable (#organized, #plan, #everyday, #home).
 */
export default async function ShelfPage() {
  const collections = await getShelves();
  const catalog = collections.flatMap((c) => c.products);
  const drawer = buildDrawer(catalog);
  const { unshelved } = assignShelves(catalog);

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
            Everything here is a printable tool or the free ABC Tracker. Prices come straight from the shop; free means free.
          </p>
          <Suspense fallback={null}>
            <ShelfSearch catalog={catalog} />
          </Suspense>
        </div>

        <div className="mx-auto w-full max-w-7xl space-y-6 px-5 pb-6 sm:space-y-8 sm:px-8">
          {drawer.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className={`${TINT_BG[s.tint]} panel grain scroll-mt-6 rounded-xl p-5 sm:p-7 lg:p-8`}>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,9fr)] lg:gap-8">
                <div className="flex flex-col">
                  <p className={`inline-flex self-start rounded-pill bg-paper/80 px-3 py-1 text-[12px] font-medium uppercase tracking-[0.16em] ${TINT_TEXT[s.tint]}`}>Shelf {s.number}</p>
                  <h2 id={`${s.id}-h`} className="mt-4 text-[clamp(1.9rem,1.5rem+1.4vw,2.8rem)] leading-[1.05]">{s.title}</h2>
                  <p className="mt-2 text-[16px] font-medium text-ink">{s.blurb}</p>
                  <p className="mt-2 max-w-[36ch] text-[15px] text-ink-soft">{s.lead}</p>
                  <div className="mt-auto hidden pt-8 lg:block">
                    <ShelfScene id={s.id} className="h-auto w-full max-w-[17rem]" />
                  </div>
                </div>
                <div style={{ "--shelf": `var(--${s.tint === "sky" ? "b1" : s.tint === "mint" ? "b2" : s.tint === "butter" ? "b3" : "b4"}-tint)` } as React.CSSProperties}>
                  <DrawerCards cards={s.cards} />
                  {s.cards.some((c) => c.status === "soon") ? (
                    <div className="paper-card mt-5 p-5" id={`${s.id}-soon`}>
                      <p className="text-[15px] text-ink">Want to know when the next tool on this shelf is ready? One email, then nothing else.</p>
                      <div className="mt-3 max-w-md"><EmailCapture source={`shelf-${s.id}-soon`} cta="Tell me first" /></div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ))}
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
