"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { inviteCaregiver, removeCaregiver, revokeInvite, type InviteState } from "@/app/app/caregivers/actions";
import type { ChildWithRole } from "@/lib/data";

export type CaregiverInfo = { user_id: string; role: "owner" | "caregiver"; display_name: string | null; isYou: boolean };
export type InviteInfo = { id: string; email: string; expires_at: string };

type Props = { child: ChildWithRole; caregivers: CaregiverInfo[]; invites: InviteInfo[]; isPro: boolean };

export function CaregiversSection({ child, caregivers, invites, isPro }: Props) {
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteCaregiver, null);
  const [copied, setCopied] = useState(false);
  const isOwner = child.role === "owner";

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-line rounded-lg bg-paper shadow-soft">
        {caregivers.map((c) => (
          <li key={c.user_id} className="flex items-center justify-between gap-3 px-4 py-3 text-[15px]">
            <div>
              <p className="text-ink">{c.isYou ? "You" : c.display_name || "A caregiver"}</p>
              <p className="text-[13px] text-ink-mute">{c.role === "owner" ? "Owner" : "Caregiver · can log and edit their own entries"}</p>
            </div>
            {isOwner && c.role === "caregiver" ? (
              <form action={removeCaregiver}>
                <input type="hidden" name="child_id" value={child.id} />
                <input type="hidden" name="user_id" value={c.user_id} />
                <Button size="sm" variant="quiet" type="submit">Remove</Button>
              </form>
            ) : null}
          </li>
        ))}
        {invites.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[15px]">
            <div>
              <p className="text-ink">{inv.email}</p>
              <p className="text-[13px] text-ink-mute">Invited · waiting to accept</p>
            </div>
            <form action={revokeInvite}>
              <input type="hidden" name="invite_id" value={inv.id} />
              <Button size="sm" variant="quiet" type="submit">Withdraw</Button>
            </form>
          </li>
        ))}
      </ul>

      {isOwner ? (
        isPro ? (
          <form action={action} className="space-y-3 rounded-lg bg-paper p-4 shadow-soft">
            <input type="hidden" name="child_id" value={child.id} />
            <label htmlFor={`inv-${child.id}`} className="block text-[15px] font-medium">Invite a second caregiver</label>
            <p className="text-[14px] text-ink-soft">They&apos;ll see {child.nickname}&apos;s entries and can log their own. Only you can rename, delete, or invite.</p>
            <div className="flex gap-2">
              <Input id={`inv-${child.id}`} name="email" type="email" placeholder="their@email.com" required />
              <Button type="submit" variant="secondary" disabled={pending}>Invite</Button>
            </div>
            {state?.error ? <p role="alert" className="text-[14px]">{state.error}</p> : null}
            {state?.ok && state.link ? (
              <div className="space-y-2 rounded-md bg-cream p-3 text-[14px]">
                <p className="text-ink">Invite created for {state.email}. Send them this link; it works once and expires in 7 days.</p>
                <p className="break-all rounded bg-paper px-2 py-1 font-mono text-[12px] text-ink-soft">{state.link}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(state.link!);
                      setCopied(true);
                    } catch {
                      /* clipboard unavailable; the link is visible to copy by hand */
                    }
                  }}
                >
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <p className="text-[12px] text-ink-mute">We don&apos;t email invites yet, so this link is the only copy.</p>
              </div>
            ) : null}
          </form>
        ) : (
          <p className="text-[14px] text-ink-mute">
            Sharing with a second caregiver is part of Pro. <a href="#plan" className="underline">See what Pro includes</a>.
          </p>
        )
      ) : null}
    </div>
  );
}
