import { ui } from "@/lib/content/data";

/**
 * Interim text rendering for a content section until the Markdown renderer
 * is chosen: paragraphs only, no formatting, author notes removed. Only
 * reachable on preview builds while every hub page is still pending.
 */
export function SectionText({ markdown, pending }: { markdown: string; pending: boolean }) {
  if (pending) return <p className="text-[15px] italic text-ink-mute">{ui.pending.slotWaiting}</p>;
  const paras = markdown.replace(/<!--[\s\S]*?-->/g, "").trim().split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[1.05rem] leading-relaxed text-ink-body">
      {paras.map((p, i) => <p key={i}>{p.replace(/\n/g, " ")}</p>)}
    </div>
  );
}
