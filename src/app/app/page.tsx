import { requireUser } from "@/lib/auth";
import { getBehaviors, getChildren, getProfile, getRecentEntries, getSelectedChild } from "@/lib/data";
import { Onboarding } from "@/components/app/Onboarding";
import { ChildSwitcher } from "@/components/app/ChildSwitcher";
import { LogHome } from "@/components/app/LogHome";

export default async function AppHome({ searchParams }: { searchParams: Promise<{ joined?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser("/app");
  const children = await getChildren();
  if (children.length === 0) {
    const profile = await getProfile();
    return <Onboarding displayName={profile?.display_name ?? null} />;
  }
  const child = (await getSelectedChild(children))!;
  const [behaviors, recent] = await Promise.all([
    getBehaviors(child.id),
    getRecentEntries(child.id),
  ]);

  return (
    <main id="main" className="mx-auto w-full max-w-lg px-5 pt-4 sm:pt-10">
      <ChildSwitcher items={children} selectedId={child.id} />
      {sp.joined ? (
        <p role="status" className="mt-4 rounded-md bg-sage-tint px-4 py-3 text-[15px]">
          You now share {child.nickname}&apos;s record. Anything you log here is visible to the owner too.
        </p>
      ) : null}
      <h1 className="mt-6 text-[clamp(1.9rem,1.5rem+1.5vw,2.6rem)]">
        {children.length > 1 ? child.nickname : `How's ${child.nickname}?`}
      </h1>
      <LogHome
        childId={child.id}
        childNickname={child.nickname}
        userId={user.id}
        behaviors={behaviors}
        recentEntries={recent}
      />
    </main>
  );
}
