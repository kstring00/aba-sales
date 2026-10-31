import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Decode } from "@/components/hub/Decode";
import { ui, visibleTerms } from "@/lib/content/data";
import { publicEnv } from "@/lib/env";
import { getProduct } from "@/lib/shopify/catalog";

export const revalidate = 300;
export const metadata: Metadata = { title: ui.decode.title, description: ui.decode.description };

/** Hidden on production until at least one glossary term is published (it would decode nothing). */
export default async function DecodePage() {
  const terms = visibleTerms();
  if (terms.length === 0) notFound();
  const product = await getProduct("read-your-childs-treatment-plan").catch(() => null);
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.4rem)]">{ui.decode.title}</h1>
        <p className="mt-4 text-[1.15rem] text-ink-soft">{ui.decode.description}</p>
        <div className="mt-8"><Decode terms={terms} contactEmail={publicEnv.contactEmail} productHref={product ? `/products/${product.handle}` : null} /></div>
      </main>
      <SiteFooter />
    </>
  );
}
