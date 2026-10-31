"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export type MenuItem = { href: string; label: string };

/**
 * The full navigation below the lg breakpoint. A real button with
 * aria-expanded; Esc and an outside tap close it and return focus; any
 * navigation closes it.
 */
export function MobileMenu({ items, label, closeLabel }: { items: MenuItem[]; label: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node) && !button.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div className="relative lg:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? closeLabel : label}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-10 items-center justify-center rounded-pill text-ink-soft hover:bg-cream-deep hover:text-ink sm:w-11"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div ref={panel} id={id} hidden={!open} className="paper-card absolute right-0 top-[calc(100%+8px)] z-30 w-[min(80vw,16rem)] p-2">
        <ul>
          {items.map((i) => (
            <li key={i.href}>
              <Link href={i.href} className="flex min-h-12 items-center rounded-md px-4 text-[16px] text-ink hover:bg-cream-deep" aria-current={pathname === i.href ? "page" : undefined}>
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
