import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getChildren, getEntries, getSelectedChild, getTimeZone } from "@/lib/data";
import { addDays, toDateStr } from "@/lib/time/zoned";
import { ChildSwitcher } from "@/components/app/ChildSwitcher";
import { ExportForm } from "@/components/app/ExportForm";
import { LinkButton } from "@/components/ui/Button";
import { ShareLinks } from "@/components/app/ShareLinks";
import { isPro } from "@/lib/pro";
import { createClient } from "@/lib/supabase/server";

export default async function ExportPage() {
  const user = await requireUser("/app/export");
  const children = await getChildren();
  if (children.length === 0) {
    return (
      <main id="main" className="mx-auto w-full max-w-lg px-5 pt-10">
        <h1 className="text-[2rem]">Export</h1>
        <p className="mt-4 text-ink-soft">Add a child and log a few things first. Then your PDF will be waiting here.</p>
        <div className="mt-6"><LinkButton href="/app" variant="primary">Go to the tracker</LinkButton></div>
      </main>
    );
  }
  const child = (await getSelectedChild(children))!;
  const tz = await getTimeZone();
  const today = toDateStr(new Date(), tz);
  const first = await getEntries(child.id, { limit: 1 });
  const hasEntries = first.length > 0;
  const pro = await isPro(user.id);
  const supabase = await createClient();
  const { data: links } = child.role === "owner"
    ? await supabase
        .from("share_links")
        .select("id, range_start, range_end, expires_at")
        .eq("child_id", child.id)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main id="main" className="mx-auto w-full max-w-lg px-5 pt-4 sm:pt-10">
      <ChildSwitcher items={children} selectedId={child.id} />
      <h1 className="mt-6 text-[clamp(1.9rem,1.5rem+1.5vw,2.6rem)]">Export</h1>
      <p className="mt-3 text-ink-soft">
        A clean PDF, one page per week, with simple counts at the end. Or a CSV for a spreadsheet.
        Free for everyone, always.
      </p>

      <div className="mt-8">
        <ExportForm childId={child.id} today={today} defaultFrom={addDays(today, -27)} hasEntries={hasEntries} isPro={pro} />
      </div>

      {child.role === "owner" ? (
        <ShareLinks childId={child.id} from={addDays(today, -27)} to={today} links={links ?? []} isPro={pro} />
      ) : null}

      <section className="mt-12 space-y-3 text-[15px] text-ink-soft">
        <h2 className="text-[1.2rem] text-ink">What&apos;s inside</h2>
        <ul className="space-y-2 [&_li]:ml-5 [&_li]:list-disc">
          <li>Each entry: date and time, what you noticed, right before, right after, how long, intensity, and your note.</li>
          <li>Counts by what was noticed, by what happened right before, and by what happened right after.</li>
          <li>Counts only. The report never says why. That part belongs to you and the professionals you choose.</li>
        </ul>
        <p className="pt-2 text-[14px] text-ink-mute">
          Want everything in one file? Settings has a full JSON export of your account.{" "}
          <Link href="/app/settings" className="underline">Go to Settings</Link>.
        </p>
      </section>
    </main>
  );
}
