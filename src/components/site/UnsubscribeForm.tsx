"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { unsubscribe } from "@/app/actions/email";

export function UnsubscribeForm({ email, token, contactEmail }: { email: string; token: string; contactEmail: string }) {
  const [state, action, pending] = useActionState(unsubscribe, null);
  if (state?.done) {
    return <p role="status" className="text-[1.05rem] text-ink">Done. <strong>{email}</strong> won&apos;t get any more emails from the list.</p>;
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="e" value={email} />
      <input type="hidden" name="t" value={token} />
      <p className="text-[1.05rem] text-ink-body">Stop list emails to <strong className="text-ink">{email}</strong>?</p>
      <Button type="submit" disabled={pending}>{pending ? "Unsubscribing…" : "Unsubscribe"}</Button>
      {state?.error ? (
        <p role="alert" className="text-[15px] text-ink">
          {state.error} You can also email <a href={`mailto:${contactEmail}?subject=Unsubscribe`} className="underline underline-offset-4">{contactEmail}</a> and we&apos;ll remove you.
        </p>
      ) : null}
    </form>
  );
}
