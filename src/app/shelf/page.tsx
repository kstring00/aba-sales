import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductCard } from "@/components/shop/ProductCard";
import { EmailCapture } from "@/components/shop/EmailCapture";
import { getShelves, SHELVES } from "@/lib/shopify/catalog";
import { metaFor, type ProductMeta } from "@/lib/resources";
import type { ProductSummary } from "@/lib/shopify/types";

export const metadata: Metadata = {
  title: "The shelf",
  description: "Printable and editable downloads for families and ABA clinics, arranged by what they help you do. Delivered by email in under a minute.",
};

export const revalidate = 300;

const CATEGORY_ORDER: ProductMeta["category"][] = [
  "Observation and note-taking",
  "Appointments and advocacy",
  "Care coordination",
  "Early service navigation",
  "Home routines",
];

/**
 * The shelf is arranged by the task a thing helps with, not by SKU. Only
 * products the Storefront API returns appear; planned categories are named
 * honestly as "not yet".
 */
export default async function ShelfPage() {
  const shelves = await getShelves();
  const family = shelves.find((s) => s.handle === "the-family-shelf");
  const clinic = shelves.find((s) => s.handle === "the-clinic-shelf");
  const all = shelves.flatMap((s) => s.products);

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    products: (family?.products ?? []).filter((p) => metaFor(p.handle)?.category === category),
  }));
  const uncategorized = (family?.products ?? []).filter((p) => !metaFor(p.handle));

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-14">
        <div className="max-w-[44rem]">
          <div>
            <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">The shelf</p>
            <h1 className="mt-4 text-[clamp(2.2rem,1.6rem+2.4vw,3.8rem)]">A place for the things that make the week <span className="display-italic">easier.</span></h1>
            <p className="mt-5 max-w-[50ch] text-[1.1rem] text-ink-soft">
              Downloads you print or edit yourself, arranged by what they help you do. Each is delivered by email in under a minute, and you can customize everything.
            </p>
          </div>
        </div>

        {all.length === 0 ? (
          <div className="shelf-edge mt-14 pb-12">
            <div className="grain rounded-lg bg-paper p-8 shadow-shelf">
              <h2>The shelf is being stocked.</h2>
              <p className="mt-3 max-w-[48ch] text-ink-soft">The free ABC logger is ready now. Leave your email and we&apos;ll write once when the first downloads are up. Nothing else.</p>
              <div className="mt-6 max-w-md"><EmailCapture source="empty-shelf" /></div>
            </div>
          </div>
        ) : (
          <>
            <nav aria-label="Sections" className="scroll-quiet mt-10 flex gap-2 overflow-x-auto pb-1">
              {groups.filter((g) => g.products.length).map((g) => (
                <a key={g.category} href={`#${slug(g.category)}`} className="lift min-h-11 shrink-0 rounded-pill border border-line-strong bg-paper px-4 text-[15px] leading-[44px] text-ink-soft hover:text-ink">{g.category}</a>
              ))}
              <a href="#clinic" className="lift min-h-11 shrink-0 rounded-pill border border-line-strong bg-paper px-4 text-[15px] leading-[44px] text-ink-soft hover:text-ink">For clinics</a>
            </nav>

            <section className="mt-12" aria-labelledby="family-h">
              <h2 id="family-h" className="sr-only">{family?.title ?? "The Family Shelf"}</h2>
              {groups.map((g) =>
                g.products.length ? (
                  <Group key={g.category} id={slug(g.category)} title={g.category} products={g.products} />
                ) : (
                  <NotYet key={g.category} id={slug(g.category)} title={g.category} />
                ),
              )}
              {uncategorized.length ? <Group id="more" title="Also on the shelf" products={uncategorized} /> : null}
            </section>

            <section id="clinic" className="mt-20 scroll-mt-24" aria-labelledby="clinic-h">
              <div className="mb-6 max-w-[52ch]">
                <h2 id="clinic-h">{clinic?.title ?? "The Clinic Shelf"}</h2>
                <p className="mt-2 text-ink-soft">{clinic?.description || SHELVES[1].blurb}</p>
              </div>
              {clinic && clinic.products.length > 0 ? (
                <div className="shelf-edge pb-12">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {clinic.products.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                </div>
              ) : (
                <div className="shelf-edge pb-12">
                  <div className="grain rounded-lg bg-paper p-6 shadow-shelf sm:p-8">
                    <p className="text-[13px] uppercase tracking-wider text-ink-mute">Coming soon</p>
                    <h3 className="mt-2">The Clinic Shelf is being stocked.</h3>
                    <p className="mt-3 max-w-[48ch] text-[15px] text-ink-soft">Onboarding packets, family-communication templates, and the paperwork that sets a tone. Leave your email and we&apos;ll write once when they&apos;re up.</p>
                    <div className="mt-5 max-w-md"><EmailCapture source="shelf-clinic" /></div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        <p className="mt-16 max-w-[68ch] text-[14px] text-ink-mute">
          Everything here is a template or educational material, written by a Registered Behavior Technician. Nothing is a treatment recommendation, and nothing replaces your child&apos;s team.{" "}
          <Link href="/abc" className="underline underline-offset-4">The ABC logger</Link> is free and needs no purchase.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function Group({ id, title, products }: { id: string; title: string; products: ProductSummary[] }) {
  return (
    <div id={id} className="mb-14 scroll-mt-24">
      <h3 className="mb-6 text-[1.4rem]">{title}</h3>
      <div className="shelf-edge pb-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}

function NotYet({ id, title }: { id: string; title: string }) {
  return (
    <div id={id} className="mb-10 flex flex-wrap items-baseline justify-between gap-3 border-b border-dashed border-line-strong pb-6">
      <h3 className="text-[1.2rem] text-ink-soft">{title}</h3>
      <p className="text-[14px] text-ink-mute">Not yet. Planned for a later season.</p>
    </div>
  );
}
