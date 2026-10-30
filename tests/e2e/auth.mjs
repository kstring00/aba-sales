#!/usr/bin/env node
/**
 * Magic-link robustness against the local stand-in.
 *   node tests/e2e/auth.mjs
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE ?? "http://localhost:3100";
const STANDIN = process.env.STANDIN ?? "http://localhost:54321";
let passed = 0;
async function step(name, fn) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n")[0]}`); throw e; }
}
async function request(page, email) {
  await page.goto(`${BASE}/sign-in`);
  await page.getByLabel("Email").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /email me a sign-in link/i }).click();
  await page.getByText(/check your email/i).waitFor();
  const box = await (await fetch(`${STANDIN}/_dev/outbox`)).json();
  const m = box.filter((x) => x.to === email).pop();
  return { code: m.link.replace("http://localhost:3000", BASE), confirm: m.confirm_link.replace("http://localhost:3000", BASE) };
}

const browser = await chromium.launch();
try {
  console.log("Magic-link robustness");

  await step("default template, same browser: landing on /auth/confirm and pressing Continue signs in", async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const { code } = await request(page, `same-${Date.now()}@example.test`);
    await page.goto(code);
    await page.getByRole("button", { name: "Continue" }).waitFor();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/app/);
    await ctx.close();
  });

  await step("a scanner pre-opening the link (GET) does not consume it", async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const { code, confirm } = await request(page, `scan-${Date.now()}@example.test`);
    await fetch(code, { redirect: "manual" });
    await fetch(confirm, { redirect: "manual" });
    await page.goto(confirm);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/app/);
    await ctx.close();
  });

  await step("token_hash template, different browser: still signs in", async () => {
    const a = await browser.newContext();
    const pa = await a.newPage();
    const { confirm } = await request(pa, `cross-${Date.now()}@example.test`);
    const b = await browser.newContext();
    const pb = await b.newPage();
    await pb.goto(confirm);
    await pb.getByRole("button", { name: "Continue" }).click();
    await pb.waitForURL(/\/app/);
    await a.close();
    await b.close();
  });

  await step("default template, different browser: explains the browser mismatch instead of a blank bounce", async () => {
    const a = await browser.newContext();
    const pa = await a.newPage();
    const { code } = await request(pa, `cross2-${Date.now()}@example.test`);
    const b = await browser.newContext();
    const pb = await b.newPage();
    await pb.goto(code);
    await pb.getByRole("button", { name: "Continue" }).click();
    await pb.waitForURL(/sign-in\?error=callback&reason=browser/);
    await pb.getByText(/different browser/i).waitFor();
    await a.close();
    await b.close();
  });

  await step("a used link says so", async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const { confirm } = await request(page, `used-${Date.now()}@example.test`);
    await page.goto(confirm);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/app/);
    const other = await browser.newContext();
    const p2 = await other.newPage();
    await p2.goto(confirm);
    await p2.getByRole("button", { name: "Continue" }).click();
    await p2.waitForURL(/reason=(used|expired)/);
    await ctx.close();
    await other.close();
  });

  await step("a code that lands on the homepage (redirect URL not allowlisted) still signs in", async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const { code } = await request(page, `root-${Date.now()}@example.test`);
    const c = new URL(code).searchParams.get("code");
    await page.goto(`${BASE}/?code=${c}`);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForURL(/\/app/);
    await ctx.close();
  });

  console.log(`\nAll ${passed} auth steps passed.`);
} catch {
  console.log(`\nFailed after ${passed} passing steps.`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
