import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getBehaviors, getChildren, getSelectedChild } from "@/lib/data";
import { ChildrenSettings } from "@/components/app/settings/ChildrenSettings";
import { BehaviorSettings } from "@/components/app/settings/BehaviorSettings";
import { signOut } from "@/app/app/actions";
import { Button } from "@/components/ui/Button";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  const user = await requireUser("/app/settings");
  const sp = await searchParams;
  const children = await getChildren();
  const selected = await getSelectedChild(children);
  const behaviors = selected ? await getBehaviors(selected.id, true) : [];

  return (
    <main id="main" className="mx-auto w-full max-w-lg px-5 pt-4 sm:pt-10">
      <h1 className="text-[clamp(1.9rem,1.5rem+1.5vw,2.6rem)]">Settings</h1>
      <p className="mt-2 text-[15px] text-ink-mute">{user.email}</p>

      {sp.error === "confirm" ? (
        <p role="alert" className="mt-5 rounded-md bg-sage-tint px-4 py-3 text-[15px]">
          The nickname you typed didn&apos;t match, so nothing was deleted.
        </p>
      ) : null}
      {sp.deleted === "child" ? (
        <p role="status" className="mt-5 rounded-md bg-sage-tint px-4 py-3 text-[15px]">
          Deleted. Those entries are gone for good.
        </p>
      ) : null}

      <Section title="Children">
        <ChildrenSettings children={children} userId={user.id} />
      </Section>

      {selected ? (
        <Section title={`What you track for ${selected.nickname}`}>
          <BehaviorSettings childId={selected.id} behaviors={behaviors} />
        </Section>
      ) : null}

      <Section title="Your data">
        <p className="text-[15px] text-ink-soft">
          Export everything or delete your account from here. Both arrive in the next milestone.
        </p>
      </Section>

      <Section title="Account">
        <form action={signOut}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
        <p className="mt-4 text-[14px] text-ink-mute">
          Questions? <Link href="/contact" className="underline">Write to us</Link>. Read the{" "}
          <Link href="/privacy" className="underline">privacy page</Link>.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-[1.3rem]">{title}</h2>
      {children}
    </section>
  );
}
