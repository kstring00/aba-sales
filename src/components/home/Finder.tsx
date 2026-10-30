"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { EmailCapture } from "@/components/shop/EmailCapture";
import { PATHWAYS, resolvePathway, metaFor } from "@/lib/resources";
import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";

/**
 * Section three. Six understandable choices, transparent matching, honest
 * answers. No model, no diagnosis: a pathway lists what serves it, and we
 * show only what exists.
 */
export function Finder({ catalog }: { catalog: ProductSummary[] }) {
  const [active, setActive] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = PATHWAYS.find((p) => p.id === active) ?? null;
  const resolved = current ? resolvePathway(current, catalog) : null;

  // On phones the answer renders below the list; bring it into view once chosen.
  useEffect(() => {
    if (!active || !panelRef.current) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [active]);

  return (
    <section id="find" className="mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-[var(--section-y)] sm:px-8" aria-labelledby="find-h">
      <div className="max-w-[40rem]">
        <p className="text-[13px] uppercase tracking-[0.18em] text-ink-mute">Start here</p>
        <h2 id="find-h" className="mt-4 text-[clamp(2rem,1.4rem+2.2vw,3.4rem)]">What would help you today?</h2>
        <p className="mt-4 text-ink-soft">Pick the one that&apos;s closest. We&apos;ll show what&apos;s here for it, and say plainly when something isn&apos;t yet.</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div role="tablist" aria-label="What would help you today" aria-orientation="vertical" className="flex flex-col gap-2">
          {PATHWAYS.map((p) => {
            const selected = p.id === active;
            return (
              <button
                key={p.id}
                role="tab"
                id={`tab-${p.id}`}
                aria-selected={selected}
                aria-controls={`panel-${p.id}`}
                onClick={() => setActive(p.id)}
                className={`lift min-h-14 rounded-lg border px-5 py-3 text-left ${
                  selected ? "border-ink bg-paper shadow-soft" : "border-line bg-transparent hover:border-line-strong hover:bg-paper/60"
                }`}
              >
                <span className="block text-[1.05rem] text-ink">{p.label}</span>
                <span className="block text-[14px] text-ink-mute">{p.description}</span>
              </button>
            );
          })}
        </div>

        <div ref={panelRef} className="min-h-[18rem] scroll-mt-24">
          {!resolved ? (
            <div className="grain flex h-full min-h-[18rem] items-center rounded-lg bg-paper p-8 shadow-soft">
              <p className="hand max-w-[22ch]">Pick one, and we&apos;ll show you where to start.</p>
            </div>
          ) : (
            <div id={`panel-${resolved.pathway.id}`} role="tabpanel" aria-labelledby={`tab-${resolved.pathway.id}`} className="fade-in space-y-5">
              {resolved.tools.map((t) => (
                <div key={t.href} className="rounded-lg bg-paper p-6 shadow-soft">
                  <p className="text-[13px] uppercase tracking-wider text-sage-deep">Free · available now</p>
                  <h3 className="mt-2">{t.label}</h3>
                  <p className="mt-2 text-[15px] text-ink-soft">{t.description}</p>
                  <div className="mt-4"><LinkButton href={t.href} variant="secondary">Open it</LinkButton></div>
                </div>
              ))}
              {resolved.products.map((p) => {
                const meta = metaFor(p.handle);
                const price = formatMoney(p.price);
                return (
                  <Link key={p.id} href={`/products/${p.handle}`} className="lift block rounded-lg bg-paper p-6 shadow-soft">
                    <p className="text-[13px] uppercase tracking-wider text-sage-deep">{price === "Free" ? "Free download" : `Download · ${price}`}</p>
                    <h3 className="mt-2">{p.title}</h3>
                    <p className="mt-2 text-[15px] text-ink-soft">{meta?.task ?? p.benefit}</p>
                    {meta ? <p className="mt-1 text-[14px] text-ink-mute">{meta.who}</p> : null}
                    <span className="mt-4 inline-block text-[15px] text-ink underline underline-offset-4">See what&apos;s inside</span>
                  </Link>
                );
              })}
              {resolved.notYet ? (
                <div className="rounded-lg border border-dashed border-line-strong p-6">
                  <p className="text-[13px] uppercase tracking-wider text-ink-mute">Not yet</p>
                  <p className="mt-2 text-ink-soft">{resolved.notYet}</p>
                  <p className="mt-4 text-[14px] text-ink-mute">Want one email when it&apos;s ready?</p>
                  <div className="mt-2 max-w-md"><EmailCapture source={`finder-${resolved.pathway.id}`} cta="Tell me" /></div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
