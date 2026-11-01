import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { UnsubscribeForm } from "@/components/site/UnsubscribeForm";
import { verifyUnsubscribe } from "@/lib/email/unsubscribe";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

/** Where the link in every list email lands. Asks before acting, so mail scanners that open links can't unsubscribe anyone. */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const email = (typeof q.e === "string" ? q.e : "").trim().toLowerCase();
  const token = typeof q.t === "string" ? q.t : "";
  const valid = verifyUnsubscribe(email, token);
  const contact = publicEnv.contactEmail;
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-xl flex-1 px-5 pb-24 pt-10 sm:px-8">
        <h1 className="text-[clamp(2.2rem,1.8rem+2vw,3.2rem)]">Unsubscribe</h1>
        <div className="mt-6">
          {valid ? (
            <UnsubscribeForm email={email} token={token} contactEmail={contact} />
          ) : (
            <p className="text-[1.05rem] text-ink-body">
              This link doesn&apos;t look complete. Email <a href={`mailto:${contact}?subject=Unsubscribe`} className="text-heading underline underline-offset-4">{contact}</a> and a person will take you off the list.
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
