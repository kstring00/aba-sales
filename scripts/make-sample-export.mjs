#!/usr/bin/env node
/**
 * Builds public/sample-export.pdf (+ PNG previews) from synthetic data.
 * Run after changing the PDF layout:  node scripts/make-sample-export.mjs
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("tsx/cjs");
// Alias server-only for a plain Node run.
const Module = require("node:module");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (req, ...rest) {
  if (req === "server-only") return require.resolve("../tests/mocks/server-only.ts");
  return origResolve.call(this, req, ...rest);
};
process.env.TS_NODE_TRANSPILE_ONLY = "1";
const { buildReport } = require("../src/lib/export/report.ts");
const { renderReportPdf } = require("../src/lib/export/pdf.ts");
const { sampleEntries } = require("../src/lib/export/fixtures.ts");

const report = buildReport({
  nickname: "Bean",
  from: "2026-03-02",
  to: "2026-03-15",
  tz: "America/Chicago",
  entries: sampleEntries(),
  generatedAt: new Date("2026-03-16T12:00:00Z"),
});
const bytes = await renderReportPdf(report);
writeFileSync("public/sample-export.pdf", bytes);
console.log(`public/sample-export.pdf (${bytes.byteLength} bytes)`);
try {
  execFileSync("pdftoppm", ["-png", "-r", "110", "-f", "1", "-l", "3", "public/sample-export.pdf", "public/sample-export"]);
  for (const n of ["1", "2", "3"]) {
    const f = `public/sample-export-${n}.png`;
    if (existsSync(f)) console.log(f);
  }
} catch {
  console.log("pdftoppm not available; skipped PNG previews");
}
