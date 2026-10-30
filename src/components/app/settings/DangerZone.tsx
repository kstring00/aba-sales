"use client";

import { startTransition, useActionState, useState } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { deleteAccount, type ActionState } from "@/app/app/actions";

export function YourData() {
  const [open, setOpen] = useState(false);
  // Controlled so a validation error from the server doesn't wipe the form.
  const [understand, setUnderstand] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [state, action, pending] = useActionState<ActionState, FormData>(deleteAccount, null);

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-paper p-5 shadow-soft">
        <p className="text-[16px]">Export everything</p>
        <p className="mt-1 text-[15px] text-ink-soft">
          One JSON file with your children, labels, every entry, and your account details. Free, always.
        </p>
        <a href="/app/export/all" download className={buttonClass("secondary", "md", "mt-4")}>
          Download all my data
        </a>
      </div>

      <div className="rounded-lg bg-paper p-5 shadow-soft">
        <p className="text-[16px]">Delete my account</p>
        <p className="mt-1 text-[15px] text-ink-soft">
          Removes your sign-in, every child you own, and every entry, for good. Caregivers you invited lose
          access. If someone else owns a child you were invited to, their records stay with them.
        </p>
        {!open ? (
          <Button type="button" variant="quiet" className="mt-4" onClick={() => setOpen(true)}>
            I want to delete my account
          </Button>
        ) : (
          <form
            // Submitting through startTransition (not the form action) keeps
            // React from resetting the fields when the server returns an error.
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(() => action(fd));
            }}
            className="mt-5 space-y-4 rounded-md bg-cream p-4"
          >
            <p className="text-[15px]">Two steps, so this can&apos;t happen by accident.</p>
            <label className="flex items-start gap-3 text-[15px] text-ink-soft">
              <input
                type="checkbox"
                name="understand"
                checked={understand}
                onChange={(e) => setUnderstand(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--sage-deep)]"
              />
              <span>I understand this permanently deletes everything and can&apos;t be undone. I&apos;ve exported anything I want to keep.</span>
            </label>
            <label className="block text-[15px] text-ink-soft">
              Type <strong className="text-ink">DELETE</strong> to confirm
              <Input name="confirm" autoComplete="off" className="mt-1" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
            {state?.error ? <p role="alert" className="text-[15px] text-ink">{state.error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="danger" disabled={pending}>{pending ? "Deleting…" : "Delete everything"}</Button>
              <Button type="button" variant="quiet" onClick={() => setOpen(false)}>Keep my account</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
