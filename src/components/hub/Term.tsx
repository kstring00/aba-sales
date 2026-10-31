"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ui } from "@/lib/content/data";

/**
 * A glossary term in running text. Tap, click or Enter opens a small
 * definition popover; Esc or tapping elsewhere closes it and returns focus.
 * The term stays readable text for screen readers; the button names it.
 */
export function Term({ text, full, short, href }: { text: string; full: string; short: string; href: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    const down = (e: PointerEvent) => { if (!pop.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", down);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", down); };
  }, [open]);
  return (
    <span className="relative inline">
      <button ref={btn} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}
        className="inline cursor-help rounded-sm border-b-2 border-dotted border-accent bg-transparent p-0 text-inherit [font:inherit] hover:bg-sage-tint">
        {text}
      </button>
      <span ref={pop} id={id} role="note" hidden={!open} className="paper-card absolute left-0 top-[calc(100%+6px)] z-30 block w-[min(80vw,20rem)] p-4 text-left text-[14.5px] leading-snug text-ink">
        {full ? <strong className="block font-semibold">{full}</strong> : null}
        <span className="mt-1 block text-ink-soft">{short || ui.glossary.pendingDefinition}</span>
        <a href={href} className="mt-2 inline-flex min-h-11 items-center text-heading underline underline-offset-4">{ui.nav.learn}: {ui.learn.glossaryLink.split(":")[0]}</a>
      </span>
    </span>
  );
}
