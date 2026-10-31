import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { ShelfExplorer } from "@/components/home/ShelfExplorer";
import { WhyItMatters } from "@/components/home/WhyItMatters";
import { ClosingCta } from "@/components/home/ClosingCta";
import { getShelves } from "@/lib/shopify/catalog";
import { assignShelves } from "@/lib/shelves";

export const metadata: Metadata = {
  title: "The Support Shelf — practical tools for parents of kids in ABA therapy",
  description:
    "Four shelves of printable tools for parents and caregivers of kids in ABA therapy: get organized, make a plan, everyday life, and support at home, plus a free ABC logger that stays on your phone.",
};

export const revalidate = 300;

/**
 * The homepage is the shelf. Products come from the Storefront API and are
 * placed on one of four shelves by tag, falling back to handle. Nothing is
 * shown as purchasable unless Shopify returns it.
 */
export default async function HomePage() {
  const collections = await getShelves();
  const catalog = collections.flatMap((c) => c.products);
  const { shelves } = assignShelves(catalog);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <ShelfExplorer shelves={shelves} />
        <WhyItMatters />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
