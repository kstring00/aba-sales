import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/export/report";
import { renderReportPdf } from "@/lib/export/pdf";
import { sampleEntries } from "@/lib/export/fixtures";
import { PDFDocument } from "pdf-lib";
import { loadFontBytesFromDisk } from "@/lib/export/fonts.server";

describe("renderReportPdf", () => {
  it("produces one page per week plus a counts page, with brand fonts embedded", async () => {
    const report = buildReport({
      nickname: "Bean",
      from: "2026-03-02",
      to: "2026-03-15",
      tz: "America/Chicago",
      entries: sampleEntries(),
      generatedAt: new Date("2026-03-16T12:00:00Z"),
    });
    const bytes = await renderReportPdf(report, await loadFontBytesFromDisk());
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(3); // 2 weeks + counts
    expect(doc.getTitle()).toContain("Bean");
    expect(bytes.byteLength).toBeLessThan(900_000); // Inter embedded whole; Fraunces subset
  });

  it("survives notes with characters the fonts cannot shape", async () => {
    const entries = sampleEntries().slice(0, 2);
    entries[0].note = "Happy 😀 then ✨ calm — fine";
    const report = buildReport({ nickname: "Bean", from: "2026-03-02", to: "2026-03-08", tz: "America/Chicago", entries });
    const bytes = await renderReportPdf(report, await loadFontBytesFromDisk());
    expect(bytes.byteLength).toBeGreaterThan(1000);
  });
});
