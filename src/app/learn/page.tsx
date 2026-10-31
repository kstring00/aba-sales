import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PendingBanner } from "@/components/hub/PendingBanner";
import { SectionText } from "@/components/hub/SectionText";
import { hubMetadata } from "@/components/hub/HubPage";
import { isVisible, listPages, readPage } from "@/lib/content/pages";
import { ui, visibleTerms } from "@/lib/content/data";

export const dynamic = "force-static";
export const generateMetadata = (): Metadata => hubMetadata("pages/learn");

/** The Learn index: introduction, the lessons that are visible, and the two look-up tools. */
export default function LearnPage() {
  const page = readPage("pages/learn");
  if (!page || !isVisible(page)) notFound();
  const lessons = listPages("learn").filter(isVisible);
  const terms = visibleTerms().length > 0;
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <PendingBanner status={page.status} />
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">{page.title}</h1>
        {page.description ? <p className="mt-4 text-[1.15rem] text-ink-soft">{page.description}</p> : null}
        {page.sections.map((s) => <div key={s.heading} className="mt-6"><SectionText {...s} /></div>)}
        {terms ? (
          <section className="mt-10" aria-labelledby="look-h">
            <h2 id="look-h" className="text-[1.5rem]">{ui.learn.toolsHeading}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <li><Link href="/learn/glossary" className="paper-card lift flex min-h-16 items-center p-5 font-medium text-heading">{ui.learn.glossaryLink} →</Link></li>
              <li><Link href="/learn/decode" className="paper-card lift flex min-h-16 items-center p-5 font-medium text-heading">{ui.learn.decodeLink} →</Link></li>
            </ul>
          </section>
        ) : null}
        <section className="mt-10" aria-labelledby="les-h">
          <h2 id="les-h" className="text-[1.5rem]">{ui.learn.lessonsHeading}</h2>
          <ul className="mt-4 space-y-3">
            {lessons.map((l) => (
              <li key={l.slug}>
                <Link href={`/${l.slug}`} className="paper-card lift block p-5">
                  <span className="block font-display text-[1.25rem] text-heading">{l.title}</span>
                  <span className="mt-1 block text-[15px] text-ink-soft">{l.description}</span>
                  {l.status !== "published" ? <span className="mt-2 inline-block rounded-pill bg-honey-soft px-2 py-0.5 text-[12px] text-ink">{l.status}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
