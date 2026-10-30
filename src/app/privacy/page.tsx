import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Prose } from "@/components/site/Prose";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How The Support Shelf handles your information, in plain language.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <Prose
        title="Privacy"
        lede="In plain language. This page describes what the product actually does today. It has not yet been reviewed by a lawyer."
      >
        <p className="rounded-md bg-sage-tint px-4 py-3 text-[15px] text-ink">
          TODO (founder): legal review for consumer privacy, health-app, and child-protection
          obligations before public launch.
        </p>

        <h2>What we store</h2>
        <ul>
          <li>Your email address, so you can sign in.</li>
          <li>A nickname for each child. Never a full name, date of birth, or photo.</li>
          <li>The observations you log: what you noticed, what happened right before and after, optional duration, intensity, and notes you write.</li>
          <li>If you subscribe to Pro, a Stripe customer ID and subscription status. Stripe holds your card details; we never see them.</li>
          <li>If you join the email list, your email and where you signed up.</li>
        </ul>

        <h2>Who can see it</h2>
        <p>
          You, and any caregiver you personally invite. Access is enforced by database rules on
          every row, not just by the app&apos;s screens. Our hosting providers (Supabase for the
          database, Vercel for the website) store the data on our behalf and are bound by their own
          security and processing terms. We don&apos;t read your entries, and we don&apos;t run
          analytics on them.
        </p>

        <h2>What we don&apos;t do</h2>
        <ul>
          <li>No advertising trackers on signed-in pages.</li>
          <li>No analytics on entry content.</li>
          <li>No selling or sharing data with third parties for marketing.</li>
          <li>No sending your observations to any AI service without your explicit, specific consent for that specific data.</li>
        </ul>

        <h2>Export and deletion</h2>
        <p>
          You can export everything as PDF, CSV, or JSON from Settings, free, at any time. You can
          delete your account from Settings. Deletion is immediate and permanent: your children,
          entries, invites, and profile are removed from the live database. Backups kept by our
          hosting provider age out within 30 days.
        </p>

        <h2>Retention</h2>
        <p>We keep your data for as long as your account exists. Sign-in sessions expire automatically.</p>

        <h2>Cookies</h2>
        <p>Only the cookie that keeps you signed in. Nothing for advertising.</p>

        <h2>Questions</h2>
        <p>Write to us from the contact page. A person answers.</p>
      </Prose>
      <SiteFooter />
    </>
  );
}
