"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Visually hidden title for screen readers only. */
  hideTitle?: boolean;
};

/**
 * The signature motion: a bottom sheet that rises with a soft spring.
 * Focus is trapped while open, Escape closes, and the page behind is inert.
 */
export function Sheet({ open, onClose, title, children, hideTitle = false }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const lastActive = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActive.current = document.activeElement;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    const first = focusables()[0];
    (first ?? panel)?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      if (lastActive.current instanceof HTMLElement) lastActive.current.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fade-in absolute inset-0 bg-ink/30"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="sheet-rise relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-[28px] bg-paper shadow-sheet sm:rounded-[28px]"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-pill bg-line-strong sm:hidden" aria-hidden />
        <h2
          id={titleId}
          className={hideTitle ? "sr-only" : "px-6 pt-5 text-[1.35rem] leading-tight"}
        >
          {title}
        </h2>
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
