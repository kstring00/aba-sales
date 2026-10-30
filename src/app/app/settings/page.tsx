import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getBehaviors, getChildren, getSelectedChild } from "@/lib/data";
import { ChildrenSettings } from "@/components/app/settings/ChildrenSettings";
import { BehaviorSettings } from "@/components/app/settings/BehaviorSettings";
import { YourData } from "@/components/app/settings/DangerZone";
import { SignOutButton } from "@/components/app/SignOutButton";
import { PlanSection } from "@/components/app/settings/PlanSection";
import { CaregiversSection, type CaregiverInfo, type InviteInfo } from "@/components/app/settings/CaregiversSection";
import { isPro } from "@/lib/pro";
import { stripeConfigured } from "@/lib/billing/stripe";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string; billing?: string }> }) {
  const user = await requireUser("/app/settings");
  const sp = await searchParams;
  const children = await getChildren();
  const selected = await getSelectedChild(children);
  const behaviors = selected ? await getBehaviors(selected.id, true) : [];
  const pro = await isPro(user.id);
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end, price_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let caregivers: CaregiverInfo[] = [];
  let invites: InviteInfo[] = [];
  if (selected) {
    const { data: links } = await supabase.from("child_caregivers").select("user_id, role").eq("child_id", selected.id);
    const ids = (links ?? []).map((l) => l.user_id);
    const { data: profiles } = ids.length ? await supabase.from("profiles").select("id, display_name").in("id", ids) : { data: [] };
    caregivers = (links ?? []).map((l) => ({
      user_id: l.user_id,
      role: l.role,
      display_name: profiles?.find((p) => p.id === l.user_id)?.display_name ?? null,
      isYou: l.user_id === user.id,
    }));
    if (selected.role === "owner") {
      const { data: inv } = await supabase
        .from("caregiver_invites")
        .select("id, email, expires_at")
        .eq("child_id", selected.id)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString());
      invites = inv ?? [];
    }
  }

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
        <ChildrenSettings items={children} />
      </Section>

      {selected ? (
        <Section title={`What you track for ${selected.nickname}`}>
          <BehaviorSettings childId={selected.id} behaviors={behaviors} />
        </Section>
      ) : null}

      {selected ? (
        <Section title={`Who can see ${selected.nickname}`}>
          <CaregiversSection child={selected} caregivers={caregivers} invites={invites} isPro={pro} />
        </Section>
      ) : null}

      <Section title="Plan">
        <PlanSection isPro={pro} subscription={subscription} stripeReady={stripeConfigured()} notice={sp.billing} />
      </Section>

      <Section title="Your data">
        <YourData userId={user.id} />
      </Section>

      <Section title="Account">
        <SignOutButton userId={user.id} />
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
