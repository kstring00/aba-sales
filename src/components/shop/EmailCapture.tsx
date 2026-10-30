"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { joinList, type JoinState } from "@/app/actions/email";

export function EmailCapture({ source, cta = "Keep me posted" }: { source: string; cta?: string }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinList, null);
  if (state?.ok) {
    return <p role="status" className="text-[15px] text-ink">Thank you. We&apos;ll be in touch once, when there&apos;s something to show.</p>;
  }
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="source" value={source} />
      <div className="hidden" aria-hidden>
        <label htmlFor={`hp-${source}`}>Website</label>
        <input id={`hp-${source}`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Input name="email" type="email" inputMode="email" autoComplete="email" required placeholder="you@example.com" aria-label="Email address" />
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Saving…" : cta}</Button>
      {state?.error ? <p role="alert" className="text-[14px] sm:basis-full">{state.error}</p> : null}
    </form>
  );
}
