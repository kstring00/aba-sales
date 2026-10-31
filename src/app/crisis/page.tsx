import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Crisis resources",
  description: "Phone and text lines for parents and caregivers in the US, plus who to call on your child's team. Resources only, no account needed.",
};

export const dynamic = "force-static";

/** Resources only. No advice, no instructions. */
export default function CrisisPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
        <h1 className="text-[clamp(2.2rem,1.6rem+2vw,3.6rem)]">Crisis resources</h1>
        <p className="mt-5 text-[1.15rem] text-ink-soft">
          These are the people to reach. No account needed. Numbers are for the United States.
        </p>

        <div className="mt-10 space-y-4">
          <Line title="Immediate danger or a medical emergency" action="Call 911" href="tel:911" body="Emergency services, 24/7." />
          <Line title="Suicide and mental health crisis" action="Call or text 988" href="tel:988" body="988 Suicide & Crisis Lifeline. 24/7. Press 1 for veterans, 2 for Spanish." site={{ label: "Chat at 988lifeline.org", href: "https://988lifeline.org/" }} />
          <Line title="Worried about a child's safety, including your own ability to cope" action="Call 1-800-422-4453" href="tel:18004224453" body="Childhelp National Child Abuse Hotline. Counselors, 24/7, in 170 languages." site={{ label: "childhelphotline.org", href: "https://childhelphotline.org/" }} />
          <Line title="Prefer to text" action="Text HOME to 741741" href="sms:741741&body=HOME" body="Crisis Text Line. Free, 24/7." />
          <Line title="Local services and support lines" action="Call 211" href="tel:211" body="211 connects you with local health and human services, including respite and family support, in most of the US." />
        </div>

        <section className="mt-14" aria-labelledby="team-h">
          <h2 id="team-h">Your child&apos;s team</h2>
          <ul className="mt-4 space-y-3 text-ink-soft">
            <li><strong className="text-ink">Your child&apos;s BCBA</strong> for anything about the behavior plan or what you&apos;re recording.</li>
            <li><strong className="text-ink">Your child&apos;s pediatrician</strong> for health concerns, sleep, eating, or medication questions.</li>
            <li><strong className="text-ink">Your clinic&apos;s after-hours line</strong>, if they have one. It&apos;s usually on your intake paperwork.</li>
          </ul>
        </section>

        <p className="mt-14 text-[14px] text-ink-mute">
          This website can&apos;t send help and nobody here monitors messages. The lines above can. Outside the US, your country&apos;s emergency number is the fastest route.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

function Line({ title, action, href, body, site }: { title: string; action: string; href: string; body: string; site?: { label: string; href: string } }) {
  return (
    <div className="rounded-lg bg-paper p-6 shadow-soft">
      <h2 className="text-[1.25rem] leading-snug">{title}</h2>
      <a href={href} className="lift mt-4 inline-flex min-h-14 items-center rounded-pill bg-ink px-6 text-[17px] font-medium text-paper hover:bg-ink-soft">{action}</a>
      <p className="mt-4 text-[15px] text-ink-soft">
        {body}
        {site ? (
          <>
            {" "}
            <a href={site.href} target="_blank" rel="noopener" className="text-ink underline underline-offset-4">{site.label}</a>.
          </>
        ) : null}
      </p>
    </div>
  );
}
