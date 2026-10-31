import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PendingBanner } from "@/components/hub/PendingBanner";
import { SectionText } from "@/components/hub/SectionText";
import { GlossaryList } from "@/components/hub/GlossaryList";
import { hubMetadata } from "@/components/hub/HubPage";
import { isVisible, readPage } from "@/lib/content/pages";
import { publicEnv } from "@/lib/env";
import { visibleTerms } from "@/lib/content/data";

export const dynamic = "force-static";
export const generateMetadata = (): Metadata => hubMetadata("pages/glossary");

/** Only published terms on production; DefinedTermSet JSON-LD for the published ones. */
export default function GlossaryPage() {
  const page = readPage("pages/glossary");
  const terms = visibleTerms();
  if (!page || !isVisible(page) || terms.length === 0) notFound();
  const published = terms.filter((t) => t.status === "published" && t.short);
  const ld = published.length
    ? { "@context": "https://schema.org", "@type": "DefinedTermSet", name: page.title, url: `${publicEnv.siteUrl}/learn/glossary`, hasDefinedTerm: published.map((t) => ({ "@type": "DefinedTerm", name: t.term, alternateName: t.full || undefined, description: t.short, url: `${publicEnv.siteUrl}/learn/glossary#${t.slug}` })) }
    : null;
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <PendingBanner status={page.status} />
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">{page.title}</h1>
        {page.description ? <p className="mt-4 text-[1.15rem] text-ink-soft">{page.description}</p> : null}
        {page.sections.map((s) => <div key={s.heading} className="mt-6"><SectionText {...s} /></div>)}
        <div className="mt-8"><GlossaryList terms={terms} /></div>
      </main>
      {ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /> : null}
      <SiteFooter />
    </>
  );
}
