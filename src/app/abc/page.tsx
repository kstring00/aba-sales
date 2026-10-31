import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Tracker } from "@/components/abc/Tracker";
import { FunctionExplainer, HowToUse } from "@/components/abc/Explainers";
import { I } from "@/components/abc/icons";
import { getProduct } from "@/lib/shopify/catalog";
import { isVisible, readPage } from "@/lib/content/pages";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The ABC tracker",
  description:
    "Record what happened before, during, and after a behavior so you can spot patterns and share observations with your BCBA. Nothing leaves your phone.",
};

/**
 * The tool page. First line is the privacy promise; the tracker itself is
 * the page, with what the BCBA receives beside it.
 */
export default async function AbcPage() {
  // Only link to the paper version when the Storefront API actually has it.
  const printable = await getProduct("home-abc-printable");
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-4 sm:px-8 sm:pt-8">
        <p className="flex items-center gap-2 text-[14px] text-ink-soft">
          <I.lock className="h-4 w-4 text-sage-deep" />
          <span><strong className="font-medium text-ink">Nothing leaves your phone.</strong> Entries live in this browser only.</span>
        </p>
        <h1 className="mt-3 text-[clamp(2.2rem,1.6rem+2.2vw,3.6rem)]">The ABC tracker</h1>
        <p className="mt-3 max-w-[60ch] text-[1.05rem] text-ink-soft">
          Record what happened before, during, and after a behavior so you can spot patterns and share observations with your BCBA.
          {printable ? <> Prefer paper? <Link href={`/products/${printable.handle}`} className="text-ink underline underline-offset-4">{printable.title}</Link> is the printable version.</> : null}
        </p>
        <div className="mt-8">
          <Tracker lessonVisible={isVisible(readPage("learn/why-behavior-happens"))} explainers={<><FunctionExplainer /><HowToUse /></>} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
