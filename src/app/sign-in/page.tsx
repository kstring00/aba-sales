import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/ui/Logo";
import { getUser } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/env";
import { SignInForm } from "./SignInForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to The Support Shelf with a magic link or Google.",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  attest: "Please confirm you're an adult parent or caregiver.",
  google: "Google sign-in didn't complete. You can try again or use an email link.",
  callback: "That link didn't work. Request a new one below.",
};

/** More specific text when the callback tells us why. */
const REASONS: Record<string, string> = {
  browser:
    "That link was opened in a different browser than the one that asked for it. Request a new link here, then open it on this same device and browser (or copy it into this browser).",
  expired: "That link has expired. Links work for an hour. Request a new one below.",
  used: "That link was already used, possibly by your email app opening it early. Request a new one below.",
  missing: "That link was incomplete. Request a new one below.",
  unknown: "That link didn't work. Request a new one below.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reason?: string }>;
}) {
  const { next: rawNext, error, reason } = await searchParams;
  if (!supabaseConfigured) redirect("/setup");
  const user = await getUser();
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/app";
  if (user) redirect(next);

  return (
    <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-6 sm:pt-12">
      <div className="mb-10 flex items-center justify-between">
        <Wordmark />
        <Link href="/crisis" className="text-[14px] text-ink-mute hover:text-ink">
          Crisis resources
        </Link>
      </div>
      <h1 className="text-[clamp(2rem,1.6rem+1.5vw,2.8rem)]">
        Welcome <span className="display-italic">back</span>, or welcome.
      </h1>
      <p className="mt-4 text-ink-soft">
        One link, no password. Your tracker is free, and it stays free.
      </p>
      <div className="mt-8">
        <SignInForm next={next} initialError={error ? (error === "callback" && reason && REASONS[reason]) || ERRORS[error] : undefined} />
      </div>
    </main>
  );
}
