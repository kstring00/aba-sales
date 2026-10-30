import { requireUser } from "@/lib/auth";
import { getBehaviors, getChildren, getEntries, getSelectedChild, getTimeZone } from "@/lib/data";
import { addDays, isDateStr, toDateStr, zonedEndOfDay, zonedStartOfDay } from "@/lib/time/zoned";
import { ChildSwitcher } from "@/components/app/ChildSwitcher";
import { EntryList } from "@/components/app/EntryList";
import { EntryFilters } from "@/components/app/EntryFilters";
import { LinkButton } from "@/components/ui/Button";

type Search = { from?: string; to?: string; behavior?: string };

export default async function EntriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser("/app/entries");
  const children = await getChildren();
  if (children.length === 0) {
    return (
      <main id="main" className="mx-auto w-full max-w-lg px-5 pt-10">
        <h1 className="text-[2rem]">Entries</h1>
        <p className="mt-4 text-ink-soft">Add a child first and your entries will show up here.</p>
        <div className="mt-6"><LinkButton href="/app" variant="primary">Go to the tracker</LinkButton></div>
      </main>
    );
  }
  const child = (await getSelectedChild(children))!;
  const tz = await getTimeZone();
  const sp = await searchParams;
  const todayStr = toDateStr(new Date(), tz);
  const to = isDateStr(sp.to) ? sp.to : todayStr;
  const from = isDateStr(sp.from) ? sp.from : addDays(to, -6);
  const behaviorId = sp.behavior && /^[0-9a-f-]{36}$/.test(sp.behavior) ? sp.behavior : undefined;

  const [behaviors, entries] = await Promise.all([
    getBehaviors(child.id, true),
    getEntries(child.id, { from: zonedStartOfDay(from, tz), to: zonedEndOfDay(to, tz), behaviorId, limit: 1000 }),
  ]);

  return (
    <main id="main" className="mx-auto w-full max-w-lg px-5 pt-4 sm:pt-10">
      <ChildSwitcher items={children} selectedId={child.id} />
      <h1 className="mt-6 text-[clamp(1.9rem,1.5rem+1.5vw,2.6rem)]">Entries</h1>
      <div className="mt-5">
        <EntryFilters from={from} to={to} behaviorId={behaviorId} behaviors={behaviors} />
      </div>
      <p className="mt-4 text-[14px] text-ink-mute tnum">
        {entries.length} {entries.length === 1 ? "entry" : "entries"} for {child.nickname}
      </p>
      <div className="mt-4">
        <EntryList
          key={`${child.id}-${from}-${to}-${behaviorId ?? ""}-${entries.length}`}
          entries={entries}
          behaviors={behaviors}
          childId={child.id}
          userId={user.id}
          groupByDay
          emptyText="No entries in this range."
        />
      </div>
    </main>
  );
}
