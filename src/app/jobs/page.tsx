import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { JobBoard } from "@/components/jobs/JobBoard";
import { formatChecked, getJobs } from "@/lib/jobs";
import { publicEnv } from "@/lib/env";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Jobs",
  description: "Hand-picked jobs and hiring programs for autistic and neurodivergent young adults, each with a plain reason it's on the list.",
};

const VR_URL = "https://twc.texas.gov/programs/vocational-rehabilitation/youth-students";

/**
 * Jobs and hiring programs for autistic and neurodivergent young adults,
 * written to them (the parent is the second reader). Every listing is
 * hand-picked in Shopify and says why it's here. We never take applications
 * or ask anyone to tell us anything about themselves: "Apply" goes straight
 * to the employer.
 */
export default async function JobsPage() {
  const jobs = await getJobs();
  const checked = Object.fromEntries(jobs.map((j) => [j.handle, formatChecked(j.checkedOn)]));
  const email = publicEnv.contactEmail;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <p className="kicker">Jobs</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2.2rem,1.6rem+2.2vw,3.8rem)]">
          Work that fits <em>how you work</em>.
        </h1>
        <p className="mt-5 max-w-[56ch] text-[1.1rem] text-ink-soft">
          Jobs and hiring programs for autistic and neurodivergent young adults. Each one is hand-picked, and each one says exactly why it&apos;s here: how the interview works, what the schedule is like, what support comes with it.
        </p>
        <p className="mt-3 max-w-[56ch] text-[15px] text-ink-mute">
          Helping someone look? Read the listings together. The &ldquo;why it&apos;s on the list&rdquo; part is the part to talk about.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-12">
          <section aria-label="Listings">
            {jobs.length ? (
              <JobBoard jobs={jobs} checked={checked} />
            ) : (
              <div className="paper-card p-6">
                <p className="text-[16px] text-ink">The first listings are being checked and will be here soon.</p>
                <p className="mt-2 text-[15px] text-ink-soft">Until then, the Texas Workforce counselors in the box on this page can help you look.</p>
              </div>
            )}
          </section>

          <aside className="space-y-5" aria-label="Before you apply">
            <section className="paper-card p-5">
              <h2 className="text-[1.15rem]">Before you apply</h2>
              <ul className="mt-3 space-y-3 text-[15px] text-ink-soft">
                <li><strong className="text-ink">Telling an employer is your choice.</strong> You decide if, when and how much to share. Nothing here asks you to.</li>
                <li><strong className="text-ink">You can ask for changes to the interview.</strong> More time, questions in writing, or a quieter room. Ask the recruiter before the day.</li>
                <li><strong className="text-ink">Apply on the employer&apos;s own site.</strong> We don&apos;t take applications or keep anything about you. If a listing ever asks you to pay to apply, don&apos;t.</li>
              </ul>
              <Link href="/learn/sensory-friendly-work" className="mt-3 inline-flex min-h-11 items-center text-[15px] font-medium text-ink underline underline-offset-4">What makes a job sensory-friendly</Link>
            </section>

            <section className="rounded-xl bg-sage-tint p-5">
              <h2 className="text-[1.15rem]">In Texas? Start with a counselor</h2>
              <p className="mt-2 text-[15px] text-ink-soft">
                Texas Workforce Solutions Vocational Rehabilitation helps students and young adults with disabilities find work: career counseling, job matching, paid summer jobs, and support once you&apos;re hired. It&apos;s free.
              </p>
              <a href={VR_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 text-[15px] font-medium text-ink underline underline-offset-4">
                How to get started<span className="sr-only"> (opens in a new tab)</span> <span aria-hidden>↗</span>
              </a>
            </section>

            <section className="paper-card p-5">
              <h2 className="text-[1.15rem]">Know a good employer?</h2>
              <p className="mt-2 text-[15px] text-ink-soft">Listings are hand-picked. If you know a workplace that does this well, tell us what makes it a good fit.</p>
              <a href={`mailto:${email}?subject=${encodeURIComponent("Job listing suggestion")}`} className="mt-3 inline-flex min-h-11 items-center text-[15px] font-medium text-ink underline underline-offset-4">
                Suggest a listing
              </a>
            </section>

            <p className="text-[13px] text-ink-mute">
              We check each listing by hand, but jobs change fast. Confirm the details with the employer. Listing a job isn&apos;t an endorsement of the employer.
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
