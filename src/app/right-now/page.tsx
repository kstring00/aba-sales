import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PendingBanner } from "@/components/hub/PendingBanner";
import { SectionText } from "@/components/hub/SectionText";
import { RightNowSafety } from "@/components/hub/RightNowSafety";
import { hubMetadata } from "@/components/hub/HubPage";
import { isVisible, readPage } from "@/lib/content/pages";
import { ui } from "@/lib/content/data";

export const dynamic = "force-static";
export const generateMetadata = (): Metadata => hubMetadata("pages/right-now");

const SLOT = {
  danger: "Is anyone in danger?",
  fiveMinutes: "For the next 5 minutes",
  tantrum: "Tantrum or meltdown?",
  forYou: "Then, for you",
  afterwards: "Afterwards",
};

/**
 * For a hard moment. One column, large type, nothing else on the page: no
 * products, ever. Safety first; the rest only after "we're safe".
 */
export default function RightNowPage() {
  const page = readPage("pages/right-now");
  if (!page || !isVisible(page)) notFound();
  const section = (h: string) => page.sections.find((s) => s.heading === h) ?? { heading: h, markdown: "", pending: true };
  const lesson = readPage("learn/tantrum-or-meltdown");
  const T = ui.rightNow;
  const big = "text-[1.2rem] leading-relaxed sm:text-[1.3rem]";
  const action = "flex min-h-14 items-center justify-between gap-3 rounded-xl border border-line-strong bg-paper px-5 text-[1.1rem] font-medium text-heading hover:border-accent";

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
        <PendingBanner status={page.status} />
        <h1 className="text-[clamp(2.6rem,2rem+3vw,4rem)]">{page.title}</h1>
        <div className="mt-8">
          <RightNowSafety
            question={
              <section aria-labelledby="rn-q">
                <h2 id="rn-q" className="text-[clamp(1.8rem,1.4rem+2vw,2.6rem)]">{SLOT.danger}</h2>
                <div className={`mt-3 ${big}`}><SectionText {...section(SLOT.danger)} /></div>
              </section>
            }
            rest={
              <div className="mt-12 space-y-12">
                <section aria-labelledby="rn-5">
                  <h2 id="rn-5" className="text-[clamp(1.7rem,1.3rem+1.8vw,2.4rem)]">{SLOT.fiveMinutes}</h2>
                  <div className={`mt-3 ${big}`}><SectionText {...section(SLOT.fiveMinutes)} /></div>
                </section>
                <section aria-labelledby="rn-tm">
                  <h2 id="rn-tm" className="text-[clamp(1.5rem,1.2rem+1.4vw,2.1rem)]">{SLOT.tantrum}</h2>
                  <div className={`mt-3 ${big}`}><SectionText {...section(SLOT.tantrum)} /></div>
                  {lesson && isVisible(lesson) ? <Link href="/learn/tantrum-or-meltdown" className="mt-4 inline-flex min-h-11 items-center text-[1.05rem] text-heading underline underline-offset-4">{T.fullLesson}</Link> : null}
                </section>
                <section aria-labelledby="rn-you">
                  <h2 id="rn-you" className="text-[clamp(1.5rem,1.2rem+1.4vw,2.1rem)]">{SLOT.forYou}</h2>
                  <div className={`mt-3 ${big}`}><SectionText {...section(SLOT.forYou)} /></div>
                  <div className="mt-4 grid gap-3">
                    <Link href="/for-you/breathe" className={action}>{T.breathe} <span aria-hidden>→</span></Link>
                    <Link href="/for-you/ground" className={action}>{T.ground} <span aria-hidden>→</span></Link>
                  </div>
                </section>
                <section aria-labelledby="rn-after">
                  <h2 id="rn-after" className="text-[clamp(1.5rem,1.2rem+1.4vw,2.1rem)]">{SLOT.afterwards}</h2>
                  <div className={`mt-3 ${big}`}><SectionText {...section(SLOT.afterwards)} /></div>
                  <Link href="/abc" className={`${action} mt-4`}>{T.logIt} <span aria-hidden>→</span></Link>
                </section>
              </div>
            }
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
