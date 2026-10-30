import { EmailCapture } from "@/components/shop/EmailCapture";
import { Waves, Sun } from "@/components/illustrations/Shapes";

const WORKING_ON = [
  { title: "Home routine collection", body: "Customizable, easy-to-read routine templates for mornings, bedtimes, and transitions." },
  { title: "Appointment preparation kit", body: "A place to gather observations and the questions you want to ask before a meeting." },
  { title: "The Clinic Shelf", body: "Onboarding packets and family-communication templates for practices." },
];

/**
 * Section six. A launch invitation, not a form in a white box. Describes
 * what's being worked toward without dates or false readiness.
 */
export function Upcoming() {
  return (
    <section id="upcoming" className="relative scroll-mt-20 overflow-hidden bg-teal text-white" aria-labelledby="up-h">
      <Waves className="absolute inset-x-0 top-0 h-16 w-full rotate-180 opacity-60 md:h-24" />
      <Sun className="pointer-events-none absolute -bottom-32 -left-24 w-[26rem] opacity-40" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-[var(--section-y)] pt-[calc(var(--section-y)+2rem)] sm:px-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-20">
        <div>
          <p className="text-[13px] uppercase tracking-[0.2em] text-glass">Upcoming</p>
          <h2 id="up-h" className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.6rem)] !text-white">The shelf is growing. There&apos;s more support on the <span className="display-italic text-sun">way.</span></h2>
          <p className="mt-5 max-w-[46ch] text-white/85">These are in the works. No dates yet, and nothing here is for sale until it&apos;s finished and you can see every page.</p>
          <ul className="mt-8 space-y-3">
            {WORKING_ON.map((w) => (
              <li key={w.title} className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="font-display text-[1.2rem] text-white">{w.title}</p>
                <p className="mt-1 text-[15px] text-white">{w.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[28px] bg-white p-7 text-ink shadow-lift sm:p-9 lg:self-center">
          <h3>Hear about it once.</h3>
          <p className="mt-2 text-[15px] text-ink-soft">One email when something new is ready. No streaks, no countdowns, unsubscribe any time.</p>
          <div className="mt-5"><EmailCapture source="shelf-upcoming" cta="Keep me posted" /></div>
        </div>
      </div>
    </section>
  );
}
