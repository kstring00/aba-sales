import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ToolFrame } from "@/components/tools/ToolFrame";
import { ui } from "@/lib/content/data";
import { isVisible, readPage } from "@/lib/content/pages";

const T = ui.tools.breathe;

export const dynamic = "force-static";
export const metadata: Metadata = { title: T.title, description: T.description };

/** A generic, non-clinical calming exercise. Available on its own URL and embedded on For you. */
export default function Page() {
  const forYou = isVisible(readPage("pages/for-you"));
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
        {forYou ? <Link href="/for-you" className="inline-flex min-h-11 items-center text-[15px] text-ink-soft underline underline-offset-4 hover:text-ink">← {ui.tools.back}</Link> : null}
        <h1 className="mt-2 text-center text-[clamp(2rem,1.5rem+2vw,3rem)]">{T.title}</h1>
        <p className="mx-auto mt-3 max-w-[44ch] text-center text-[1.05rem] text-ink-soft">{T.intro}</p>
        <div className="mt-8"><ToolFrame tool="breathe" /></div>
      </main>
      <SiteFooter />
    </>
  );
}
