import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Prose } from "@/components/site/Prose";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What The Support Shelf stores and what it doesn't, in plain language.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <Prose title="Privacy" lede="In plain language. This describes what the site actually does today.">
        <h2>The ABC logger stores nothing on our servers</h2>
        <p>
          Entries you log at <strong>/abc</strong> are saved in your own browser&apos;s storage on your own device. They are never sent to
          us, and we have no way to read them. Clearing your browser data, or using a different browser or device, means the
          entries aren&apos;t there. Export first if you want to keep them.
        </p>
        <p>
          The one exception is the &ldquo;Email me my export&rdquo; button. When you press it, the entries you&apos;ve chosen are sent to our
          server once, turned into a PDF, emailed to the address you typed, and discarded. We keep the email address so we can
          send it, and, if you leave the box ticked, to write to you about new downloads. We don&apos;t keep the entries.
        </p>

        <h2>Shopping</h2>
        <p>
          The shelf is run on Shopify. When you check out, Shopify handles your name, email, and payment under its own privacy
          policy; we see the order so we can help with it. We never see your card details. Your cart is remembered with one cookie
          on this site.
        </p>

        <h2>Email list</h2>
        <p>If you give us your email, it&apos;s stored with Resend, the service that sends our mail. Every email has an unsubscribe link.</p>

        <h2>What we don&apos;t do</h2>
        <ul>
          <li>No advertising trackers.</li>
          <li>No analytics on anything you log.</li>
          <li>No selling or sharing of your information.</li>
          <li>No accounts, no passwords, nothing about your child on our servers.</li>
        </ul>

        <h2>Questions</h2>
        <p>Email or call us using the details in the footer. A person answers.</p>

        <p className="text-[14px] text-ink-mute">This page has not yet been reviewed by a lawyer.</p>
      </Prose>
      <SiteFooter />
    </>
  );
}
