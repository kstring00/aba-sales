import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Prose } from "@/components/site/Prose";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What The Support Shelf stores and what it doesn't, in plain language.",
};

/** Keep this date current whenever the text below changes. */
const LAST_UPDATED = "November 1, 2026";

export default function PrivacyPage() {
  const email = publicEnv.contactEmail;
  return (
    <>
      <SiteHeader />
      <Prose title="Privacy" lede="In plain language. This describes what the site actually does today.">
        <p className="!mt-0 text-[14px] text-ink-mute">Last updated {LAST_UPDATED}. Version 4.</p>

        <h2>The ABC tracker stores nothing on our servers</h2>
        <p>
          Entries you log at <strong>/abc</strong> are saved in your own browser&apos;s storage on your own device. They are never sent to
          us, and we have no way to read them. Clearing your browser data, or using a different browser or device, means the
          entries aren&apos;t there. Export first if you want to keep them.
        </p>

        <h2>&ldquo;Email me my export&rdquo;, step by step</h2>
        <p>This is the one place your entries touch our infrastructure, and only when you press the button:</p>
        <ol>
          <li>Your browser sends the entries once, over HTTPS, to our server.</li>
          <li>The server builds the same PDF you can download on the page.</li>
          <li>The PDF is emailed to the address you typed, through Resend, the service that sends our mail.</li>
          <li>The entries are discarded as soon as the email is handed off. Nothing is written to a database or a log.</li>
        </ol>
        <p>
          Your email address is used only to send that export. Sending an export never adds you to our email list. If you tick
          the optional box, the address is also kept on the list to tell you when new downloads reach the shelf; that box is off
          unless you turn it on.
        </p>

        <h2>Shopping</h2>
        <p>
          The shelf is run on Shopify. When you get a download, free or paid, Shopify&apos;s checkout handles your name and email,
          and for paid items your payment, under Shopify&apos;s own privacy policy. Free items use the same checkout with no card.
          We see the order so we can help with it; we never see card details. Your cart is remembered with one cookie on this
          site, set only after you add something.
        </p>

        <h2>Email list</h2>
        <p>
          You&apos;re on the list only if you asked to be: by signing up on a shelf, or by ticking the box when you email yourself
          an export. The list is kept with Resend, along with which of those forms you used. Nothing else about you is stored.
          Signing up on a shelf sends one email right away to confirm it; after that, a few emails a year at most.
        </p>
        <p>
          Every email sent to the list, including that confirmation, has an unsubscribe link, and unsubscribing stops them. To have your address deleted
          entirely, email us (below). Replies to any of our emails reach a person.
        </p>

        <h2>What we don&apos;t do</h2>
        <ul>
          <li>No advertising trackers.</li>
          <li>No analytics on anything you log.</li>
          <li>No selling or sharing of your information.</li>
          <li>No accounts, no passwords, nothing about your child on our servers.</li>
        </ul>

        <h2>Questions</h2>
        <p>
          Email <a href={`mailto:${email}`} className="text-ink underline underline-offset-4">{email}</a>. A person answers.
        </p>

        <p className="text-[14px] text-ink-mute">This is a plain-language summary of what the site does today; a formal policy is being prepared.</p>
      </Prose>
      <SiteFooter />
    </>
  );
}
