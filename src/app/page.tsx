import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "The Support Shelf — a calm way to note what happened",
  description:
    "A free, private tracker for parents of autistic children. Log what you noticed in three taps, then hand a clear PDF to the people who help.",
};

// Static marketing page. Session-aware choices happen on /sign-in, which
// forwards signed-in visitors straight to /app.
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-5 pb-[var(--section-y)] pt-10 sm:px-8 sm:pt-20">
          <div className="max-w-[24ch]">
            <h1>
              Note what happened. <span className="display-italic">Breathe.</span>
            </h1>
          </div>
          <p className="mt-7 max-w-[46ch] text-[1.15rem] text-ink-soft sm:text-[1.3rem]">
            A free, private tracker for parents of autistic children. Three taps to record what you
            noticed, and a clean PDF to hand to the people who help.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LinkButton href="/sign-in" variant="primary" size="lg">
              Start tracking — free
            </LinkButton>
            <p className="text-[15px] text-ink-mute sm:ml-3">
              No card. Nickname only. Export or delete anytime.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-[var(--section-y)] sm:px-8">
          <div className="shelf-edge pb-10">
            <div className="grid gap-8 md:grid-cols-3">
              <Plank title="Record" body="One question at a time: what you noticed, what was happening right before, what happened right after." />
              <Plank title="Export" body="A tidy PDF or CSV, one page per week, with simple counts. Free for everyone, always." />
              <Plank title="Hand it over" body="Your child's BCBA, pediatrician, or teacher gets facts in their language, not a stack of notes." />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-[var(--section-y)] sm:px-8">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2>We don&apos;t give advice.</h2>
              <p className="mt-5 text-ink-soft">
                We help you see what&apos;s happening and hand clear information to the people who
                do. Nothing here diagnoses, interprets, or tells you how to parent. It records what
                was observable, in your words, and keeps it yours.
              </p>
            </div>
            <div className="space-y-4 text-ink-soft">
              <p>
                <strong className="text-ink">I&apos;m an RBT.</strong> I&apos;ve spent three years
                on the floor with kids and in the hallway with their parents. This is the tool I
                wished those parents had.
              </p>
              <p className="text-[14px] text-ink-mute">
                A Registered Behavior Technician works under a BCBA&apos;s supervision. This is a
                parent-made tool, not a clinical service.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Plank({ title, body }: { title: string; body: string }) {
  return (
    <div className="lift rounded-lg bg-paper p-6 shadow-shelf">
      <h3>{title}</h3>
      <p className="mt-3 text-[16px] text-ink-soft">{body}</p>
    </div>
  );
}
