import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Prose } from "@/components/site/Prose";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using The Support Shelf, in plain language.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <Prose title="Terms" lede="Plain language. Not yet reviewed by a lawyer.">
        <p className="rounded-md bg-sage-tint px-4 py-3 text-[15px] text-ink">
          TODO (founder): legal review before public launch.
        </p>

        <h2>What this is</h2>
        <p>
          The Support Shelf is an educational and organizational tool for parents and caregivers.
          It records observations you choose to record and helps you share them. It is not a
          medical device, a clinical service, a diagnostic tool, or a treatment program.
        </p>

        <h2>What it is not</h2>
        <ul>
          <li>It does not diagnose, infer why a behavior happened, predict behavior, or prescribe treatment.</li>
          <li>It is not a substitute for assessment or care from qualified professionals.</li>
          <li>It is not an emergency service. If someone is in danger, call 911 (US).</li>
        </ul>

        <h2>Who may use it</h2>
        <p>Adults, 18 or older, who are parents or caregivers. No accounts for children.</p>

        <h2>Your content</h2>
        <p>
          Your observations are yours. You grant us only the permission needed to store and display
          them to you and the caregivers you invite, and to produce the exports you request.
        </p>

        <h2>Pro</h2>
        <p>
          Pro is a monthly or yearly subscription billed through Stripe. You can cancel anytime from
          Settings and keep Pro until the end of the period you paid for. Everything essential,
          including logging and export, stays free whether or not you subscribe.
        </p>

        <h2>Digital downloads</h2>
        <p>
          Downloads sold on the shelf are delivered by Shopify after purchase. They are templates
          and educational materials, not individualized recommendations.
        </p>

        <h2>Liability</h2>
        <p>
          We provide the service as-is and do our best to keep it working and your data safe. We
          can&apos;t be responsible for decisions made based on information recorded or displayed
          here.
        </p>
      </Prose>
      <SiteFooter />
    </>
  );
}
