#!/usr/bin/env node
/** axe-core pass on every public page at 375px. Fails on any serious/critical violation. */
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axeSource = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.env.BASE ?? "http://localhost:3100";
const PAGES = ["/", "/shelf", "/products/care-binder", "/abc", "/cart", "/thanks", "/about", "/privacy", "/crisis", "/does-not-exist"];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
let bad = 0;
for (const p of PAGES) {
  const res = await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
  if (p.startsWith("/products/") && res.status() === 404) { console.log(`– ${p} skipped (no catalog)`); continue; }
  if (p === "/") {
    // Pull a binder forward (drawer open) and open the header search too.
    await page.getByRole("button", { name: /make a plan/i }).click();
    await page.waitForTimeout(900);
    await page.locator("summary[aria-label='Search the shelves']").click();
  }
  if (p === "/abc") {
    // Exercise the tracker too: save an entry, then open the edit sheet.
    await page.getByLabel("Child nickname").fill("Bean");
    await page.getByRole("button", { name: "Hitting", exact: true }).click();
    await page.getByRole("button", { name: "Save entry" }).click();
    await page.getByText(/Entries · 1/).waitFor();
    await page.getByRole("button", { name: /edit entry: hitting/i }).first().click();
    await page.getByRole("dialog").waitFor();
  }
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] } }));
  const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  const minor = results.violations.filter((v) => !["serious", "critical"].includes(v.impact));
  bad += serious.length;
  console.log(`${serious.length ? "✗" : "✓"} ${p}: ${serious.length} serious/critical, ${minor.length} minor`);
  for (const v of [...serious, ...minor]) console.log(`    [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"}) e.g. ${v.nodes[0]?.target?.[0]}`);
  // Tap targets: every button/link at least 44px in one dimension and 24px in the other.
  const small = await page.evaluate(() =>
    [...document.querySelectorAll("a[href], button, input, select, textarea, [role=tab]")]
      .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden" && !el.classList.contains("sr-only"))
      .map((el) => ({ tag: el.tagName, text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30), ...el.getBoundingClientRect().toJSON() }))
      .filter((r) => r.width > 0 && r.height > 0 && Math.max(r.width, r.height) < 44),
  );
  if (small.length) console.log(`    small tap targets: ${small.map((s) => `${s.tag}"${s.text}"(${Math.round(s.width)}×${Math.round(s.height)})`).join(", ")}`);
  if (p === "/abc") await page.evaluate(() => localStorage.clear());
}
await browser.close();
console.log(bad ? `\n${bad} serious/critical violations` : "\nNo serious or critical accessibility violations.");
process.exitCode = bad ? 1 : 0;
