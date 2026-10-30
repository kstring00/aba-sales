"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const QTY_COOKIE = "ss_cart_qty";

function readQty() {
  if (typeof document === "undefined") return 0;
  const m = document.cookie.match(new RegExp(`(?:^|; )${QTY_COOKIE}=(\\d+)`));
  return m ? Number(m[1]) : 0;
}

/** Reads the quantity mirror cookie, so static pages can show the badge without a server call. */
export function CartBadge() {
  const count = useSyncExternalStore(
    (cb) => {
      window.addEventListener("focus", cb);
      return () => window.removeEventListener("focus", cb);
    },
    readQty,
    () => 0,
  );
  return (
    <Link
      href="/cart"
      prefetch={false}
      aria-label={count ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty"}
      className="lift relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-line-strong bg-paper px-3 text-[15px] text-ink"
    >
      <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h13l-1.2 8.5a2 2 0 0 1-2 1.7H9.1a2 2 0 0 1-2-1.6L5.4 4.8A1 1 0 0 0 4.4 4H3" />
        <circle cx="9.5" cy="20" r="1" />
        <circle cx="16.5" cy="20" r="1" />
      </svg>
      {count > 0 ? (
        <span className="tnum absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-ink px-1.5 text-[12px] text-paper">{count}</span>
      ) : null}
    </Link>
  );
}
