import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PendingBanner } from "@/components/hub/PendingBanner";
import { SectionText } from "@/components/hub/SectionText";
import { hubMetadata } from "@/components/hub/HubPage";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { isVisible, readPage } from "@/lib/content/pages";
import { ui, visibleResources } from "@/lib/content/data";

export const dynamic = "force-static";
export const generateMetadata = (): Metadata => hubMetadata("pages/for-you");

const SLOT = { okay: "It's okay to feel this", aboutTo: "If you're about to lose it", talk: "Who you can talk to" };

/** For the parent. The two calming tools are embedded here and also live at their own URLs. */
export default function ForYouPage() {
  const page = readPage("pages/for-you");
  if (!page || !isVisible(page)) notFound();
  const section = (h: string) => page.sections.find((s) => s.heading === h) ?? { heading: h, markdown: "", pending: true };
  const research = readPage("pages/for-you-research");
  const lines = [...visibleResources("parent-support"), ...visibleResources("crisis").filter((r) => r.id !== "911")];
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <PendingBanner status={page.status} />
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">{page.title}</h1>
        {page.description ? <p className="mt-4 text-[1.15rem] text-ink-soft">{page.description}</p> : null}

        <section className="mt-12" aria-labelledby="fy-okay">
          <h2 id="fy-okay" className="text-[1.7rem]">{SLOT.okay}</h2>
          <div className="mt-3"><SectionText {...section(SLOT.okay)} /></div>
        </section>

        <section className="mt-12" aria-labelledby="fy-about">
          <h2 id="fy-about" className="text-[1.7rem]">{SLOT.aboutTo}</h2>
          <div className="mt-3"><SectionText {...section(SLOT.aboutTo)} /></div>
          <h3 className="mt-8 text-[1.3rem]">{ui.forYou.toolsHeading}</h3>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div className="paper-card p-5"><h4 className="mb-4 text-center font-display text-[1.25rem] text-heading"><Link href="/for-you/breathe" className="hover:underline">{ui.tools.breathe.title}</Link></h4><ToolFrame tool="breathe" /></div>
            <div className="paper-card p-5"><h4 className="mb-4 text-center font-display text-[1.25rem] text-heading"><Link href="/for-you/ground" className="hover:underline">{ui.tools.ground.title}</Link></h4><ToolFrame tool="ground" /></div>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="fy-talk">
          <h2 id="fy-talk" className="text-[1.7rem]">{SLOT.talk}</h2>
          <div className="mt-3"><SectionText {...section(SLOT.talk)} /></div>
          <ul className="mt-5 space-y-3">
            {lines.map((r) => (
              <li key={r.id} className="paper-card p-5">
                <p className="font-medium text-heading">{r.name}</p>
                <p className="mt-1 text-[15px] text-ink-soft">{r.whatFor}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
                  {r.action ? <a href={r.action.href} className="inline-flex min-h-11 items-center font-medium text-heading underline underline-offset-4">{r.action.label}</a> : null}
                  {r.url ? <a href={r.url.href} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-heading underline underline-offset-4">{r.url.label}</a> : null}
                </p>
                <p className="mt-1 text-[13px] text-ink-mute">{ui.resources.notAffiliated}</p>
              </li>
            ))}
          </ul>
          {research && isVisible(research) ? <Link href="/for-you/research" className="mt-6 inline-flex min-h-11 items-center text-heading underline underline-offset-4">{ui.forYou.researchLink} →</Link> : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
