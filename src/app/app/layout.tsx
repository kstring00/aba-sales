import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/data";
import { AppShell } from "@/components/app/AppShell";
import { AdultGate } from "@/components/app/AdultGate";

export const metadata: Metadata = {
  title: "Tracker",
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/app");
  const profile = await getProfile();
  if (!profile?.adult_attested_at) {
    return <AdultGate />;
  }
  return <AppShell userId={user.id}>{children}</AppShell>;
}
