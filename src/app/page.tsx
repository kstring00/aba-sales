import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShelfHero } from "@/components/home/ShelfHero";
import { DrawerPanel } from "@/components/home/DrawerPanel";
import { WhyItMatters } from "@/components/home/WhyItMatters";
import { ClosingCta } from "@/components/home/ClosingCta";
import { getShelves } from "@/lib/shopify/catalog";
import { buildDrawer } from "@/lib/drawer";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "The Support Shelf — practical support for every step of the autism journey",
  description:
    "Four shelves of practical tools for parents of kids in ABA therapy: get organized, make a plan, everyday life, and support at home. Start with the free ABC Tracker.",
};

export const revalidate = 300;

/**
 * Homepage: the hero is the shelf. Live products come from the Storefront
 * API and are placed on a shelf by metafield, tag, or handle; coming-soon
 * items fill from the content file so no drawer is ever empty. Panels are
 * server-rendered; the client only toggles which one shows.
 */
export default async function HomePage() {
  const collections = await getShelves();
  const catalog = collections.flatMap((c) => c.products);
  const drawer = buildDrawer(catalog);

  return (
    <>
      <SiteHeader />
      <main id="main" className="sd-scope mx-auto w-full max-w-7xl flex-1 px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] sm:px-8">
        <ShelfHero
          shelves={drawer.map((s) => ({ id: s.id, number: s.number, title: s.title, blurb: s.blurb, tint: s.tint }))}
          panels={drawer.map((s) => <DrawerPanel key={s.id} shelf={s} />)}
          reviewer={publicEnv.bcbaReviewer}
        />
        <WhyItMatters printableHref={catalog.some((p) => p.handle === "home-abc-printable") ? "/products/home-abc-printable" : null} />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
