import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Welcome } from "@/components/home/Welcome";
import { WeSee } from "@/components/home/WeSee";
import { Finder } from "@/components/home/Finder";
import { LivingShelf } from "@/components/home/LivingShelf";
import { AbcDemo } from "@/components/home/AbcDemo";
import { SupportBeyond } from "@/components/home/SupportBeyond";
import { Founder } from "@/components/home/Founder";
import { Closing } from "@/components/home/Closing";
import { HumanMoment } from "@/components/home/HumanMoment";
import { getShelves } from "@/lib/shopify/catalog";

export const metadata: Metadata = {
  title: "The Support Shelf — you don't have to carry it alone",
  description:
    "Thoughtfully made tools for parents and caregivers of autistic children: a free ABC observation logger that stays on your phone, and printable resources for appointments, routines, and care coordination.",
};

export const revalidate = 300;

/**
 * The homepage is a paced story that leads to something useful:
 * recognition → reassurance → a real next step. Every section keys off
 * what the Storefront API actually returns, so nothing is shown as
 * purchasable unless it is.
 */
export default async function HomePage() {
  const shelves = await getShelves();
  const catalog = shelves.flatMap((s) => s.products);
  const hasProducts = catalog.length > 0;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Welcome hasProducts={hasProducts} />
        <WeSee />
        <HumanMoment>Start with one thing. The rest can wait until it can&apos;t.</HumanMoment>
        <Finder catalog={catalog} />
        <LivingShelf products={catalog} />
        <AbcDemo />
        <SupportBeyond />
        <Founder />
        <Closing hasProducts={hasProducts} />
      </main>
      <SiteFooter />
    </>
  );
}
