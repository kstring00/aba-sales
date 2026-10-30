import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Account deleted", robots: { index: false } };

export default function GoodbyePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-24 pt-16 sm:px-8">
        <h1>Your account is <span className="display-italic">gone.</span></h1>
        <p className="mt-5 max-w-[52ch] text-ink-soft">
          Everything you recorded has been deleted from our live database. Backups kept by our hosting
          provider age out within 30 days. Thank you for trusting us with a hard season. The door is
          open if you ever want to come back.
        </p>
        <div className="mt-8 flex gap-3">
          <LinkButton href="/" variant="secondary">Home</LinkButton>
          <LinkButton href="/crisis" variant="quiet">Crisis resources</LinkButton>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
