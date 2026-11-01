"use client";

import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { joinList, type JoinState } from "@/app/actions/email";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * One email field. Validates inline before the server action runs, speaks
 * its status through a live region, and replaces itself on success
 * (audit F-19). No pre-ticked anything.
 */
export function EmailCapture({ source, cta = "Keep me posted" }: { source: string; cta?: string }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(joinList, null);
  const [local, setLocal] = useState<string | null>(null);
  const id = useId();
  if (state?.ok) {
    return <p role="status" aria-live="polite" className="text-[15px] text-ink">You&apos;re on the list. Check your inbox for a short confirmation email.</p>;
  }
  const message = local ?? state?.error ?? null;
  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const value = String(new FormData(e.currentTarget).get("email") ?? "").trim();
        if (!EMAIL.test(value)) {
          e.preventDefault();
          setLocal("Enter an email like you@example.com.");
          (e.currentTarget.elements.namedItem("email") as HTMLInputElement | null)?.focus();
        } else {
          setLocal(null);
        }
      }}
      className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
    >
      <input type="hidden" name="source" value={source} />
      <div className="hidden" aria-hidden>
        <label htmlFor={`hp-${source}`}>Website</label>
        <input id={`hp-${source}`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
      <Input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" aria-describedby={`${id}-status`} aria-invalid={message ? true : undefined} className="sm:flex-1" />
      <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Saving…" : cta}</Button>
      <p id={`${id}-status`} role={message ? "alert" : undefined} aria-live="polite" className={`text-[14px] sm:basis-full ${message ? "text-ink" : "sr-only"}`}>
        {message ?? ""}
      </p>
    </form>
  );
}
