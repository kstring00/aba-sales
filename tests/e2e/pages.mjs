#!/usr/bin/env node
/** Every public page at 375px and 1280px: status, one H1, title, no overflow, internal links resolve. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://localhost:3100";
const SHOTS = path.resolve("tests/e2e/shots/pages");
fs.mkdirSync(SHOTS, { recursive: true });
const PAGES = ["/", "/shelf", "/products/care-binder", "/abc", "/cart", "/thanks", "/about", "/privacy", "/crisis", "/does-not-exist"];
const browser = await chromium.launch();
let failures = 0;
const seen = new Set();
for (const width of [375, 1280]) {
  const ctx = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 }, deviceScaleFactor: width === 375 ? 2 : 1, isMobile: width === 375 });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    const res = await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
    const status = res.status();
    const h1 = await page.locator("h1").count();
    const title = await page.title();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    // The product page needs a catalog (token or SHOPIFY_FIXTURES=1); skip it cleanly otherwise.
    if (p.startsWith("/products/") && status === 404) { console.log(`– ${width}px ${p} skipped (no catalog)`); continue; }
    const expected = p === "/does-not-exist" ? 404 : 200;
    const ok = status === expected && h1 === 1 && title.length > 0 && !overflow;
    if (!ok) failures++;
    console.log(`${ok ? "✓" : "✗"} ${width}px ${p} → ${status}, h1=${h1}, overflow=${overflow}, title="${title}"`);
    await page.screenshot({ path: path.join(SHOTS, `${width}-${p === "/" ? "home" : p.replace(/\//g, "_").replace(/^_/, "")}.png`), fullPage: width === 375 });
    if (width === 1280) {
      const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")));
      for (const h of hrefs) if (!h.includes("#") && !/\.(pdf|png|csv)$/.test(h)) seen.add(h.split("?")[0]);
    }
  }
  await ctx.close();
}
// Click every internal link once.
const ctx = await browser.newContext();
const page = await ctx.newPage();
for (const h of [...seen].sort()) {
  const res = await page.goto(`${BASE}${h}`);
  const ok = res.status() === 200;
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} link ${h} → ${res.status()}`);
}
await browser.close();
console.log(failures ? `\n${failures} failures` : "\nAll page checks passed.");
process.exitCode = failures ? 1 : 0;
