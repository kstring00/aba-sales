import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { looksLikeToken } from "@/lib/tokens";
import { acceptInvite } from "@/app/app/caregivers/actions";
import { Wordmark } from "@/components/ui/Logo";
import { Button, LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Caregiver invite", robots: { index: false, follow: false } };

const MESSAGES: Record<string, string> = {
  "different email": "This invite was sent to a different email address. Sign in with the address the owner invited, then open the link again.",
  expired: "This invite has expired. Ask the owner to send a new one.",
  "already used": "This invite was already used.",
  revoked: "This invite was withdrawn by the owner.",
  "not found": "We couldn't find that invite. Check the link and try again.",
  "already have access": "You already have access to this child.",
};

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const user = await getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/invite/${token}`)}`);

  const message = error ? (MESSAGES[error] ?? MESSAGES["not found"]) : !looksLikeToken(token) ? MESSAGES["not found"] : null;

  return (
    <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-6 sm:pt-12">
      <Wordmark />
      {message ? (
        <>
          <h1 className="mt-10 text-[clamp(2rem,1.6rem+1.5vw,2.8rem)]">About this invite</h1>
          <p className="mt-4 text-ink-soft">{message}</p>
        </>
      ) : (
        <>
          <h1 className="mt-10 text-[clamp(2rem,1.6rem+1.5vw,2.8rem)]">
            You&apos;ve been invited to <span className="display-italic">share</span> a record.
          </h1>
          <p className="mt-4 text-ink-soft">
            As a caregiver you&apos;ll see this child&apos;s entries and can log your own. The owner keeps control of
            the record: only they can rename, delete, invite, or remove.
          </p>
          <form action={acceptInvite} className="mt-8">
            <input type="hidden" name="token" value={token} />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Accept invite
            </Button>
          </form>
        </>
      )}
      <p className="mt-4 text-[14px] text-ink-mute">You&apos;re signed in as {user.email}.</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <LinkButton href="/app" variant="secondary">Go to the tracker</LinkButton>
        <form action="/auth/sign-out" method="post">
          <button type="submit" className="min-h-12 px-2 text-[15px] text-ink-soft underline">Sign out and switch accounts</button>
        </form>
      </div>
      <p className="mt-10 text-[14px] text-ink-mute">
        Need help? <Link href="/contact" className="underline">Write to us</Link>.
      </p>
    </main>
  );
}
