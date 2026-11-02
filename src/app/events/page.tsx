import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EventList } from "@/components/events/EventList";
import { formatEventDate, getEvents } from "@/lib/events";
import { formatChecked } from "@/lib/jobs";
import { publicEnv } from "@/lib/env";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sensory-friendly outings in Houston",
  description: "Quieter hours, adapted shows and sensory-friendly events around Houston, each checked by hand with a plain note on what's different.",
};

/**
 * Houston outings with sensory-friendly hours or adaptations. Entries live in
 * Shopify (metaobject `event_listing`) so Kyle can add and retire them
 * without a deploy. Every card says what's actually different and links
 * straight to the venue; we never take bookings.
 */
export default async function EventsPage() {
  const events = await getEvents();
  const dates = Object.fromEntries(events.map((e) => [e.handle, formatEventDate(e.date)]));
  const checked = Object.fromEntries(events.map((e) => [e.handle, formatChecked(e.checkedOn)]));
  const email = publicEnv.contactEmail;

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <p className="kicker">Houston outings</p>
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2.2rem,1.6rem+2.2vw,3.8rem)]">
          Going out, <em>on easier terms</em>.
        </h1>
        <p className="mt-5 max-w-[56ch] text-[1.1rem] text-ink-soft">
          Sensory-friendly hours, adapted shows and quieter events around Houston. Each one is checked by hand, and each one says what&apos;s actually different: the lights, the sound, the crowd, the quiet room.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-12">
          <section aria-label="Outings">
            {events.length ? (
              <EventList events={events} dates={dates} checked={checked} />
            ) : (
              <div className="paper-card p-6">
                <p className="text-[16px] text-ink">The first outings are being checked and will be here soon.</p>
              </div>
            )}
          </section>

          <aside className="space-y-5" aria-label="Before you go">
            <section className="paper-card p-5">
              <h2 className="text-[1.15rem]">Before you go</h2>
              <ul className="mt-3 space-y-3 text-[15px] text-ink-soft">
                <li><strong className="text-ink">Check the date with the venue.</strong> Times and dates change. Many events need a free ticket or registration.</li>
                <li><strong className="text-ink">Show what will happen.</strong> Look at photos or a video of the place together, or make a First / Then card.</li>
                <li><strong className="text-ink">Plan the exit before you arrive</strong>, so leaving early is a choice, not a failure.</li>
                <li><strong className="text-ink">Bring what usually helps:</strong> headphones, a snack, a favorite object.</li>
              </ul>
            </section>

            <section className="rounded-xl bg-sage-tint p-5">
              <h2 className="text-[1.15rem]">Not sure what they&apos;d enjoy?</h2>
              <p className="mt-2 text-[15px] text-ink-soft">The Interest Explorer starts from what your child already loves and suggests things to try, at home or out.</p>
              <Link href="/interests" className="mt-3 inline-flex min-h-11 items-center text-[15px] font-medium text-ink underline underline-offset-4">Try the Interest Explorer</Link>
            </section>

            <section className="paper-card p-5">
              <h2 className="text-[1.15rem]">Know a good one?</h2>
              <p className="mt-2 text-[15px] text-ink-soft">If a Houston place runs sensory-friendly hours, tell us what&apos;s different about them.</p>
              <a href={`mailto:${email}?subject=${encodeURIComponent("Sensory-friendly outing suggestion")}`} className="mt-3 inline-flex min-h-11 items-center text-[15px] font-medium text-ink underline underline-offset-4">
                Suggest an outing
              </a>
            </section>

            <p className="text-[13px] text-ink-mute">
              We check each listing by hand, but details change. Confirm with the venue before you go. Listing an event isn&apos;t an endorsement.
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
