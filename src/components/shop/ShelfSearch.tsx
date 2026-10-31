"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ProductSummary } from "@/lib/shopify/types";
import { metaFor } from "@/lib/resources";
import { SHELVES, shelfFor, TINT_TEXT } from "@/lib/shelves";
import { formatMoney } from "@/lib/shopify/normalize";

type Hit = { href: string; title: string; line: string; meta: string; metaClass: string };

/**
 * Reads ?q= from the header search and lists matches across the catalog and
 * the free logger. Plain substring matching on title and sentence; the page
 * itself stays static.
 */
export function ShelfSearch({ catalog }: { catalog: ProductSummary[] }) {
  const q = (useSearchParams().get("q") ?? "").trim();
  if (!q) return null;
  const needle = q.toLowerCase();
  const hits: Hit[] = [];
  for (const p of catalog) {
    const meta = metaFor(p.handle);
    const hay = `${p.title} ${meta?.task ?? ""} ${p.benefit} ${p.tags.join(" ")}`.toLowerCase();
    if (hay.includes(needle)) {
      const shelf = shelfFor(p);
      hits.push({ href: `/products/${p.handle}`, title: p.title, line: meta?.task ?? p.benefit, meta: `${shelf?.title ?? "Shelf"} · ${formatMoney(p.price)}`, metaClass: shelf ? TINT_TEXT[shelf.tint] : "text-ink-mute" });
    }
  }
  const home = SHELVES.find((s) => s.tool)!;
  const toolHay = `${home.tool!.title} ${home.tool!.body} abc logger observation free`.toLowerCase();
  if (toolHay.includes(needle)) hits.push({ href: home.tool!.href, title: home.tool!.title, line: home.tool!.body, meta: `${home.title} · Free`, metaClass: TINT_TEXT[home.tint] });

  return (
    <section aria-labelledby="search-h" className="paper-card mt-8 p-6">
      <h2 id="search-h" className="text-[1.3rem]">
        {hits.length ? `${hits.length} ${hits.length === 1 ? "match" : "matches"} for “${q}”` : `“${q}” isn't on the shelf yet`}
      </h2>
      {hits.length ? (
        <ul className="mt-4 divide-y divide-line">
          {hits.map((h) => (
            <li key={h.href}>
              <Link href={h.href} className="flex min-h-14 flex-col justify-center py-3 no-underline hover:bg-cream-deep sm:flex-row sm:items-baseline sm:gap-4">
                <span className="text-[16px] text-ink">{h.title}</span>
                <span className="text-[14px] text-ink-soft sm:flex-1">{h.line}</span>
                <span className={`text-[13px] font-medium ${h.metaClass}`}>{h.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[15px] text-ink-soft">Not on the shelf yet. The four shelves below hold everything that exists today.</p>
      )}
    </section>
  );
}
