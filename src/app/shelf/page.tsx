import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BrightHero } from "@/components/shelf/BrightHero";
import { HelpTiles } from "@/components/shelf/HelpTiles";
import { DigitalShelf } from "@/components/shelf/DigitalShelf";
import { LoggerShowcase } from "@/components/shelf/LoggerShowcase";
import { HumanElement } from "@/components/shelf/HumanElement";
import { Upcoming } from "@/components/shelf/Upcoming";
import { Ending } from "@/components/shelf/Ending";
import { getShelves } from "@/lib/shopify/catalog";

export const metadata: Metadata = {
  title: "The shelf",
  description: "A brighter place to find practical support: printable tools for appointments, care coordination, and everyday routines, plus the free ABC logger.",
};

export const revalidate = 300;

/**
 * "A Brighter Kind of Support." The shelf page opts into the bright theme;
 * every other page keeps its own. Seven sections, each its own color
 * environment, all keyed off what the Storefront API actually returns.
 */
export default async function ShelfPage() {
  const shelves = await getShelves();
  const catalog = shelves.flatMap((s) => s.products);
  return (
    <div data-theme="bright" className="flex min-h-dvh flex-col bg-white">
      <SiteHeader />
      <main id="main" className="flex-1">
        <BrightHero products={catalog} />
        <HelpTiles catalog={catalog} />
        <DigitalShelf products={catalog} />
        <LoggerShowcase />
        <HumanElement />
        <Upcoming />
        <Ending hasProducts={catalog.length > 0} />
      </main>
      <SiteFooter />
    </div>
  );
}
