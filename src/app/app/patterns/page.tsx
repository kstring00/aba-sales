import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isPro } from "@/lib/pro";
import { getChildren, getEntries, getSelectedChild, getTimeZone } from "@/lib/data";
import { addDays, toDateStr, zonedEndOfDay, zonedStartOfDay } from "@/lib/time/zoned";
import { buildPatterns } from "@/lib/patterns";
import { sampleEntries } from "@/lib/export/fixtures";
import { ChildSwitcher } from "@/components/app/ChildSwitcher";
import { PatternsView } from "@/components/app/PatternsView";
import { LinkButton } from "@/components/ui/Button";

const RANGES = [
  { days: 28, label: "Last 4 weeks" },
  { days: 90, label: "Last 3 months" },
];

export default async function PatternsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const user = await requireUser("/app/patterns");
  const [children, pro] = await Promise.all([getChildren(), isPro(user.id)]);
  const sp = await searchParams;
  const days = RANGES.some((r) => String(r.days) === sp.days) ? Number(sp.days) : 28;

  if (children.length === 0) {
    return (
      <main id="main" className="mx-auto w-full max-w-lg px-5 pt-10">
        <h1 className="text-[2rem]">Patterns</h1>
        <p className="mt-4 text-ink-soft">Add a child and log a few things first.</p>
        <div className="mt-6"><LinkButton href="/app" variant="primary">Go to the tracker</LinkButton></div>
      </main>
    );
  }
  const child = (await getSelectedChild(children))!;
  const tz = await getTimeZone();
  const today = toDateStr(new Date(), tz);
  const from = addDays(today, -(days - 1));

  // Free accounts see a blurred preview built from synthetic data, never
  // their own, so nothing about the child leaks through the blur.
  const entries = pro
    ? await getEntries(child.id, { from: zonedStartOfDay(from, tz), to: zonedEndOfDay(today, tz), limit: 5000 })
    : sampleEntries("2026-03-02T06:00:00Z", 28);
  const patterns = buildPatterns(entries, tz);

  return (
    <main id="main" className="mx-auto w-full max-w-lg px-5 pt-4 sm:pt-10">
      <ChildSwitcher items={children} selectedId={child.id} />
      <h1 className="mt-6 text-[clamp(1.9rem,1.5rem+1.5vw,2.6rem)]">Patterns</h1>
      <p className="mt-3 text-ink-soft">
        {pro ? `When and around what ${child.nickname}'s entries were recorded. Counts only.` : "A clearer view of when and around what entries happen. Counts only, never conclusions."}
      </p>

      {pro ? (
        <div className="mt-5 flex gap-2">
          {RANGES.map((r) => (
            <Link
              key={r.days}
              href={`/app/patterns?days=${r.days}`}
              className={`lift min-h-11 rounded-pill border px-4 text-[15px] leading-[44px] ${
                r.days === days ? "border-ink bg-ink text-paper" : "border-line-strong bg-paper text-ink-soft"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="relative mt-8">
        <div className={pro ? "" : "pointer-events-none select-none blur-[6px]"} aria-hidden={!pro}>
          <PatternsView p={patterns} nickname={pro ? child.nickname : "Bean"} />
        </div>
        {!pro ? (
          <div className="absolute inset-0 flex items-start justify-center pt-16">
            <div className="mx-4 max-w-sm rounded-lg bg-paper p-6 text-center shadow-lift">
              <h2 className="text-[1.3rem]">Patterns are part of Pro</h2>
              <p className="mt-2 text-[15px] text-ink-soft">
                By time of day, by what happened right before, and by day of week. Still just counts. $6 a month, or $49 a year.
              </p>
              <div className="mt-5">
                <LinkButton href="/app/settings#plan" variant="primary" size="lg">See what Pro includes</LinkButton>
              </div>
              <p className="mt-3 text-[13px] text-ink-mute">This preview uses made-up data, not your entries.</p>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
