import { Fragment } from "react";
import { ui, type GlossaryTerm } from "@/lib/content/data";
import { buildMatcher } from "@/lib/content/terms";
import { Term } from "@/components/hub/Term";

/**
 * Interim text rendering for a content section until the Markdown renderer
 * is chosen: paragraphs only, author notes removed. When `linker` is given,
 * the first occurrence on the page of each glossary term becomes a <Term>.
 * Only reachable on preview builds while hub pages are pending.
 */
export type Linker = { find: ReturnType<typeof buildMatcher>; used: Set<string> };

export function makeLinker(terms: GlossaryTerm[]): Linker {
  return { find: buildMatcher(terms), used: new Set() };
}

function linked(text: string, linker?: Linker) {
  if (!linker) return text;
  const out: React.ReactNode[] = [];
  let at = 0;
  for (const m of linker.find(text)) {
    if (linker.used.has(m.term.slug)) continue;
    linker.used.add(m.term.slug);
    out.push(text.slice(at, m.start));
    out.push(<Term key={m.start} text={m.text} full={m.term.full} short={m.term.short} href={`/learn/glossary#${m.term.slug}`} />);
    at = m.end;
  }
  out.push(text.slice(at));
  return out.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}

export function SectionText({ markdown, pending, linker }: { markdown: string; pending: boolean; linker?: Linker }) {
  if (pending) return <p className="text-[15px] italic text-ink-mute">{ui.pending.slotWaiting}</p>;
  const paras = markdown.replace(/<!--[\s\S]*?-->/g, "").trim().split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[1.05rem] leading-relaxed text-ink-body">
      {paras.map((p, i) => <p key={i}>{linked(p.replace(/\n/g, " "), linker)}</p>)}
    </div>
  );
}
