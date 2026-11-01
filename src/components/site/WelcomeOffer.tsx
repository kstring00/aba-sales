"use client";

import { useActionState, useCallback, useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { claimOffer, type OfferState } from "@/app/actions/email";
import { OFFER_DELAY_MS, OFFER_PERCENT, OFFER_SCROLL_SHARE, OFFER_SEEN_KEY, offerAllowedOn } from "@/lib/welcomeOffer";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function seen(): boolean {
  try {
    return window.localStorage.getItem(OFFER_SEEN_KEY) !== null;
  } catch {
    return true; // storage blocked (private mode, previews): don't show it at all rather than every page
  }
}
function markSeen() {
  try {
    window.localStorage.setItem(OFFER_SEEN_KEY, String(Date.now()));
  } catch {
    /* nothing to do */
  }
}

/**
 * 15% off a first paid download for joining the list. Once per browser,
 * after 30 seconds or half a page of scrolling, and never on the
 * hard-moment or mid-task pages listed in lib/welcomeOffer.
 */
export function WelcomeOffer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open || !offerAllowedOn(pathname) || seen()) return;
    let done = false;
    const show = () => {
      if (done || !offerAllowedOn(window.location.pathname) || seen()) return;
      done = true;
      markSeen();
      setOpen(true);
    };
    const timer = window.setTimeout(show, OFFER_DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= OFFER_SCROLL_SHARE) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      done = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, open]);

  const close = useCallback(() => setOpen(false), []);
  return (
    <Sheet open={open} onClose={close} title={`${OFFER_PERCENT}% off your first paid download`}>
      <OfferForm onClose={close} />
    </Sheet>
  );
}

function OfferForm({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState<OfferState, FormData>(claimOffer, null);
  const [local, setLocal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const id = useId();

  if (state?.ok) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <p className="text-[15px] text-ink-soft">Here&apos;s your code. Enter it at checkout on anything paid.</p>
        <div className="flex items-center gap-3 rounded-xl border border-line-strong bg-cream px-4 py-3">
          <span className="tnum flex-1 text-[1.4rem] font-semibold tracking-[0.08em] text-ink">{state.code}</span>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(state.code).then(() => setCopied(true), () => setCopied(false));
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-[13px] text-ink-mute">
          {state.emailed ? "We emailed it to you too. " : ""}It works once. The free tools stay free.
        </p>
        <Button type="button" variant="primary" className="w-full" onClick={onClose}>Back to the shelf</Button>
      </div>
    );
  }

  const message = local ?? (state && !state.ok ? state.error : null);
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
      className="space-y-3"
    >
      <p className="text-[15px] text-ink-soft">
        Join the list and we&apos;ll send you a code for {OFFER_PERCENT}% off anything paid on the shelf. A few emails a year. Unsubscribe in one click.
      </p>
      <div className="hidden" aria-hidden>
        <label htmlFor={`${id}-hp`}>Website</label>
        <input id={`${id}-hp`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
      <Input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" aria-describedby={`${id}-status`} aria-invalid={message ? true : undefined} />
      <p id={`${id}-status`} role={message ? "alert" : undefined} aria-live="polite" className={`text-[14px] ${message ? "text-ink" : "sr-only"}`}>
        {message ?? ""}
      </p>
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>{pending ? "Sending…" : "Send my code"}</Button>
      <button type="button" onClick={onClose} className="mx-auto block min-h-11 text-[14px] text-ink-mute underline-offset-4 hover:text-ink hover:underline">
        No thanks
      </button>
    </form>
  );
}
