"use client";

import { useState } from "react";
import { useSync } from "@/components/app/SyncProvider";
import { discardOp, retryFailed } from "@/lib/entries/queue";

/**
 * Quiet, honest sync state. Four states a parent can tell apart:
 * saved on this phone (pending), syncing, synced (nothing shown), failed.
 */
export function SyncStatus({ userId }: { userId: string }) {
  const { online, syncing, pending, failed } = useSync();
  const [open, setOpen] = useState(false);

  if (pending.length === 0 && failed.length === 0) return null;

  const label = failed.length
    ? `${failed.length} ${failed.length === 1 ? "entry" : "entries"} couldn't sync`
    : syncing
      ? "Syncing…"
      : online
        ? `${pending.length} saved on this phone, will sync`
        : `${pending.length} saved on this phone, will sync when you're back online`;

  return (
    <div className="mx-auto w-full max-w-lg px-5 pt-3" role="status" aria-live="polite">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-10 w-full items-center gap-2 rounded-pill border border-line bg-paper px-4 text-left text-[14px] text-ink-soft"
      >
        <span aria-hidden className={`h-2 w-2 shrink-0 rounded-pill ${failed.length ? "bg-ink" : syncing ? "bg-sage-deep" : "bg-sage"}`} />
        <span className="flex-1">{label}</span>
        <span aria-hidden className="text-ink-mute">{open ? "–" : "+"}</span>
      </button>
      {open ? (
        <div className="fade-in mt-2 space-y-2 rounded-lg bg-paper p-4 text-[14px] shadow-soft">
          {failed.length ? (
            <>
              <p className="text-ink-soft">
                These were saved on this phone but the server refused them. Nothing is lost; you can retry or discard.
              </p>
              <ul className="divide-y divide-line">
                {failed.map((op) => (
                  <li key={op.opId} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-ink-mute">
                      {op.kind} · {op.lastError ?? "unknown error"}
                    </span>
                    <button type="button" className="text-ink underline" onClick={() => void discardOp(userId, op.opId)}>
                      Discard
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="min-h-10 rounded-pill bg-ink px-4 text-paper" onClick={() => void retryFailed(userId)}>
                Retry all
              </button>
            </>
          ) : (
            <p className="text-ink-soft">
              Entries saved here are safe on this device. They send themselves the moment a connection is back,
              and a retried entry is never duplicated.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
