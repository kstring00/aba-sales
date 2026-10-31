"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { ShelfId, Tint } from "@/lib/shelves";
import { D, DrawerGlyph, SHELF_GLYPH } from "@/components/home/drawer-icons";

export type HeroShelf = { id: ShelfId; number: number; title: string; blurb: string; tint: Tint };

const BINDER: Record<Tint, { c: string; ink: string }> = {
  sky: { c: "var(--b1)", ink: "var(--b1-ink)" },
  mint: { c: "var(--b2)", ink: "var(--b2-ink)" },
  butter: { c: "var(--b3)", ink: "var(--b3-ink)" },
  blush: { c: "var(--b4)", ink: "var(--b4-ink)" },
};

/**
 * Hero copy + the wooden shelf + the drawer. Four binders are buttons; the
 * active one pulls forward (translateY/Z + rotateX from a bottom-center
 * origin) and the drawer unfolds with grid-template-rows 0fr→1fr. All four
 * panels are in the HTML from the server; this component only toggles
 * `hidden`, sets the tint variables, and positions the notch.
 */
export function ShelfHero({ shelves, panels, reviewer }: { shelves: HeroShelf[]; panels: ReactNode[]; reviewer: string }) {
  const [active, setActive] = useState<number>(-1);
  const bookRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const booksRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const open = active >= 0;
  const current = open ? shelves[active] : null;

  const notch = useCallback(() => {
    const d = drawerRef.current;
    const b = active >= 0 ? bookRefs.current[active] : null;
    if (!d || !b) return;
    const br = b.getBoundingClientRect();
    const dr = d.getBoundingClientRect();
    d.style.setProperty("--notch", `${br.left + br.width / 2 - dr.left}px`);
  }, [active]);

  const openShelf = useCallback((i: number, scroll = true) => {
    setActive(i);
    if (scroll) {
      window.setTimeout(() => drawerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 350);
    }
  }, []);

  useEffect(() => { notch(); }, [notch]);
  useEffect(() => {
    window.addEventListener("resize", notch);
    return () => window.removeEventListener("resize", notch);
  }, [notch]);

  // Deep links and in-page links: #shelf-<id> opens that shelf.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace(/^#shelf-/, "");
      const i = shelves.findIndex((s) => s.id === id);
      if (i >= 0 && window.location.hash.startsWith("#shelf-")) openShelf(i);
    };
    fromHash();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#shelf-'], a[href^='/#shelf-']") as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!.replace(/^\/?#shelf-/, "");
      const i = shelves.findIndex((s) => s.id === id);
      if (i < 0) return;
      e.preventDefault();
      history.replaceState(null, "", `#shelf-${id}`);
      booksRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      openShelf(i);
    };
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("hashchange", fromHash); document.removeEventListener("click", onClick); };
  }, [shelves, openShelf]);

  // Pointer parallax on the whole shelf: fine pointers only, never under reduced motion.
  useEffect(() => {
    const stage = stageRef.current;
    const books = booksRef.current;
    if (!stage || !books) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      books.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 4}deg)`;
    };
    const leave = () => { books.style.transform = ""; };
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    return () => { stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", leave); };
  }, []);

  const tint = current ? BINDER[current.tint] : BINDER.sky;

  return (
    <>
      <section className="sd-hero" aria-labelledby="hero-h">
        <div>
          <p className="sd-eyebrow">Real support for real family life</p>
          <h1 id="hero-h">Practical support for <em>every step</em> of <em>the autism journey.</em></h1>
          <p className="sd-lede">Tools, guides, and resources to help you feel more organized, prepared, and supported at home, at school, and along the way.</p>
          <div className="sd-ctas">
            <button type="button" className="sd-btn primary" onClick={() => { booksRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }); openShelf(0); }}>
              Find my shelf <D.arrow />
            </button>
            <Link href="/shelf" className="sd-btn">Browse all support</Link>
          </div>
          <div className="sd-trust">
            <div><i><D.leaf /></i><span><b>Practical tools</b>You can actually use</span></div>
            <div><i><D.heart /></i><span><b>Made by an RBT</b>With real experience</span></div>
            <div><i><D.people /></i><span><b>You&apos;re not alone</b>Support at every step</span></div>
          </div>
          {reviewer ? <p className="sd-reviewed">Reviewed by {reviewer}, BCBA.</p> : null}
        </div>

        <div className="sd-stage" ref={stageRef}>
          <div className="sd-wall" aria-hidden />
          <div ref={booksRef} className={`sd-books${open ? " has-active" : ""}`} role="group" aria-label="Choose a shelf">
            {shelves.map((s, i) => (
              <button
                key={s.id}
                ref={(el) => { bookRefs.current[i] = el; }}
                type="button"
                className="sd-book"
                style={{ "--c": BINDER[s.tint].c, "--ink": BINDER[s.tint].ink, "--i": i } as React.CSSProperties}
                aria-pressed={i === active}
                aria-controls="shelf-drawer"
                onClick={() => (i === active ? setActive(-1) : openShelf(i))}
              >
                <span className="in">
                  <span className="ic"><DrawerGlyph name={SHELF_GLYPH[s.id]} /></span>
                  <span className="t">{s.title}</span>
                  <span className="d">{s.blurb}</span>
                </span>
                <span className="tab" aria-hidden />
              </button>
            ))}
          </div>
          <div className="sd-plank" aria-hidden />
          <div className={`sd-hint${open ? " away" : ""}`} aria-hidden>
            <svg viewBox="0 0 52 38" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M46 4C40 6 30 8 22 14c-6 4-10 9-10 16" /><path d="M6 24l6 7 7-5" /></svg>
            <span>Choose a shelf<br />to see what&apos;s inside.</span>
          </div>
        </div>
      </section>

      <section
        id="shelf-drawer"
        ref={drawerRef}
        className={`sd-drawer${open ? " open" : ""}`}
        style={{ "--shelf": tint.c, "--ink": tint.ink } as React.CSSProperties}
        aria-label="Shelf contents"
      >
        <div className="sd-drawer-inner">
          {shelves.map((s, i) => (
            <div key={s.id} className="sd-panel" hidden={i !== active} id={`shelf-${s.id}`}>
              {panels[i]}
            </div>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">{current ? `Showing shelf ${current.number}: ${current.title}.` : ""}</p>
      </section>
    </>
  );
}
