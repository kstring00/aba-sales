"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { sendMagicLink, signInWithGoogle, type SignInState } from "./actions";

export function SignInForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(sendMagicLink, null);

  if (state?.ok) {
    return (
      <div className="fade-in rounded-lg bg-paper p-6 shadow-soft" role="status">
        <h2 className="text-[1.35rem]">Check your email</h2>
        <p className="mt-3 text-ink-soft">
          We sent a sign-in link to <strong className="text-ink">{state.email}</strong>. It works
          once and expires in an hour. You can close this tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-5 rounded-lg bg-paper p-6 shadow-soft">
        <input type="hidden" name="next" value={next} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <label className="flex items-start gap-3 text-[15px] text-ink-soft">
          <input
            type="checkbox"
            name="attest"
            required
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--sage-deep)]"
          />
          <span>
            I&apos;m 18 or older and a parent or caregiver. This service doesn&apos;t offer
            accounts for children.
          </span>
        </label>
        {state?.error || initialError ? (
          <p className="text-[15px] text-ink" role="alert">
            {state?.error ?? initialError}
          </p>
        ) : null}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Email me a sign-in link"}
        </Button>
        <p className="text-center text-[14px] text-ink-mute">No password to remember.</p>

        <div className="relative py-1 text-center text-[13px] uppercase tracking-wider text-ink-mute">
          <span className="relative z-10 bg-paper px-3">or</span>
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-line" />
        </div>

        <Button
          type="submit"
          formAction={signInWithGoogle}
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          <GoogleMark />
          Continue with Google
        </Button>
      </form>

      <p className="text-[14px] leading-relaxed text-ink-mute">
        Your child&apos;s information is stored under a nickname only. You own it, you can export
        or delete it at any time, and we never read your entries.
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6C12.4 13.4 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.8A14.5 14.5 0 0 1 9.5 24c0-1.7.3-3.3.9-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4-13.5-9.6l-7.9 6C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
