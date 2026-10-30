"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createShareLink, revokeShareLink, type ShareState } from "@/app/app/caregivers/actions";

export type ShareLinkInfo = { id: string; range_start: string; range_end: string; expires_at: string };

export function ShareLinks({ childId, from, to, links, isPro }: { childId: string; from: string; to: string; links: ShareLinkInfo[]; isPro: boolean }) {
  const [state, action, pending] = useActionState<ShareState, FormData>(createShareLink, null);
  const [copied, setCopied] = useState(false);

  return (
    <section className="mt-10 space-y-3">
      <h2 className="text-[1.2rem]">Share a read-only link</h2>
      <p className="text-[15px] text-ink-soft">
        A link your child&apos;s BCBA, teacher, or pediatrician can open without an account. It shows this child and this date range only, and it stops working after 30 days. You can withdraw it any time.
      </p>
      {isPro ? (
        <form action={action} className="space-y-3">
          <input type="hidden" name="child_id" value={childId} />
          <input type="hidden" name="from" value={from} />
          <input type="hidden" name="to" value={to} />
          <Button type="submit" variant="secondary" disabled={pending}>{pending ? "Creating…" : "Create a 30-day link"}</Button>
          <p className="text-[13px] text-ink-mute">Covers {from} to {to} (the last 4 weeks).</p>
          {state?.error ? <p role="alert" className="text-[14px]">{state.error}</p> : null}
          {state?.ok && state.link ? (
            <div className="space-y-2 rounded-md bg-paper p-3 text-[14px] shadow-soft">
              <p className="break-all font-mono text-[12px] text-ink-soft">{state.link}</p>
              <Button type="button" size="sm" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(state.link!); setCopied(true); } catch {} }}>
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
          ) : null}
        </form>
      ) : (
        <p className="text-[14px] text-ink-mute">Share links are part of Pro. <a href="/app/settings#plan" className="underline">See what Pro includes</a>.</p>
      )}
      {links.length > 0 ? (
        <ul className="divide-y divide-line rounded-lg bg-paper shadow-soft">
          {links.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
              <span className="text-ink-soft">{String(l.range_start).slice(0, 10)} to {String(l.range_end).slice(0, 10)} · expires {new Date(l.expires_at).toLocaleDateString()}</span>
              <form action={revokeShareLink}>
                <input type="hidden" name="link_id" value={l.id} />
                <Button size="sm" variant="quiet" type="submit">Withdraw</Button>
              </form>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
