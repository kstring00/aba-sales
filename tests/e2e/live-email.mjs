#!/usr/bin/env node
/**
 * Live run: log two entries on the deployed /abc and email the export.
 *   BASE=https://your-site.vercel.app TEST_EMAIL=you@example.com node tests/e2e/live-email.mjs
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE, EMAIL = process.env.TEST_EMAIL;
if (!BASE || !EMAIL) { console.error("Set BASE and TEST_EMAIL."); process.exit(2); }
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
page.setDefaultTimeout(30000);
try {
  await page.goto(`${BASE}/abc`, { waitUntil: "networkidle" });
  await page.getByLabel("Nickname").fill("Sample");
  await page.getByRole("button", { name: /start logging/i }).click();
  for (const [b, a, c] of [["Hitting", "An instruction was given", "The activity or instruction stopped"], ["Screaming", "The child was alone", "Someone offered comfort"]]) {
    await page.getByRole("button", { name: /log what happened/i }).click();
    const d = page.getByRole("dialog");
    await d.getByRole("button", { name: b, exact: true }).click();
    await d.getByRole("button", { name: a, exact: true }).click();
    await d.getByRole("button", { name: c, exact: true }).click();
    await d.getByRole("button", { name: "Save", exact: true }).click();
    await d.waitFor({ state: "detached" });
  }
  await page.getByLabel("Email me my export").fill(EMAIL);
  const [res] = await Promise.all([page.waitForResponse((r) => r.url().includes("/api/abc/email-export")), page.getByRole("button", { name: "Send", exact: true }).click()]);
  const body = await res.json().catch(() => ({}));
  console.log(`email-export → ${res.status()} ${JSON.stringify(body)}`);
  console.log(res.status() === 200 ? `✓ sent to ${EMAIL}; check the inbox` : "✗ not sent");
  process.exitCode = res.status() === 200 ? 0 : 1;
} finally {
  await browser.close();
}
