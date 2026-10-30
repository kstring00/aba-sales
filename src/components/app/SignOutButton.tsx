"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { clearQueueForUser } from "@/lib/entries/queue";
import { signOut } from "@/app/app/actions";

/** Clears this user's local queue before the server session ends. */
export function SignOutButton({ userId, label = "Sign out" }: { userId: string; label?: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await clearQueueForUser(userId);
            await caches?.delete?.("pages-v1");
          } catch {
            /* best effort */
          }
          await signOut();
        })
      }
    >
      {pending ? "Signing out…" : label}
    </Button>
  );
}
