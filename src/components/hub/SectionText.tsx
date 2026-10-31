import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ui, type GlossaryTerm } from "@/lib/content/data";
import { buildMatcher } from "@/lib/content/terms";
import { Term } from "@/components/hub/Term";

/**
 * Renders one content section. A deliberately small Markdown subset, built
 * in-repo so no dependency ships: paragraphs, "- " bullet lists, "1. "
 * numbered lists, **bold**, *italic* and [links](url). Author notes
 * (<!-- … -->) are removed. Output is React elements only (never raw HTML),
 * so nothing in a content file can inject markup.
 *
 * When `linker` is given, the first occurrence on the page of each glossary
 * term becomes a <Term> popover.
 */
export type Linker = { find: ReturnType<typeof buildMatcher>; used: Set<string> };

export function makeLinker(terms: GlossaryTerm[]): Linker {
  return { find: buildMatcher(terms), used: new Set() };
}

function linked(text: string, linker: Linker | undefined, key: string): ReactNode[] {
  if (!linker) return [text];
  const out: ReactNode[] = [];
  let at = 0;
  for (const m of linker.find(text)) {
    if (linker.used.has(m.term.slug)) continue;
    linker.used.add(m.term.slug);
    out.push(text.slice(at, m.start));
    out.push(<Term key={`${key}-t${m.start}`} text={m.text} full={m.term.full} short={m.term.short} href={`/learn/glossary#${m.term.slug}`} />);
    at = m.end;
  }
  out.push(text.slice(at));
  return out;
}

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Inline Markdown → React. Glossary links apply to plain text and emphasis, never inside links. */
export function inline(text: string, linker?: Linker, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const k = `${key}-${n++}`;
    out.push(...linked(text.slice(at, m.index), linker, `${k}p`));
    if (m[1] !== undefined) out.push(<strong key={k} className="font-semibold text-ink">{linked(m[1], linker, k)}</strong>);
    else if (m[2] !== undefined) out.push(<em key={k}>{linked(m[2], linker, k)}</em>);
    else {
      const href = m[4];
      const cls = "text-heading underline underline-offset-4 hover:text-accent-text";
      if (href.startsWith("/")) out.push(<Link key={k} href={href} className={cls}>{m[3]}</Link>);
      else if (/^(https?:|mailto:|tel:)/.test(href)) out.push(<a key={k} href={href} className={cls} rel="noopener noreferrer">{m[3]}</a>);
      else out.push(m[3]); // unknown scheme: show the words, drop the link
    }
    at = m.index + m[0].length;
  }
  out.push(...linked(text.slice(at), linker, `${key}-end`));
  return out.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}

type Block = { kind: "p"; text: string } | { kind: "ul" | "ol"; items: string[] };

/** Splits a section into paragraphs and lists. Exported for tests. */
export function blocks(markdown: string): Block[] {
  const lines = markdown.replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/);
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ kind: "p", text: para.join(" ").trim() });
    para = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (!line) { flush(); continue; }
    if (ul || ol) {
      flush();
      const kind = ul ? "ul" : "ol";
      const last = out[out.length - 1];
      const text = (ul ?? ol)![1];
      if (last && last.kind === kind) last.items.push(text);
      else out.push({ kind, items: [text] });
      continue;
    }
    // A wrapped line continues the previous list item.
    const last = out[out.length - 1];
    if (!para.length && last && last.kind !== "p" && /^\s/.test(raw)) {
      last.items[last.items.length - 1] += ` ${line}`;
      continue;
    }
    para.push(line);
  }
  flush();
  return out.filter((b) => b.kind !== "p" || b.text);
}

export function SectionText({ markdown, pending, linker }: { markdown: string; pending: boolean; linker?: Linker }) {
  if (pending) return <p className="text-[15px] italic text-ink-mute">{ui.pending.slotWaiting}</p>;
  return (
    <div className="space-y-4 text-[1.05rem] leading-relaxed text-ink-body">
      {blocks(markdown).map((b, i) => {
        if (b.kind === "p") return <p key={i}>{inline(b.text, linker, `b${i}`)}</p>;
        const items = b.items.map((it, j) => <li key={j}>{inline(it, linker, `b${i}-${j}`)}</li>);
        return b.kind === "ul"
          ? <ul key={i} className="list-disc space-y-2 pl-6 marker:text-accent">{items}</ul>
          : <ol key={i} className="list-decimal space-y-2 pl-6 marker:text-ink-mute">{items}</ol>;
      })}
    </div>
  );
}
