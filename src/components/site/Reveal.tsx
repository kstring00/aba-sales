"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Adds `is-in` once the element enters the viewport. Pure CSS does the rest,
 * and prefers-reduced-motion disables the transform entirely.
 */
export function Reveal({ as: Tag = "div", children, className = "", delay = 0 }: { as?: ElementType; children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return; // stays visible
    // Already on screen? Leave it visible; only arm elements below the fold.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;
    el.classList.add("reveal-armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    // Safety net: if the observer never fires (print, full-page captures, odd
    // embedders), show the content anyway after a moment.
    const t = setTimeout(() => el.classList.add("is-in"), 2500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
