#!/usr/bin/env node
/**
 * Crawls every public route of a running build, collects every internal and
 * external link, and requests each once. Internal links must return 200
 * (or a redirect that lands on 200). External links are HEAD/GET-checked
 * and reported; a network block in the environment is reported, not failed.
 *   BASE=http://localhost:3100 node scripts/link-check.mjs
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://localhost:3100";
const ROUTES = ["/", "/shelf", "/abc", "/about", "/privacy", "/crisis", "/cart", "/thanks", "/products/care-binder", "/products/home-abc-printable", "/products/waitlist-playbook", "/products/read-your-childs-treatment-plan", "/right-now", "/for-you", "/for-you/breathe", "/for-you/ground", "/for-you/research", "/learn", "/learn/glossary", "/learn/decode", "/find-care?age=under-3&coverage=medicaid&state=TX"];
const browser = await chromium.launch();
const page = await browser.newPage();
const internal = new Set();
const external = new Set();
for (const r of ROUTES) {
  const res = await page.goto(`${BASE}${r}`, { waitUntil: "load" });
  if (!res || res.status() >= 400) { console.log(`✗ route ${r} → ${res?.status()}`); continue; }
  if (r === "/") { for (const n of [/make a plan/i, /everyday life/i, /support at home/i]) { await page.getByRole("button", { name: n }).click(); await page.waitForTimeout(100); } }
  if (r === "/right-now") { await page.getByRole("button", { name: /No, we're safe/ }).click(); }
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  for (const h of hrefs) {
    if (!h || h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("tel:") || h.startsWith("sms:")) continue;
    if (h.startsWith("/")) internal.add(h.split("#")[0].split("?")[0]);
    else if (/^https?:/.test(h)) external.add(h);
  }
}
let failures = 0;
for (const h of [...internal].sort()) {
  let status;
  if (/\.(pdf|png|csv|jpg|svg)$/i.test(h)) {
    status = (await fetch(`${BASE}${h}`, { method: "HEAD" })).status; // files download; don't navigate
  } else {
    const res = await page.goto(`${BASE}${h}`, { waitUntil: "load" });
    status = res?.status();
  }
  const ok = status === 200;
  if (!ok) failures++;
  console.log(`${ok ? "✓" : "✗"} ${h} → ${status}`);
}
for (const h of [...external].sort()) {
  try {
    const res = await fetch(h, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(10000) });
    console.log(`${res.ok ? "✓" : "✗"} ${h} → ${res.status}`);
    if (!res.ok) failures++;
  } catch (e) {
    console.log(`– ${h} → not reachable from this environment (${e?.cause?.code ?? e?.name ?? "error"})`);
  }
}
await browser.close();
console.log(failures ? `\n${failures} broken links` : `\nAll ${internal.size} internal links resolve; ${external.size} external links listed above.`);
process.exitCode = failures ? 1 : 0;
