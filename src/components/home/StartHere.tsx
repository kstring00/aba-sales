import Link from "next/link";
import { hubSections } from "@/lib/content/pages";
import { ui } from "@/lib/content/data";
import { D } from "@/components/home/drawer-icons";

/** Four doors under the hero. Each appears only when its section is visible; the strip hides entirely when none is. */
export function StartHere() {
  const doors = hubSections().filter((s) => s.visible);
  if (doors.length === 0) return null;
  const line = ui.startHere.doors as Record<string, string>;
  return (
    <section aria-labelledby="start-here-h" className="py-8 sm:py-12">
      <p id="start-here-h" className="sd-eyebrow">{ui.startHere.eyebrow}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {doors.map((d) => (
          <li key={d.key}>
            <Link href={d.href} className="paper-card lift group flex h-full min-h-24 flex-col justify-between gap-3 p-5 no-underline hover:shadow-lift">
              <span className="font-display text-[1.35rem] leading-tight text-heading">{d.title}</span>
              <span className="flex items-end justify-between gap-3 text-[14.5px] text-ink-soft">
                {line[d.key]}
                <D.arrow className="h-4 w-4 shrink-0 text-accent-text transition-transform group-hover:translate-x-0.5" />
              </span>
              {!d.published ? <span className="self-start rounded-pill bg-honey-soft px-2 py-0.5 text-[12px] text-ink">{d.status}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
