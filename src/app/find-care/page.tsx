import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PendingBanner } from "@/components/hub/PendingBanner";
import { SectionText } from "@/components/hub/SectionText";
import { hubMetadata } from "@/components/hub/HubPage";
import { FindCare } from "@/components/hub/FindCare";
import { isVisible, readPage } from "@/lib/content/pages";
import { needsVerification, ui, visibleResources } from "@/lib/content/data";
import { getProduct } from "@/lib/shopify/catalog";
import { parseAnswers } from "@/lib/content/findCare";

export const generateMetadata = (): Metadata => hubMetadata("pages/find-care");

/** Where to look for services, by age, coverage and state. A guide, not a directory. */
export default async function FindCarePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const initial = parseAnswers({ get: (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : null) });
  const page = readPage("pages/find-care");
  const blocksPage = readPage("find-care/blocks");
  if (!page || !isVisible(page) || !blocksPage) notFound();
  const blocks = Object.fromEntries(blocksPage.sections.filter((s) => s.heading).map((s) => [s.heading, <SectionText key={s.heading} {...s} />]));
  const resources = visibleResources("find-care").map((r) => ({ ...r, needsVerify: needsVerification(r) }));
  const waitlist = await getProduct("waitlist-playbook").catch(() => null);
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <PendingBanner status={page.status !== "published" ? page.status : blocksPage.status} />
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">{page.title}</h1>
        {page.description ? <p className="mt-4 text-[1.15rem] text-ink-soft">{page.description}</p> : null}
        {page.sections.map((s) => <div key={s.heading} className="mt-6"><SectionText {...s} /></div>)}
        <FindCare initial={initial} blocks={blocks} resources={resources} waitlistHref={waitlist ? `/products/${waitlist.handle}` : null} notAffiliated={ui.resources.notAffiliated} />
      </main>
      <SiteFooter />
    </>
  );
}
