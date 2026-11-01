import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Prose } from "@/components/site/Prose";
import { LinkButton } from "@/components/ui/Button";
import { IconLeaf } from "@/components/illustrations/Paper";
import { FounderPhoto } from "@/components/site/FounderPhoto";
import { publicEnv } from "@/lib/env";

/** BACB certificant registry search. Operator: confirm this link resolves to the registry before launch. */
const BACB_REGISTRY = "https://www.bacb.com/services/o.php?page=101135";

export const metadata: Metadata = {
  title: "About",
  description: "A note from the founder of The Support Shelf, and what the shelf is and isn't.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <Prose title="About the shelf" lede="Practical tools. Kinder days. Brighter tomorrows.">
        <section id="founder" aria-labelledby="founder-h" className="scroll-mt-6">
          <h2 id="founder-h" className="!mt-4">A note from the founder</h2>
          <figure className="paper-card relative mt-6 p-6 sm:p-8">
            <IconLeaf className="absolute right-6 top-6 h-8 w-8 -rotate-12 opacity-80" />
            <blockquote className="space-y-4 text-[1.02rem] leading-relaxed text-ink-body">
              <p>
                Since becoming a Registered Behavior Technician in 2023, one of the things that has impacted me most isn&apos;t just the
                work I do with children. It&apos;s seeing how much their parents carry.
              </p>
              <p>
                I&apos;ve witnessed firsthand the stress, uncertainty, and overwhelming responsibilities that families navigate every day. The
                appointments, the questions, the difficult moments, and the constant effort to do what&apos;s best for their children.
              </p>
              <p>And what has stayed with me most is realizing how often parents carry those responsibilities feeling alone.</p>
              <p>
                I don&apos;t pretend to have all the answers, and I know I haven&apos;t experienced everything these families go through. But
                I&apos;ve seen enough to know that <strong>they deserve to feel seen, understood, and supported.</strong>
              </p>
              <p>That&apos;s why I created The Support Shelf.</p>
              <p>
                I wanted to extend the helping hand I offer in my work beyond the therapy room. To create thoughtful, practical resources that
                might make one responsibility a little easier, one question a little clearer, or one next step a little less overwhelming.
              </p>
              <p>
                <strong>
                  I may not be able to take away every challenge, but I can do my part to make sure families know they don&apos;t have to
                  navigate everything alone.
                </strong>
              </p>
              <p>That&apos;s what The Support Shelf means to me.</p>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-4 border-t border-line pt-4 text-[15px] text-ink-soft">
              <FounderPhoto />
              <span>
                <span className="hand block text-ink">Kyle Stringham</span>
                <span className="block">Founder, The Support Shelf</span>
                <span className="block">
                  Registered Behavior Technician since 2023 ·{" "}
                  <a href={BACB_REGISTRY} target="_blank" rel="noopener" className="text-ink underline underline-offset-4">BACB registry</a>
                </span>
              </span>
            </figcaption>
          </figure>
        </section>

        <h2>What this is not</h2>
        <ul>
          <li>Not treatment. No download or tool here tells you what to do about a behavior.</li>
          <li>Not a clinic or a provider. Your child&apos;s team makes the clinical calls.</li>
          <li>Not a place that collects your child&apos;s information. See the privacy page.</li>
        </ul>

        <h2 id="contact" className="scroll-mt-6">Contact</h2>
        <p>
          Email <a href={`mailto:${publicEnv.contactEmail}`} className="text-ink underline underline-offset-4">{publicEnv.contactEmail}</a>.
          A person answers, usually within a couple of days. No phone line yet.
        </p>

        <div className="pt-4">
          <LinkButton href="/shelf" variant="primary" size="lg">Browse the shelves</LinkButton>
        </div>
      </Prose>
      <SiteFooter />
    </>
  );
}
