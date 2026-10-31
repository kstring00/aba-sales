import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Prose } from "@/components/site/Prose";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description: "Who makes The Support Shelf, and what it is and isn't.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <Prose title="About the shelf" lede="Practical tools. Kinder days. Brighter tomorrows.">
        <p>
          <strong>I&apos;m a Registered Behavior Technician.</strong> I&apos;ve spent three years on the floor with kids in ABA
          therapy and in the hallway with their parents. Most of what families and small clinics need isn&apos;t complicated:
          a routine that&apos;s clear enough to follow at 7 a.m., a welcome packet that doesn&apos;t look like a tax form, a way to
          write down what happened without being told what it means.
        </p>
        <p>That&apos;s what&apos;s on this shelf.</p>

        <h2>What this is</h2>
        <ul>
          <li>Printable and editable downloads for homes and clinics.</li>
          <li>A free ABC observation logger that keeps everything on your own phone.</li>
          <li>Plain language, calm design, and nothing that talks down to you.</li>
        </ul>

        <h2>What this is not</h2>
        <ul>
          <li>Not treatment. No download or tool here tells you what to do about a behavior.</li>
          <li>Not a clinic or a provider. Your child&apos;s team makes the clinical calls.</li>
          <li>Not a place that collects your child&apos;s information. See the privacy page.</li>
        </ul>

        <h2 id="how-it-works">How it works</h2>
        <ol>
          <li>Pick a shelf: Get Organized, Make a Plan, Everyday Life, or Support at Home.</li>
          <li>Open a tool. Free ones download right away; paid ones check out through Shopify and arrive by email within a minute.</li>
          <li>Print it, fill it in, and bring it to your next meeting. The free ABC logger works on your phone and keeps everything on your device.</li>
        </ol>

        <h2>Credentials</h2>
        <p>
          Written by a Registered Behavior Technician (RBT) with three years in-clinic. An RBT works under the supervision of a
          Board Certified Behavior Analyst (BCBA).
        </p>

        <div className="pt-4">
          <LinkButton href="/shelf" variant="primary" size="lg">Browse the shelves</LinkButton>
        </div>
      </Prose>
      <SiteFooter />
    </>
  );
}
