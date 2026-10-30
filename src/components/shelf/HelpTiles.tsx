import Link from "next/link";
import { Binder, Folder, Notebook, Sheets, Sun, Ribbon } from "@/components/illustrations/Shapes";
import { PATHWAYS, resolvePathway } from "@/lib/resources";
import type { ProductSummary } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalize";

const TILE: Record<string, { bg: string; art: React.ReactNode; accent: string }> = {
  organize: { bg: "bg-glass", accent: "text-teal", art: <Folder tone="ocean" className="w-full" /> },
  appointment: { bg: "bg-sky", accent: "text-ocean", art: <Binder tone="teal" className="w-[70%]" /> },
  observe: { bg: "bg-sun", accent: "text-ink", art: <Notebook tone="coral" className="w-full" /> },
  routines: { bg: "bg-[#e6f4ea]", accent: "text-leaf-text", art: <Sun className="w-[70%]" /> },
  "next-steps": { bg: "bg-[#ffe9e1]", accent: "text-ink", art: <Sheets className="w-[70%]" /> },
};

const ORDER = ["organize", "appointment", "observe", "routines", "next-steps"];

/**
 * Section two. Five color-coded tiles, each with its own illustration and a
 * real next action. Available things link; unreleased things say "upcoming".
 */
export function HelpTiles({ catalog }: { catalog: ProductSummary[] }) {
  const tiles = ORDER.map((id) => PATHWAYS.find((p) => p.id === id)!).map((p) => ({ p, r: resolvePathway(p, catalog), t: TILE[p.id] }));
  return (
    <section id="help" className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-[var(--section-y)] sm:px-8" aria-labelledby="help-h">
      <Ribbon className="pointer-events-none absolute -top-6 right-0 hidden h-24 w-[40%] lg:block" />
      <div className="max-w-[40rem]">
        <p className="text-[13px] uppercase tracking-[0.2em] text-teal">Start where you are</p>
        <h2 id="help-h" className="mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.6rem)]">What could help <span className="display-italic">today?</span></h2>
      </div>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ p, r, t }, i) => {
          const first = r.products[0];
          const tool = r.tools[0];
          const href = tool?.href ?? (first ? `/products/${first.handle}` : "#upcoming");
          const status = tool ? "Free · available now" : first ? (formatMoney(first.price) === "Free" ? "Free download" : `Download · ${formatMoney(first.price)}`) : "Upcoming";
          const Tag = href.startsWith("#") ? "a" : Link;
          return (
            <li key={p.id} className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
              <Tag href={href} className={`lift group flex h-full flex-col overflow-hidden rounded-[24px] ${t.bg} shadow-soft`}>
                <div className={`flex ${i === 0 ? "min-h-[16rem] lg:min-h-[22rem]" : "min-h-[11rem]"} items-end justify-center px-8 pt-6`}>{t.art}</div>
                <div className="flex flex-1 flex-col p-6">
                  <p className={`text-[12px] uppercase tracking-[0.18em] ${t.accent}`}>{status}</p>
                  <h3 className="mt-2 text-[1.35rem] leading-snug">{tileLabel(p.id)}</h3>
                  <p className="mt-2 text-[15px] text-ink-soft">{tool?.description ?? first?.title ?? r.notYet ?? p.description}</p>
                  <span className="mt-auto pt-4 text-[15px] font-medium text-ink underline-offset-4 group-hover:underline">{tool ? "Open it" : first ? "See what's inside" : "What's coming"} →</span>
                </div>
              </Tag>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function tileLabel(id: string) {
  return (
    { organize: "Organize my information.", appointment: "Prepare for an appointment.", observe: "Record an observation.", routines: "Make everyday routines easier.", "next-steps": "Understand my next steps." } as Record<string, string>
  )[id];
}
