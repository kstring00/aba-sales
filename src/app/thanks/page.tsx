import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LinkButton } from "@/components/ui/Button";
import { clearCartCookie } from "@/lib/shopify/cart";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Shopify's post-checkout "continue shopping" link points here (set in Checkout settings). */
export default async function ThanksPage() {
  await clearCartCookie().catch(() => {});
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-24 pt-16 sm:px-8">
        <h1>Thank <span className="display-italic">you.</span></h1>
        <p className="mt-5 max-w-[52ch] text-[1.15rem] text-ink-soft">
          Check your email for your files. The download link arrives within a minute from Shopify. If it isn&apos;t there, look in spam, then write to us.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/abc" variant="primary" size="lg">Try the free ABC logger</LinkButton>
          <LinkButton href="/shelf" variant="quiet">Back to the shelf</LinkButton>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
