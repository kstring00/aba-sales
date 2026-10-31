import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { HeroScene, IconArrow, IconHeart, IconLeaf, IconPeople } from "@/components/illustrations/Paper";

const MARKS = [
  { Icon: IconLeaf, label: "Practical tools" },
  { Icon: IconHeart, label: "Made by an RBT" },
  { Icon: IconPeople, label: "You're not alone" },
];

/**
 * Five-second test: who it's for, what it is, where to start. One terracotta
 * action (scroll to the shelves), one outlined (browse everything).
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-h" className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-10 pt-6 sm:px-8 lg:grid-cols-[minmax(0,11fr)_minmax(0,10fr)] lg:gap-6 lg:pb-16 lg:pt-10">
        <div>
          <p className="kicker">Real support for real family life</p>
          <h1 id="hero-h" className="mt-4">
            You don&apos;t have to find everything <em>all at once</em>.
          </h1>
          <p className="mt-6 max-w-[30rem] text-[1.1rem] leading-relaxed text-ink-soft sm:text-[1.2rem]">
            Practical, printable tools for parents and caregivers of kids in ABA therapy. Start wherever you are. There&apos;s a shelf for that.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#shelves" className={buttonClass("primary", "lg")}>
              Find my shelf <IconArrow className="h-5 w-5" />
            </a>
            <Link href="/shelf" className={buttonClass("secondary", "lg")}>
              Browse all support
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-ink-soft">
            {MARKS.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative -mx-2 sm:mx-0">
          <HeroScene className="h-auto w-full" />
          <p className="mt-2 text-center text-[13px] text-ink-mute lg:text-right">Tap a folder to open that shelf.</p>
        </div>
      </div>
    </section>
  );
}
