#!/usr/bin/env node
/** Screenshots of every public route at 375 and 768 for the launch checklist. */
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://localhost:3100";
const OUT = "tests/e2e/shots/launch";
fs.mkdirSync(OUT, { recursive: true });
const ROUTES = ["/", "/shelf", "/abc", "/about", "/privacy", "/crisis", "/cart", "/thanks", "/products/care-binder", "/does-not-exist"];
const browser = await chromium.launch();
for (const w of [375, 768]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w === 375 ? 812 : 1024 }, deviceScaleFactor: 2, isMobile: w === 375 });
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto(`${BASE}${r}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2800); // let reveals settle
    const overflow = await page.evaluate((vw) => document.documentElement.scrollWidth > vw, w);
    const small = await page.evaluate(() => [...document.querySelectorAll("a[href], button")].filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden" && !el.classList.contains("sr-only")).map((el) => el.getBoundingClientRect()).filter((b) => b.width > 0 && b.height > 0 && Math.max(b.width, b.height) < 44).length);
    console.log(`${w}px ${r.padEnd(24)} overflow=${overflow} small-targets=${small}`);
    await page.screenshot({ path: `${OUT}/${w}-${r === "/" ? "home" : r.replace(/\//g, "_").replace(/^_/, "")}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
