import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactForm } from "./ContactForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to the person who makes The Support Shelf.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">Say hello</h1>
        <p className="mt-5 text-[1.15rem] text-ink-soft">
          Questions, something broken, a word that doesn&apos;t sit right. A person reads every
          message.
        </p>
        <p className="mt-4 text-[15px] text-ink-mute">
          If you or your child are in danger right now, please use the{" "}
          <Link href="/crisis" className="underline">crisis resources</Link> instead. This form
          isn&apos;t monitored around the clock.
        </p>
        <div className="mt-10 max-w-xl">
          <ContactForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
