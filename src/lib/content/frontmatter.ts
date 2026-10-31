/**
 * Reads the simple front matter used in content/*.md. Deliberately not YAML:
 * one `key: value` per line, plus list blocks of `- item` lines, so the
 * founder can edit it without learning a syntax (see content/README.md).
 */
export type Source = { title: string; url: string };

export type FrontMatter = {
  title: string;
  description: string;
  status: "pending" | "draft" | "published";
  reviewedBy: string | null;
  lastReviewed: string | null;
  related: string[];
  sources: Source[];
  /** Any other keys, as raw strings. */
  extra: Record<string, string>;
};

const STATUSES = new Set(["pending", "draft", "published"]);

export function parseFrontMatter(file: string, raw: string): { data: FrontMatter; body: string } {
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) throw new Error(`${file}: missing the --- block at the top`);
  const lines = m[1].split("\n");
  const flat: Record<string, string> = {};
  const lists: Record<string, string[]> = {};
  let current: string | null = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && current) {
      (lists[current] ??= []).push(item[1].trim());
      continue;
    }
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) throw new Error(`${file}: can't read this line in the top block: "${line}"`);
    current = kv[1];
    flat[current] = kv[2].trim();
  }
  const status = (flat.status || "pending").toLowerCase();
  if (!STATUSES.has(status)) throw new Error(`${file}: status must be pending, draft or published (got "${flat.status}")`);
  if (!flat.title) throw new Error(`${file}: title is required`);
  const related = [...(flat.related ? flat.related.split(",") : []), ...(lists.related ?? [])].map((s) => s.trim()).filter(Boolean);
  const sources = (lists.sources ?? []).map((s) => {
    const [title, url] = s.split("|").map((x) => x.trim());
    if (!title || !url || !/^https?:\/\//.test(url)) throw new Error(`${file}: each source needs "Title | https://link" (got "${s}")`);
    return { title, url };
  });
  const known = new Set(["title", "description", "status", "reviewedBy", "lastReviewed", "related", "sources"]);
  const extra = Object.fromEntries(Object.entries(flat).filter(([k]) => !known.has(k)));
  return {
    data: {
      title: flat.title,
      description: flat.description ?? "",
      status: status as FrontMatter["status"],
      reviewedBy: flat.reviewedBy || null,
      lastReviewed: flat.lastReviewed || null,
      related,
      sources,
      extra,
    },
    body: text.slice(m[0].length),
  };
}

/** Splits a body into its `## ` sections. Text before the first heading is under "". */
export function splitSections(body: string): { heading: string; markdown: string; pending: boolean }[] {
  const out: { heading: string; markdown: string; pending: boolean }[] = [];
  let heading = "";
  let buf: string[] = [];
  const flush = () => {
    const md = buf.join("\n").trim();
    if (heading || md) {
      const withoutNotes = md.replace(/<!--[\s\S]*?-->/g, "").trim();
      out.push({ heading, markdown: md, pending: withoutNotes.length === 0 });
    }
  };
  for (const line of body.split("\n")) {
    const h = line.match(/^##\s+(.*?)\s*$/);
    if (h) {
      flush();
      heading = h[1];
      buf = [];
    } else buf.push(line);
  }
  flush();
  return out;
}
