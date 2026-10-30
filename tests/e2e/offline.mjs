#!/usr/bin/env node
/**
 * Offline reliability journey against the local stand-in.
 *   node tests/e2e/offline.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE ?? "http://localhost:3100";
const STANDIN = process.env.STANDIN ?? "http://localhost:54321";
const SHOTS = path.resolve("tests/e2e/shots/offline");
fs.mkdirSync(SHOTS, { recursive: true });
const expect = (c, m) => { if (!c) throw new Error(m); };
let n = 0;
const shot = (page, l) => page.screenshot({ path: path.join(SHOTS, `${String(++n).padStart(2, "0")}-${l}.png`) });
let passed = 0;
async function step(name, fn) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n")[0]}`); throw e; }
}
async function magicLink(email) {
  const box = await (await fetch(`${STANDIN}/_dev/outbox`)).json();
  return box.filter((m) => m.to === email).pop().link.replace("http://localhost:3000", BASE);
}
async function signIn(page, email) {
  await page.goto(`${BASE}/sign-in`);
  await page.getByLabel("Email").fill(email);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /email me a sign-in link/i }).click();
  await page.getByText(/check your email/i).waitFor();
  await page.goto(await magicLink(email));
  await page.waitForURL(/\/app/);
}
async function logEntry(page, behavior, before, after) {
  await page.getByRole("button", { name: /log what happened/i }).click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: behavior, exact: true }).click();
  await d.getByRole("button", { name: before }).click();
  await d.getByRole("button", { name: after }).click();
  await d.getByRole("button", { name: "Save", exact: true }).click();
}
async function allData(page) {
  const r = await page.request.get(`${BASE}/app/export/all`);
  return r.json();
}

const email = `offline-${Date.now()}@example.test`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: "America/Chicago" });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

try {
  console.log("Offline journey (375px)");
  await step("sign in, onboard, log one entry online, warm the service worker", async () => {
    await signIn(page, email);
    await page.getByLabel("Nickname").fill("Pip");
    await page.getByRole("button", { name: /start tracking/i }).click();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    await logEntry(page, "Hitting", "An instruction was given", "The activity or instruction stopped");
    await page.getByText("Logged.").waitFor();
    // Let the service worker install and cache /app.
    await page.waitForFunction(() => navigator.serviceWorker?.controller != null, null, { timeout: 15000 }).catch(() => {});
    await page.reload();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    await page.reload();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
  });

  await step("go offline: a save still says Logged and is marked 'will sync'", async () => {
    await ctx.setOffline(true);
    await logEntry(page, "Screaming", "The child was alone", "Someone offered comfort");
    await page.getByText("Logged. Will sync.").waitFor();
    await page.getByText(/1 saved on this phone/).waitFor();
    await page.getByText("will sync", { exact: true }).waitFor();
    await shot(page, "offline-pending");
  });

  await step("edit the pending entry offline folds into the queued insert", async () => {
    await page.getByRole("button", { name: /edit entry: screaming/i }).click();
    const d = page.getByRole("dialog");
    // In edit mode the details panel is already open; only expand it if it isn't.
    if ((await d.getByRole("button", { name: /add details/i }).count()) > 0) {
      await d.getByRole("button", { name: /add details/i }).click();
    }
    await d.getByRole("button", { name: "Intense" }).click();
    await d.getByRole("button", { name: /save changes/i }).click();
    await page.getByText("Saved.").waitFor();
    await page.getByText(/1 saved on this phone/).waitFor(); // still one op, not two
  });

  await step("reload offline: the shell loads from cache and the pending entry is still listed", async () => {
    await page.reload().catch(() => {});
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    await page.getByText("will sync", { exact: true }).waitFor();
    await shot(page, "offline-reload");
  });

  await step("back online: it syncs once, with no duplicate", async () => {
    await ctx.setOffline(false);
    await page.waitForFunction(() => !document.body.innerText.includes("saved on this phone"), null, { timeout: 20000 });
    await page.reload();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    expect((await page.getByText("will sync", { exact: true }).count()) === 0, "no pending marker after sync");
    const data = await allData(page);
    expect(data.entries.length === 2, `expected 2 entries on server, got ${data.entries.length}`);
    const screaming = data.entries.find((e) => e.intensity === 3);
    expect(Boolean(screaming), "the offline edit (intensity) reached the server");
    await shot(page, "synced");
  });

  await step("a second offline save then a second sync still yields exactly one new row", async () => {
    await ctx.setOffline(true);
    await logEntry(page, "Running off", "Not sure", "Not sure");
    await page.getByText("Logged. Will sync.").waitFor();
    await ctx.setOffline(false);
    await page.waitForFunction(() => !document.body.innerText.includes("saved on this phone"), null, { timeout: 20000 });
    // Force a second flush pass by reloading; the queue must be empty and the server unchanged.
    await page.reload();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    const data = await allData(page);
    expect(data.entries.length === 3, `expected 3 entries, got ${data.entries.length}`);
  });

  await step("deleting a pending entry offline never reaches the server", async () => {
    await ctx.setOffline(true);
    await logEntry(page, "Refusing", "Not sure", "Not sure");
    await page.getByText("Logged. Will sync.").waitFor();
    await page.getByRole("button", { name: /edit entry: refusing/i }).click();
    const d = page.getByRole("dialog");
    await d.getByRole("button", { name: /delete this entry/i }).click();
    await d.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByText("Deleted.").waitFor();
    expect((await page.getByText(/saved on this phone/).count()) === 0, "queue should be empty after deleting a pending insert");
    await ctx.setOffline(false);
    await page.waitForTimeout(800);
    const data = await allData(page);
    expect(data.entries.length === 3, `server still has 3 entries, got ${data.entries.length}`);
  });

  await step("sign out removes the local queue database", async () => {
    await page.goto(`${BASE}/app/settings`);
    const before = await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name));
    expect(before.some((nm) => nm?.startsWith("support-shelf-queue-")), "queue db exists while signed in");
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL((u) => !u.pathname.startsWith("/app"));
    const after = await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name));
    expect(!after.some((nm) => nm?.startsWith("support-shelf-queue-")), `queue db should be gone, saw ${after.join(",")}`);
  });

  await step("a different user on the same device never sees another user's queue", async () => {
    // Plant a stale queue db for a made-up user, then sign in as someone else.
    await page.goto(`${BASE}/sign-in`);
    await page.evaluate(() => new Promise((res) => { const r = indexedDB.open("support-shelf-queue-stale-user", 1); r.onupgradeneeded = () => r.result.createObjectStore("ops", { keyPath: "opId" }); r.onsuccess = () => { r.result.close(); res(); }; }));
    await signIn(page, `second-${Date.now()}@example.test`);
    await page.getByRole("heading", { name: /noticing/i }).waitFor();
    await page.waitForTimeout(500);
    const names = await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name));
    expect(!names.includes("support-shelf-queue-stale-user"), "stale user's queue db must be wiped on init");
  });

  console.log(`\nAll ${passed} offline steps passed. Screenshots: ${SHOTS}`);
} catch {
  await shot(page, "FAILED").catch(() => {});
  console.log(`\nFailed after ${passed} passing steps.`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
