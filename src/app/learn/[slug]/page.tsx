import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PendingBanner } from "@/components/hub/PendingBanner";
import { SectionText, makeLinker } from "@/components/hub/SectionText";
import { isVisible, listPages, readPage } from "@/lib/content/pages";
import { fill, ui, visibleTerms } from "@/lib/content/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return listPages("learn").map((p) => ({ slug: p.slug.replace(/^learn\//, "") }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = readPage(`learn/${(await params).slug}`);
  if (!page || !isVisible(page)) return { title: "Not found" };
  return { title: page.title, description: page.description, robots: page.status === "published" ? undefined : { index: false } };
}

/** A lesson: one H1, its sections (glossary terms linked on first use), sources, last reviewed, related, one soft next step. */
export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = readPage(`learn/${slug}`);
  if (!page || !isVisible(page)) notFound();
  const linker = makeLinker(visibleTerms());
  const related = page.related.map((r) => readPage(`learn/${r}`)).filter((p) => p && isVisible(p));
  const [nextHref, nextLabel] = (page.extra.nextStep ?? "").split("|").map((s) => s.trim());
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <PendingBanner status={page.status} />
        <nav aria-label="Breadcrumb" className="text-[14px] text-ink-mute"><Link href="/learn" className="inline-flex min-h-11 items-center hover:text-ink">{ui.nav.learn}</Link></nav>
        <h1 className="mt-2 text-[clamp(2.2rem,1.6rem+2vw,3.4rem)]">{page.title}</h1>
        {page.description ? <p className="mt-4 text-[1.15rem] text-ink-soft">{page.description}</p> : null}
        <p className="mt-3 text-[14px] text-ink-mute">
          {[page.lastReviewed ? fill(ui.learn.lastReviewed, { date: page.lastReviewed }) : null, page.reviewedBy ? fill(ui.learn.reviewedBy, { name: page.reviewedBy }) : null].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-10 space-y-10">
          {page.sections.map((s) => (
            <section key={s.heading || "intro"}>
              {s.heading ? <h2 className="text-[1.6rem]">{s.heading}</h2> : null}
              <div className={s.heading ? "mt-3" : ""}><SectionText {...s} linker={linker} /></div>
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
        {related.length ? (
          <section className="mt-10" aria-labelledby="rel-h">
            <h2 id="rel-h" className="text-[1.2rem]">{ui.learn.related}</h2>
            <ul className="mt-3 space-y-1">{related.map((r) => <li key={r!.slug}><Link href={`/${r!.slug}`} className="inline-flex min-h-11 items-center text-heading underline underline-offset-4">{r!.title}</Link></li>)}</ul>
          </section>
        ) : null}
        {nextHref && nextLabel ? (
          <p className="mt-10 rounded-lg bg-sage-tint p-5 text-[15.5px] text-ink">
            <span className="block text-[13px] uppercase tracking-[0.14em] text-ink-mute">{ui.learn.next}</span>
            <Link href={nextHref} className="mt-1 inline-flex min-h-11 items-center font-medium text-heading underline underline-offset-4">{nextLabel} →</Link>
          </p>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
