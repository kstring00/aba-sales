"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { sendContact, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, null);
  if (state?.ok) {
    return (
      <p role="status" className="rounded-lg bg-paper p-6 shadow-soft">
        Thank you. A person will read this and reply.
      </p>
    );
  }
  return (
    <form action={action} className="space-y-5 rounded-lg bg-paper p-6 shadow-soft">
      <div className="space-y-2">
        <Label htmlFor="c-email">Your email</Label>
        <Input id="c-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-message">Message</Label>
        <Textarea id="c-message" name="message" required maxLength={4000} rows={6} />
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state?.error ? (
        <p role="alert" className="text-[15px]">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
