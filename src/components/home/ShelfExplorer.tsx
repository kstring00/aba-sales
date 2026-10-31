"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { ShelfView } from "@/lib/shelves";
import { TINT_BG, TINT_TEXT } from "@/lib/shelves";
import { buttonClass } from "@/components/ui/Button";
import { IconArrow, ShelfIcon, Wave } from "@/components/illustrations/Paper";
import { EmptyShelfCard, LoggerCard, ProductShelfCard } from "@/components/shop/ShelfCard";

/**
 * The shelf does the heavy lifting. Four tabs stand on a wooden board; the
 * selected one opens a tinted panel with its paper objects. Tabs are a real
 * tablist (arrow keys, roving tabindex). Every panel is in the HTML, hidden
 * when inactive, so links crawl and nothing depends on script to exist.
 */
export function ShelfExplorer({ shelves }: { shelves: ShelfView[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const count = shelves.length;

  function select(i: number, focus = false) {
    const next = ((i % count) + count) % count;
    setActive(next);
    const el = tabRefs.current[next];
    if (el) {
      el.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      if (focus) el.focus({ preventScroll: true });
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") { e.preventDefault(); select(active + 1, true); }
    if (e.key === "ArrowLeft") { e.preventDefault(); select(active - 1, true); }
    if (e.key === "Home") { e.preventDefault(); select(0, true); }
    if (e.key === "End") { e.preventDefault(); select(count - 1, true); }
  }

  // Deep links from the hero folders (and anywhere else): #shelf-<id>.
  useEffect(() => {
    const apply = () => {
      const id = window.location.hash.replace(/^#shelf-/, "");
      const i = shelves.findIndex((s) => s.id === id);
      if (i >= 0 && window.location.hash.startsWith("#shelf-")) {
        setActive(i);
        tabRefs.current[i]?.scrollIntoView({ inline: "center", block: "nearest" });
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [shelves]);

  const current = shelves[active];
  const next = shelves[(active + 1) % count];

  return (
    <section id="shelves" aria-labelledby={`${id}-h`} className="relative scroll-mt-4">
      {/* Anchor targets for #shelf-<id> links; the browser scrolls here and the effect above picks the tab. */}
      {shelves.map((s) => <span key={s.id} id={`shelf-${s.id}`} aria-hidden className="absolute top-0" />)}
      <Wave flip color="var(--cream)" className="absolute inset-x-0 top-0 z-10" />
      <div className="bg-aqua pb-24 pt-14 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="kicker">Explore the shelves</p>
          <h2 id={`${id}-h`} className="mt-3">
            What kind of support do you need <em>today</em>?
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[1.02rem] text-ink-soft">
            Each shelf holds a few practical tools for one part of the road. Start here, then move to the next shelf when you&apos;re ready.
          </p>
        </div>
      </div>

      <div className="mx-auto -mt-16 w-full max-w-7xl px-5 sm:-mt-20 sm:px-8">
        {/* Counter and arrows */}
        <div className="mb-3 flex items-center justify-end gap-3">
          <p className="tnum text-[13px] text-ink-mute" aria-live="polite">
            Shelf {active + 1} of {count}
            <span aria-hidden className="ml-2 inline-flex items-center gap-1 align-middle">
              {shelves.map((s, i) => (
                <span key={s.id} className={`inline-block h-1.5 w-1.5 rounded-pill ${i === active ? "bg-sky-deep" : "bg-line-strong"}`} />
              ))}
            </span>
          </p>
          <button type="button" onClick={() => select(active - 1)} aria-label="Previous shelf" className="lift flex h-11 w-11 items-center justify-center rounded-pill border border-line-strong bg-paper text-ink hover:border-ink">
            <IconArrow className="h-4 w-4 rotate-180" />
          </button>
          <button type="button" onClick={() => select(active + 1)} aria-label="Next shelf" className="lift flex h-11 w-11 items-center justify-center rounded-pill border border-line-strong bg-paper text-ink hover:border-ink">
            <IconArrow className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs on the board */}
        <div className="-mx-5 px-5 sm:mx-0 sm:px-0">
          <div role="tablist" aria-label="Shelves" onKeyDown={onKey} className="scroll-quiet flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 pt-3 md:grid md:grid-cols-4 md:overflow-visible">
            {shelves.map((s, i) => {
              const selected = i === active;
              return (
                <button
                  key={s.id}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  role="tab"
                  id={`${id}-tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel-${s.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={`lift flex min-h-[4.5rem] min-w-[14.5rem] snap-center items-center gap-3 rounded-lg border bg-paper px-4 py-3 text-left md:min-w-0 ${selected ? "-translate-y-1 border-ink shadow-lift md:-translate-y-1.5" : "border-line shadow-soft hover:border-line-strong"}`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${TINT_BG[s.tint]}`}>
                    <ShelfIcon tint={s.tint} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-[12px] ${TINT_TEXT[s.tint]}`}>Shelf {s.number}</span>
                    <span className="block font-display text-[1.1rem] leading-tight text-ink">{s.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="board mx-1" />
        </div>

        {/* Panels */}
        {shelves.map((s, i) => {
          const isActive = i === active;
          return (
            <div
              key={s.id}
              role="tabpanel"
              id={`${id}-panel-${s.id}`}
              aria-labelledby={`${id}-tab-${s.id}`}
              hidden={!isActive}
              className={`${TINT_BG[s.tint]} grain mt-8 rounded-xl p-5 sm:p-7 lg:p-8`}
            >
              <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,9fr)] lg:gap-8">
                <div className="flex flex-col">
                  <p className={`inline-flex self-start rounded-pill bg-paper/80 px-3 py-1 text-[12px] font-medium uppercase tracking-[0.16em] ${TINT_TEXT[s.tint]}`}>Shelf {s.number}</p>
                  <h3 className="mt-4 text-[clamp(1.9rem,1.5rem+1.4vw,2.8rem)] leading-[1.05]">{s.title}</h3>
                  <p className="mt-3 max-w-[34ch] text-[15.5px] text-ink-soft">{s.description}</p>
                  <Link href={`/shelf#${s.id}`} className={buttonClass("primary", "md", "mt-6 self-start")}>
                    Explore this shelf <IconArrow className="h-4 w-4" />
                  </Link>
                  <div className="mt-auto hidden pt-10 lg:block" aria-hidden>
                    <ShelfIcon tint={s.tint} className="h-16 w-16 opacity-80" />
                  </div>
                </div>
                <div className={`grid gap-4 sm:grid-cols-2 ${s.products.length + (s.tool ? 1 : 0) >= 3 ? "xl:grid-cols-3" : ""}`}>
                  {s.tool ? <LoggerCard shelf={s} /> : null}
                  {s.products.map((p) => <ProductShelfCard key={p.id} product={p} tint={s.tint} />)}
                  {s.products.length === 0 && !s.tool ? <EmptyShelfCard shelf={s} /> : null}
                </div>
              </div>
            </div>
          );
        })}

        {/* Next up */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => select(active + 1)}
            className="lift inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-[14px] text-ink-soft hover:bg-cream-deep hover:text-ink"
          >
            <span className="text-ink-mute">Next up</span>
            <span className="font-medium text-ink">{next.title}</span>
            <IconArrow className="h-4 w-4" />
          </button>
        </div>
        <p className="sr-only">Currently showing {current.title}.</p>
      </div>
    </section>
  );
}
