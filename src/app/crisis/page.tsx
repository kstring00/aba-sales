import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ui, visibleResources, type Resource } from "@/lib/content/data";

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
          {visibleResources("crisis").map((r) => (
            <Line key={r.id} r={r} />
          ))}
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

function Line({ r }: { r: Resource }) {
  return (
    <div className="rounded-lg bg-paper p-6 shadow-soft">
      <h2 className="text-[1.25rem] leading-snug">{r.title}</h2>
      {r.action ? <a href={r.action.href} className="lift mt-4 inline-flex min-h-14 items-center rounded-pill bg-ink px-6 text-[17px] font-medium text-paper hover:bg-ink-soft">{r.action.label}</a> : null}
      <p className="mt-4 text-[15px] text-ink-soft">
        {r.whatFor}
        {r.url ? (
          <>
            {" "}
            <a href={r.url.href} target="_blank" rel="noopener" className="text-ink underline underline-offset-4">{r.url.label}</a>.
          </>
        ) : null}
      </p>
      <p className="mt-2 text-[13px] text-ink-mute">{ui.resources.notAffiliated}</p>
    </div>
  );
}
