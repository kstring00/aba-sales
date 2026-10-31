import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PendingBanner } from "@/components/hub/PendingBanner";
import { SectionText } from "@/components/hub/SectionText";
import { isVisible, readPage } from "@/lib/content/pages";

/** Metadata straight from the page's front matter. */
export function hubMetadata(slug: string): Metadata {
  const page = readPage(slug);
  if (!page || !isVisible(page)) return { title: "Not found" };
  return { title: page.title, description: page.description, robots: page.status === "published" ? undefined : { index: false } };
}

/**
 * A generic content page: title, description, then each ## section. Pages
 * that need structure around their sections (Right now, Find care) build on
 * readPage() directly in later stages.
 */
export function HubPage({ slug }: { slug: string }) {
  const page = readPage(slug);
  if (!page || !isVisible(page)) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <PendingBanner status={page.status} />
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">{page.title}</h1>
        {page.description ? <p className="mt-4 text-[1.15rem] text-ink-soft">{page.description}</p> : null}
        <div className="mt-10 space-y-10">
          {page.sections.map((s) => (
            <section key={s.heading || "intro"} aria-labelledby={s.heading ? `s-${s.heading}` : undefined}>
              {s.heading ? <h2 id={`s-${s.heading}`} className="text-[1.6rem]">{s.heading}</h2> : null}
              <div className={s.heading ? "mt-3" : ""}><SectionText markdown={s.markdown} pending={s.pending} /></div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
