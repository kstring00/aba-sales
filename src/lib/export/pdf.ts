import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { fmtRangeLabel, type Count, type Report, type ReportRow } from "./report";

/** Pro "custom report layouts". Free exports always use the defaults. */
export type PdfOptions = { notes: boolean; details: boolean; counts: boolean };
export const DEFAULT_PDF_OPTIONS: PdfOptions = { notes: true, details: true, counts: true };

/**
 * PDF export. One page per week (continuing onto extra pages when a week is
 * long), then a counts page. Letter size, generous margins, brand fonts.
 * The document describes what was recorded. It never interprets.
 */

const PAGE = { w: 612, h: 792 };
const M = { l: 48, r: 48, t: 56, b: 56 };
const INK = rgb(0.133, 0.122, 0.102);
const INK_SOFT = rgb(0.29, 0.275, 0.247);
const INK_MUTE = rgb(0.48, 0.46, 0.42);
const LINE = rgb(0.886, 0.855, 0.796);
const SAGE = rgb(0.541, 0.604, 0.482);
const CREAM = rgb(0.965, 0.945, 0.906);

const FONT_DIR = path.join(process.cwd(), "src", "lib", "export", "fonts");

type Fonts = { body: PDFFont; bold: PDFFont; display: PDFFont };

async function loadFonts(doc: PDFDocument): Promise<Fonts> {
  doc.registerFontkit(fontkit);
  const [r, b, d] = await Promise.all([
    readFile(path.join(FONT_DIR, "Inter-Regular.ttf")),
    readFile(path.join(FONT_DIR, "Inter-SemiBold.ttf")),
    readFile(path.join(FONT_DIR, "Fraunces-Medium.ttf")),
  ]);
  // Inter from Google Fonts is a variable font; fontkit's subsetter drops
  // glyphs from it, so Inter is embedded whole (~325 KB each). Fraunces
  // subsets cleanly.
  return {
    body: await doc.embedFont(r, { subset: false }),
    bold: await doc.embedFont(b, { subset: false }),
    display: await doc.embedFont(d, { subset: true }),
  };
}

/** Drop characters the font can't shape (emoji, unusual symbols) rather than fail. */
function safe(font: PDFFont, text: string): string {
  try {
    font.widthOfTextAtSize(text, 10);
    return text;
  } catch {
    return Array.from(text)
      .filter((ch) => {
        try {
          font.widthOfTextAtSize(ch, 10);
          return true;
        } catch {
          return false;
        }
      })
      .join("");
  }
}

function wrap(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const clean = safe(font, text.replace(/\s+/g, " ").trim());
  if (!clean) return [""];
  const words = clean.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      cur = candidate;
    } else {
      if (cur) lines.push(cur);
      // Hard-break very long words.
      if (font.widthOfTextAtSize(w, size) > maxWidth) {
        let piece = "";
        for (const ch of w) {
          if (font.widthOfTextAtSize(piece + ch, size) > maxWidth) {
            lines.push(piece);
            piece = ch;
          } else piece += ch;
        }
        cur = piece;
      } else cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

type Col = { key: keyof ReportRow | "when"; label: string; w: number };
const CONTENT_W = PAGE.w - M.l - M.r;

function columnsFor(o: PdfOptions): Col[] {
  const cols: Col[] = [
    { key: "when", label: "When", w: 64 },
    { key: "noticed", label: "Noticed", w: 84 },
    { key: "before", label: "Right before", w: o.notes ? 94 : 140 },
    { key: "after", label: "Right after", w: o.notes ? 94 : 140 },
  ];
  if (o.details) cols.push({ key: "duration", label: "How long", w: 46 }, { key: "intensity", label: "Intensity", w: 50 });
  if (o.notes) cols.push({ key: "note", label: "Note", w: 0 });
  // Last column takes the remainder.
  const used = cols.slice(0, -1).reduce((a, c) => a + c.w, 0);
  cols[cols.length - 1].w = CONTENT_W - used;
  return cols;
}

function cellText(r: ReportRow, key: Col["key"]): string {
  if (key === "when") {
    const [, m, d] = r.date.split("-");
    return `${Number(m)}/${Number(d)}  ${r.time}`;
  }
  if (key === "before") return r.beforeNote ? `${r.before}: ${r.beforeNote}` : r.before;
  if (key === "after") return r.afterNote ? `${r.after}: ${r.afterNote}` : r.after;
  return String(r[key] ?? "");
}

class Painter {
  readonly COLS: Col[];
  constructor(
    readonly doc: PDFDocument,
    readonly fonts: Fonts,
    readonly report: Report,
    readonly options: PdfOptions,
  ) {
    this.COLS = columnsFor(options);
  }
  pages: PDFPage[] = [];

  newPage(title: string, subtitle: string): { page: PDFPage; y: number } {
    const page = this.doc.addPage([PAGE.w, PAGE.h]);
    this.pages.push(page);
    let y = PAGE.h - M.t;
    page.drawText(safe(this.fonts.display, title), { x: M.l, y: y - 20, size: 22, font: this.fonts.display, color: INK });
    y -= 30;
    page.drawText(safe(this.fonts.body, subtitle), { x: M.l, y: y - 10, size: 9.5, font: this.fonts.body, color: INK_MUTE });
    y -= 14;
    page.drawLine({ start: { x: M.l, y: y - 8 }, end: { x: PAGE.w - M.r, y: y - 8 }, thickness: 0.75, color: INK });
    y -= 22;
    return { page, y };
  }

  footerAll() {
    const n = this.pages.length;
    this.pages.forEach((page, i) => {
      const left = `${this.report.nickname} · ${fmtRangeLabel(this.report.from, this.report.to)} · Recorded by a parent or caregiver with The Support Shelf`;
      page.drawText(safe(this.fonts.body, left), { x: M.l, y: M.b - 24, size: 7.5, font: this.fonts.body, color: INK_MUTE });
      const right = `Page ${i + 1} of ${n}`;
      const w = this.fonts.body.widthOfTextAtSize(right, 7.5);
      page.drawText(right, { x: PAGE.w - M.r - w, y: M.b - 24, size: 7.5, font: this.fonts.body, color: INK_MUTE });
    });
  }

  tableHeader(page: PDFPage, y: number): number {
    let x = M.l;
    for (const c of this.COLS) {
      page.drawText(c.label.toUpperCase(), { x, y: y - 8, size: 7, font: this.fonts.bold, color: INK_MUTE });
      x += c.w;
    }
    page.drawLine({ start: { x: M.l, y: y - 14 }, end: { x: PAGE.w - M.r, y: y - 14 }, thickness: 0.5, color: LINE });
    return y - 22;
  }

  drawWeek(week: Report["weeks"][number], index: number) {
    const title = `Week ${index + 1}`;
    const sub = `${fmtRangeLabel(week.start, week.end)} · ${week.rows.length} ${week.rows.length === 1 ? "entry" : "entries"} · ${this.report.nickname}`;
    let { page, y } = this.newPage(title, sub);
    y = this.tableHeader(page, y);

    if (week.rows.length === 0) {
      page.drawText("Nothing was recorded this week.", { x: M.l, y: y - 10, size: 10, font: this.fonts.body, color: INK_MUTE });
      return;
    }

    const size = 8.5;
    const lh = 11;
    const padY = 5;
    for (const r of week.rows) {
      const cells = this.COLS.map((c) => wrap(this.fonts.body, cellText(r, c.key), size, c.w - 8));
      const lines = Math.max(...cells.map((c) => c.length));
      const rowH = lines * lh + padY * 2;
      if (y - rowH < M.b) {
        ({ page, y } = this.newPage(`${title}, continued`, sub));
        y = this.tableHeader(page, y);
      }
      let x = M.l;
      cells.forEach((cellLines, i) => {
        const col = this.COLS[i];
        const font = col.key === "noticed" ? this.fonts.bold : this.fonts.body;
        const color = col.key === "when" ? INK_MUTE : INK;
        cellLines.forEach((ln, li) => {
          page.drawText(ln, { x, y: y - padY - lh * (li + 1) + 3, size, font, color });
        });
        x += col.w;
      });
      y -= rowH;
      page.drawLine({ start: { x: M.l, y }, end: { x: PAGE.w - M.r, y }, thickness: 0.4, color: LINE });
    }
  }

  drawCounts() {
    const r = this.report;
    let { page, y } = this.newPage(
      "Counts",
      `${fmtRangeLabel(r.from, r.to)} · ${r.total} ${r.total === 1 ? "entry" : "entries"} in total · ${r.nickname}`,
    );

    const note =
      "These counts describe what was recorded during this period. They do not explain why anything happened, and they are not an assessment.";
    for (const ln of wrap(this.fonts.body, note, 9.5, CONTENT_W)) {
      page.drawText(ln, { x: M.l, y: y - 10, size: 9.5, font: this.fonts.body, color: INK_SOFT });
      y -= 13;
    }
    y -= 10;

    const sections: Array<[string, Count[]]> = [
      ["What was noticed", r.byBehavior],
      ["Right before", r.byAntecedent],
      ["Right after", r.byConsequence],
      ["Intensity, when recorded", r.byIntensity.filter((c) => c.label !== "Not recorded")],
    ];
    for (const [heading, counts] of sections) {
      if (counts.length === 0) continue;
      const needed = 28 + counts.length * 18;
      if (y - needed < M.b) {
        ({ page, y } = this.newPage("Counts, continued", `${fmtRangeLabel(r.from, r.to)} · ${r.nickname}`));
      }
      page.drawText(safe(this.fonts.display, heading), { x: M.l, y: y - 12, size: 13, font: this.fonts.display, color: INK });
      y -= 26;
      const max = Math.max(...counts.map((c) => c.count), 1);
      const labelW = 190;
      const barMaxW = CONTENT_W - labelW - 40;
      for (const c of counts) {
        const label = wrap(this.fonts.body, c.label, 9, labelW - 8)[0];
        page.drawText(label, { x: M.l, y: y - 9, size: 9, font: this.fonts.body, color: INK });
        const w = Math.max(2, (c.count / max) * barMaxW);
        page.drawRectangle({ x: M.l + labelW, y: y - 12, width: barMaxW, height: 10, color: CREAM });
        page.drawRectangle({ x: M.l + labelW, y: y - 12, width: w, height: 10, color: SAGE });
        page.drawText(String(c.count), { x: M.l + labelW + barMaxW + 8, y: y - 9.5, size: 9, font: this.fonts.bold, color: INK });
        y -= 18;
      }
      y -= 10;
    }
  }
}

export async function renderReportPdf(report: Report, options: PdfOptions = DEFAULT_PDF_OPTIONS): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Observations for ${report.nickname} · ${fmtRangeLabel(report.from, report.to)}`);
  doc.setAuthor("The Support Shelf (recorded by a parent or caregiver)");
  doc.setProducer("The Support Shelf");
  doc.setCreationDate(report.generatedAt);
  const fonts = await loadFonts(doc);
  const p = new Painter(doc, fonts, report, options);
  report.weeks.forEach((w, i) => p.drawWeek(w, i));
  if (options.counts) p.drawCounts();
  p.footerAll();
  return doc.save();
}
