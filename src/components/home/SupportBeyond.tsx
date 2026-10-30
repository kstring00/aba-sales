import { Photo } from "@/components/site/Photo";
import { ASSETS } from "@/lib/assets";
import { ORGS } from "@/lib/resources";
import { AskForHelp } from "@/components/home/AskForHelp";

/**
 * Section six. Support comes from people too. Three honest pieces: a short,
 * checked directory; a small tool that helps a parent ask for one practical
 * thing; and a stories framework that waits for real stories.
 */
export function SupportBeyond() {
  return (
    <section id="people" className="mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-[var(--section-y)] sm:px-8" aria-labelledby="people-h">
      <div className="max-w-[40rem]">
        <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">More than files</p>
        <h2 id="people-h" className="mt-4 text-[clamp(2rem,1.4rem+2.2vw,3.4rem)]">Support can come from more than one place.</h2>
        <p className="mt-4 text-ink-soft">Relatives, other parents, your child&apos;s team, and organizations that have done this for decades. We don&apos;t run a community, and we won&apos;t pretend to. We can point.</p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div>
          <h3>Find your people</h3>
          <p className="mt-2 text-[15px] text-ink-mute">National organizations and parent networks. Each one checked by a person before it was listed; none are paid placements.</p>
          <ul className="mt-6 divide-y divide-line rounded-lg bg-paper shadow-soft">
            {ORGS.map((o) => (
              <li key={o.url} className="p-5">
                <a href={o.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <p className="text-[1.05rem] text-ink group-hover:underline group-hover:underline-offset-4">
                    {o.name} <span aria-hidden className="text-ink-mute">↗</span>
                  </p>
                  <p className="mt-1 text-[15px] text-ink-soft">{o.what}</p>
                  <p className="mt-1 text-[14px] text-ink-mute">{o.forWhom}</p>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-ink-mute">These links leave our site. Local parent groups vary a lot; your state&apos;s Parent Center and 211 are the fastest way to find what&apos;s near you.</p>
        </div>
        <div className="space-y-10">
          <Photo asset={ASSETS.humanSide2} sizes="(min-width: 1024px) 40vw, 100vw" className="hidden lg:block" />
          <AskForHelp />
        </div>
      </div>

      <div className="mt-16 grid gap-8 rounded-lg bg-paper p-8 shadow-soft lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">Stories from the shelf</p>
          <h3 className="mt-3">Real stories, when there are real stories.</h3>
        </div>
        <div className="text-ink-soft">
          <p>
            This space is for caregivers&apos; own accounts, published only with their informed permission and in their words. We don&apos;t have any yet,
            and we won&apos;t fill the gap with invented ones. Until then, here is one honest reflection from the person who made this shelf:
          </p>
          <blockquote className="mt-5 border-l-2 border-clay-warm pl-5 font-display text-[1.25rem] leading-snug text-ink">
            &ldquo;The parents I met weren&apos;t short on love or effort. They were short on time, on clear information, and on anyone saying: here, this part can be simpler.&rdquo;
          </blockquote>
          <p className="mt-3 text-[14px] text-ink-mute">The founder, a Registered Behavior Technician. Wording to be confirmed before launch.</p>
        </div>
      </div>
    </section>
  );
}
