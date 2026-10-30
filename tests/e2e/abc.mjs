#!/usr/bin/env node
/**
 * /abc logger journey at 375px: set up, log 10 entries, views, both exports,
 * email flow (no Resend configured → polite failure), clear and confirm.
 *   node tests/e2e/abc.mjs   (app on BASE, default :3100)
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE ?? "http://localhost:3100";
const SHOTS = path.resolve("tests/e2e/shots/abc");
fs.mkdirSync(SHOTS, { recursive: true });
const expect = (c, m) => { if (!c) throw new Error(m); };
let n = 0, passed = 0;
const shot = (page, l) => page.screenshot({ path: path.join(SHOTS, `${String(++n).padStart(2, "0")}-${l}.png`) });
async function step(name, fn) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n")[0]}`); throw e; }
}

const BEFORE = ["An instruction was given", "An item or activity was unavailable", "An activity or location changed", "Someone approached or interacted", "The child was alone", "Not sure"];
const AFTER = ["An item or activity was provided", "The activity or instruction stopped", "Someone spoke to or interacted with the child", "Someone offered comfort", "No immediate response was observed", "Not sure"];
const LABELS = ["Hitting", "Screaming", "Dropping to floor", "Running off", "Refusing"];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

try {
  console.log("ABC logger journey (375px)");
  await step("first line says nothing leaves your phone; setup takes a nickname", async () => {
    await page.goto(`${BASE}/abc`);
    const first = await page.locator("main p").first().innerText();
    expect(first.startsWith("Nothing leaves your phone."), `first line: ${first}`);
    expect((await page.getByText(/sample export|What your BCBA receives/i).count()) > 0, "sample export shown");
    await shot(page, "setup");
    await page.getByLabel("Nickname").fill("Bean");
    await page.getByRole("button", { name: "Refusing", exact: true }).click();
    await page.getByLabel("Add your own").fill("Covering ears");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByRole("button", { name: /start logging/i }).click();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    await shot(page, "home");
  });

  await step("log 10 entries in three taps each; they persist in localStorage", async () => {
    const labels = [...LABELS.filter((l) => l !== "Refusing"), "Covering ears"];
    for (let i = 0; i < 10; i++) {
      await page.getByRole("button", { name: /log what happened/i }).click();
      const d = page.getByRole("dialog");
      await d.getByRole("button", { name: labels[i % labels.length], exact: true }).click();
      await d.getByRole("button", { name: BEFORE[i % BEFORE.length], exact: true }).click();
      await d.getByRole("button", { name: AFTER[i % AFTER.length], exact: true }).click();
      if (i === 0) await shot(page, "review");
      await d.getByRole("button", { name: "Save", exact: true }).click();
      await page.getByRole("dialog").waitFor({ state: "detached" });
    }
    await page.getByText(/Entries · 10/).waitFor();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("support-shelf-abc-v1") || "{}"));
    expect(stored.entries?.length === 10, "10 entries in localStorage");
    expect(stored.child?.nickname === "Bean", "nickname stored");
    await page.reload();
    await page.getByText(/Entries · 10/).waitFor();
    await shot(page, "list");
  });

  await step("edit one entry; time is editable; views count facts", async () => {
    await page.getByRole("button", { name: /edit entry: hitting/i }).first().click();
    const d = page.getByRole("dialog");
    await d.getByRole("button", { name: "Intense" }).click();
    await d.getByLabel("Date and time").waitFor();
    await d.getByRole("button", { name: /save changes/i }).click();
    await page.getByText("Saved.").waitFor();
    await page.getByRole("tab", { name: "Time of day" }).click();
    await page.getByText(/Most entries:/).waitFor();
    await shot(page, "time-of-day");
    await page.getByRole("tab", { name: "Right before" }).click();
    await page.getByText(/Most often recorded right before:/).waitFor();
    const text = (await page.locator("main").innerText()).toLowerCase();
    for (const banned of ["because", "trigger", "function", "you should", "try "]) expect(!text.includes(banned), `page contains "${banned}"`);
    await shot(page, "right-before");
    await page.getByRole("tab", { name: "List" }).click();
  });

  await step("one-tap PDF and CSV downloads are real files built in the browser", async () => {
    const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PDF" }).click()]);
    const pdfPath = path.join(SHOTS, "export.pdf");
    await pdf.saveAs(pdfPath);
    const head = fs.readFileSync(pdfPath).subarray(0, 5).toString();
    expect(head === "%PDF-", `pdf magic: ${head}`);
    expect(fs.statSync(pdfPath).size > 50_000, "pdf has embedded fonts");
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download CSV" }).click()]);
    const csvPath = path.join(SHOTS, "export.csv");
    await csv.saveAs(csvPath);
    const text = fs.readFileSync(csvPath, "utf8");
    expect(text.includes("date,time,noticed,right_before"), "csv header");
    expect(text.trim().split("\n").length === 11, `csv rows: ${text.trim().split("\n").length}`);
    expect(text.includes("Covering ears"), "csv has custom label");
    await page.getByText(/Clearing your browser data clears these entries/).waitFor();
    await shot(page, "export");
  });

  await step("email flow fails politely when Resend isn't configured, and never 500s", async () => {
    await page.getByLabel("Email me my export").fill("parent@example.test");
    const [res] = await Promise.all([page.waitForResponse((r) => r.url().includes("/api/abc/email-export")), page.getByRole("button", { name: "Send", exact: true }).click()]);
    expect(res.status() === 503 || res.status() === 200, `status ${res.status()}`);
    await page.getByRole(res.status() === 200 ? "status" : "alert").first().waitFor();
  });

  await step("delete everything needs two confirmations and clears localStorage", async () => {
    await page.getByRole("button", { name: /labels & settings/i }).click();
    await page.getByRole("button", { name: /delete everything…/i }).click();
    await page.getByRole("button", { name: /yes, i've exported/i }).click();
    await page.getByRole("button", { name: /delete for good/i }).click();
    await page.getByRole("heading", { name: /noticing/i }).waitFor();
    const stored = await page.evaluate(() => localStorage.getItem("support-shelf-abc-v1"));
    expect(stored === null, "localStorage key removed");
    await page.reload();
    await page.getByRole("heading", { name: /noticing/i }).waitFor();
  });

  await step("no horizontal overflow at 375px on /abc", async () => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(!overflow, "page overflows horizontally");
  });

  expect(errors.length === 0, `page errors: ${errors.join(" | ")}`);
  console.log(`\nAll ${passed} ABC steps passed. Screenshots: ${SHOTS}`);
} catch {
  await shot(page, "FAILED").catch(() => {});
  console.log(`\nFailed after ${passed} passing steps.`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
