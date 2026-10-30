#!/usr/bin/env node
/**
 * Live run against the deployed site: shelf → paid product → cart → Shopify
 * checkout (test mode) → /thanks. Best effort through Shopify's checkout UI;
 * screenshots every step so a human can finish if a field moves.
 *
 *   BASE=https://your-site.vercel.app node tests/e2e/live-checkout.mjs
 *
 * Requires Shopify Payments test mode (or the Bogus Gateway) to be enabled.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE;
if (!BASE) { console.error("Set BASE to the deployed site URL."); process.exit(2); }
const SHOTS = path.resolve("tests/e2e/shots/live");
fs.mkdirSync(SHOTS, { recursive: true });
let n = 0;
const shot = (page, l) => page.screenshot({ path: path.join(SHOTS, `${String(++n).padStart(2, "0")}-${l}.png`), fullPage: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
page.setDefaultTimeout(30000);
try {
  await page.goto(`${BASE}/shelf`, { waitUntil: "networkidle" });
  const cards = page.locator("a[href^='/products/']");
  const count = await cards.count();
  console.log(`shelf: ${count} product cards`);
  await shot(page, "shelf");
  if (count === 0) throw new Error("No products on /shelf. Check SHOPIFY_STOREFRONT_TOKEN and Headless publication.");
  // Prefer a paid product so checkout exercises payment.
  let target = null;
  for (let i = 0; i < count; i++) {
    const text = await cards.nth(i).innerText();
    if (/\$\d/.test(text)) { target = cards.nth(i); break; }
  }
  await (target ?? cards.first()).click();
  await page.waitForURL(/\/products\//);
  await shot(page, "product");
  await page.getByRole("button", { name: /add to cart|get it free/i }).first().click();
  await page.waitForURL(/\/cart/);
  await shot(page, "cart");
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.waitForURL((u) => !u.href.startsWith(BASE), { timeout: 30000 });
  console.log("checkout url:", page.url());
  await page.waitForLoadState("networkidle");
  await shot(page, "shopify-checkout");

  // Best-effort form fill for Shopify checkout (test mode).
  const fill = async (label, value) => {
    const el = page.getByLabel(label, { exact: false }).first();
    if (await el.count()) { await el.fill(value); return true; }
    return false;
  };
  await fill(/email/i, process.env.TEST_EMAIL ?? "test-buyer@example.com");
  await fill(/first name/i, "Test");
  await fill(/last name/i, "Buyer");
  await fill(/address/i, "123 Test St");
  await fill(/city/i, "Austin");
  await fill(/zip|postal/i, "78701");
  // Card fields live in iframes.
  for (const frame of page.frames()) {
    try {
      const num = frame.getByLabel(/card number/i).first();
      if (await num.count()) await num.fill("1");
      const name = frame.getByLabel(/name on card/i).first();
      if (await name.count()) await name.fill("Bogus Gateway");
      const exp = frame.getByLabel(/expiration/i).first();
      if (await exp.count()) await exp.fill("12/30");
      const cvv = frame.getByLabel(/security code|cvv/i).first();
      if (await cvv.count()) await cvv.fill("111");
    } catch { /* not this frame */ }
  }
  await shot(page, "checkout-filled");
  const pay = page.getByRole("button", { name: /pay now|complete order|place order/i }).first();
  if (await pay.count()) {
    await pay.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    await shot(page, "after-pay");
    console.log("after pay:", page.url());
    const cont = page.getByRole("link", { name: /continue shopping|back to/i }).first();
    if (await cont.count()) {
      await cont.click();
      await page.waitForLoadState("networkidle");
      console.log("continue link went to:", page.url());
      await shot(page, "thanks");
      console.log(page.url().startsWith(`${BASE}/thanks`) ? "✓ landed on /thanks" : "✗ continue link does not point at /thanks (set it in Shopify checkout settings)");
    } else {
      console.log("no continue-shopping link found; check Shopify checkout settings");
    }
  } else {
    console.log("Pay button not found; checkout UI differs. See screenshots to finish by hand.");
  }
} catch (e) {
  await shot(page, "FAILED").catch(() => {});
  console.log("failed:", e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
  console.log(`screenshots: ${SHOTS}`);
}
