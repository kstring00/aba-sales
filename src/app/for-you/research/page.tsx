import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PendingBanner } from "@/components/hub/PendingBanner";
import { SectionText } from "@/components/hub/SectionText";
import { hubMetadata } from "@/components/hub/HubPage";
import { isVisible, readPage } from "@/lib/content/pages";
import { fill, ui } from "@/lib/content/data";

export const dynamic = "force-static";
export const generateMetadata = (): Metadata => hubMetadata("pages/for-you-research");

/** Findings the founder supplies, each with its citations in the sources list. */
export default function ResearchPage() {
  const page = readPage("pages/for-you-research");
  if (!page || !isVisible(page)) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <PendingBanner status={page.status} />
        <nav aria-label="Breadcrumb" className="text-[14px] text-ink-mute"><Link href="/for-you" className="hover:text-ink">{ui.nav.forYou}</Link></nav>
        <h1 className="mt-2 text-[clamp(2.2rem,1.6rem+2vw,3.4rem)]">{page.title}</h1>
        {page.description ? <p className="mt-4 text-[1.15rem] text-ink-soft">{page.description}</p> : null}
        <p className="mt-3 text-[14px] text-ink-mute">{page.lastReviewed ? fill(ui.learn.lastReviewed, { date: page.lastReviewed }) : null}</p>
        <div className="mt-10 space-y-10">
          {page.sections.filter((s) => s.heading).map((s) => (
            <section key={s.heading}>
              <h2 className="text-[1.5rem]">{s.heading}</h2>
              <div className="mt-3"><SectionText {...s} /></div>
            </section>
          ))}
        </div>
        {page.sources.length ? (
          <section className="mt-12 border-t border-line pt-6" aria-labelledby="src-h">
            <h2 id="src-h" className="text-[1.2rem]">{ui.learn.sources}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] text-ink-soft">
              {page.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener" className="text-heading underline underline-offset-4">{s.title}</a></li>)}
            </ol>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
