#!/usr/bin/env node
/**
 * /abc tracker journey at 375px: save entries (multi-behavior), persist,
 * edit, views, both exports, email flow (no Resend configured → polite
 * failure), delete everything.
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
const LABELS = ["Screaming", "Dropping to floor", "Refusing", "Throwing", "Climbing", "Spitting"];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const form = () => page.locator("form[aria-labelledby]").first();

try {
  console.log("ABC tracker journey (375px)");
  await step("first line says nothing leaves your phone; sample table shown before any entry", async () => {
    await page.goto(`${BASE}/abc`);
    const first = await page.locator("main p").first().innerText();
    expect(first.startsWith("Nothing leaves your phone."), `first line: ${first}`);
    await page.getByRole("heading", { name: "What your BCBA receives" }).waitFor();
    expect((await page.getByText("This sample uses made-up data.").count()) === 1, "sample caption");
    await shot(page, "empty");
  });

  await step("the audit's test, 15-second form: two behaviors plus a custom one with punctuation and an emoji, an early sign, detail → exactly one observation", async () => {
    const q = (re) => form().getByRole("group", { name: re });
    await q(/What did they do/).getByRole("button", { name: "Hitting", exact: true }).click();
    await q(/What did they do/).getByRole("button", { name: "Screaming", exact: true }).click();
    await q(/What did they do/).getByRole("button", { name: /my own words/ }).click();
    await page.getByLabel(/What did they do\?: In your own words/).fill('Covering ears "x", y; <b>z</b> 😀');
    await q(/What did they do/).getByRole("button", { name: "Add", exact: true }).click();
    await q(/right before/).getByRole("button", { name: BEFORE[0], exact: true }).click();
    await q(/right after/).getByRole("button", { name: AFTER[3], exact: true }).click();
    await q(/before it got big/).getByRole("button", { name: "Pacing", exact: true }).click();
    await form().getByRole("button", { name: "+ Add detail" }).click();
    await form().getByRole("button", { name: "Moderate", exact: true }).click();
    await form().getByRole("button", { name: "1–5 min" }).click();
    await shot(page, "filled");
    await form().getByRole("button", { name: "Save", exact: true }).click();
    await page.getByText("Saved: 3 behaviors in one moment.").waitFor();
    await page.getByText(/Observations · 1\b/).waitFor();
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("support-shelf-abc-v2") || "{}"));
    expect(stored.version === 2, "v2 store");
    expect(stored.entries?.length === 1, `1 observation stored (got ${stored.entries?.length})`);
    expect(stored.entries[0].behaviorIds.length === 3, "3 behaviors in the observation");
    expect(stored.entries[0].functionCode === null, "no reflection asked any more");
    expect(JSON.stringify(stored.entries[0].earlySigns) === '["Pacing"]', "early sign stored");
    expect(stored.entries[0].durationSeconds === 180 && stored.entries[0].intensity === 2, "duration + intensity stored");
    expect(stored.child === null, "no nickname asked while logging");
    expect((await page.evaluate(() => localStorage.getItem("support-shelf-abc-v1"))) === null, "no v1 key");
    await page.getByRole("status", { name: "Safety" }).getByRole("link", { name: "Crisis resources" }).waitFor(); // Hitting → safety card
    await page.getByRole("status", { name: "Safety" }).getByRole("button", { name: "Close" }).click();
    await page.getByRole("status", { name: "What happens next" }).getByRole("button").click();
  });

  await step("seven more observations in three taps plus Save; they persist across reload and feed the BCBA table", async () => {
    const q = (re) => form().getByRole("group", { name: re });
    for (let i = 0; i < 7; i++) {
      await q(/What did they do/).getByRole("button", { name: LABELS[i % LABELS.length], exact: true }).click();
      await q(/right before/).getByRole("button", { name: BEFORE[i % BEFORE.length], exact: true }).click();
      await q(/right after/).getByRole("button", { name: AFTER[i % AFTER.length], exact: true }).click();
      await form().getByRole("button", { name: "Save", exact: true }).click();
      await page.getByText(new RegExp(`Observations · ${i + 2}\\b`)).waitFor();
    }
    await page.reload();
    await page.getByText(/Observations · 8/).waitFor();
    expect((await page.getByText("Your entries").count()) >= 1, "table switched to the parent's entries");
    await shot(page, "list");
  });

  await step("edit one entry; time is editable; views count facts", async () => {
    // Playwright's auto-scroll inside the fixed bottom sheet is flaky; scroll first, as a person would.
    const tap = async (loc) => { await loc.scrollIntoViewIfNeeded(); await loc.click(); };
    // Eight observations: the default view is now "What you're noticing"; edits live in the List tab.
    expect((await page.getByRole("tab", { name: "What you're noticing" }).getAttribute("aria-selected")) === "true", "insights is the default at 5+");
    await page.getByRole("tab", { name: "List" }).click();
    await tap(page.getByRole("button", { name: /edit entry: hitting/i }).first());
    const d = page.getByRole("dialog");
    await d.getByRole("heading", { name: "Edit observation" }).waitFor();
    await tap(d.getByRole("button", { name: "High", exact: true }));
    await d.getByLabel("Date and time").waitFor();
    // Mobile emulation offsets the visual viewport after focus; scroll the sheet to its end so Save is fully on screen.
    await page.evaluate(() => document.querySelector("[role=dialog] .overflow-y-auto")?.scrollTo(0, 1e6));
    await page.waitForTimeout(200);
    await d.getByRole("button", { name: /save changes/i }).click();
    await page.getByText("Saved.").waitFor();
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName);
    await shot(page, "after-edit");
    expect(/edit entry/i.test(focused || ""), `focus returned to the entry (got ${focused})`);
    await page.getByRole("tab", { name: "What you're noticing" }).click();
    await page.getByText(/Most often right before:/).waitFor();
    await page.getByText(/ of 8$/).first().waitFor();
    const text = (await page.locator("main").innerText()).toLowerCase();
    for (const banned of ["because", "you should", "diagnosed with"]) expect(!text.includes(banned), `page contains "${banned}"`);
    await shot(page, "views");
    await page.getByRole("tab", { name: "List" }).click();
  });

  await step("first export asks for a nickname (tricky characters), then PDF and CSV are real files built in the browser", async () => {
    await page.getByLabel("A nickname for the export").fill('Bean "Jr", Jr.');
    await page.locator("#export").getByRole("button", { name: "Save" }).click();
    await page.getByRole("button", { name: "Download PDF" }).waitFor();
    expect((await page.evaluate(() => JSON.parse(localStorage.getItem("support-shelf-abc-v2")).child.nickname)) === 'Bean "Jr", Jr.', "nickname stored at export");
    const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download PDF" }).click()]);
    const pdfPath = path.join(SHOTS, "export.pdf");
    await pdf.saveAs(pdfPath);
    expect(fs.readFileSync(pdfPath).subarray(0, 5).toString() === "%PDF-", "pdf magic");
    expect(fs.statSync(pdfPath).size > 50_000, "pdf has embedded fonts");
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download CSV" }).click()]);
    const csvPath = path.join(SHOTS, "export.csv");
    await csv.saveAs(csvPath);
    const text = fs.readFileSync(csvPath, "utf8");
    expect(text.includes("date,time,noticed,right_before"), "csv header");
    expect(text.includes("parent_reflection_might_be"), "csv reflection column");
    expect(text.trim().split("\n").length === 9, `csv rows: ${text.trim().split("\n").length}`);
    expect(text.includes("Covering ears"), "csv has custom label");
    expect(text.includes("Hitting; Screaming; Covering ears"), "csv lists all behaviors of the first observation in one row");
    expect(text.includes("early_signs") && text.includes("Pacing"), "csv carries early signs");
    await page.getByText(/Clearing your browser data clears these entries/).waitFor();
  });

  await step("email flow fails politely when Resend isn't configured, and never 500s", async () => {
    await page.getByRole("button", { name: "Email me my export" }).click();
    await page.getByLabel("Email me my export").fill("parent@example.test");
    const [res] = await Promise.all([page.waitForResponse((r) => r.url().includes("/api/abc/email-export")), page.getByRole("button", { name: "Send", exact: true }).click()]);
    expect(res.status() === 503 || res.status() === 200, `status ${res.status()}`);
    await page.getByRole(res.status() === 200 ? "status" : "alert").first().waitFor();
    await shot(page, "export");
  });

  await step("delete everything needs two confirmations and clears localStorage", async () => {
    await page.getByRole("button", { name: /labels & settings/i }).click();
    await page.getByRole("button", { name: /delete everything…/i }).click();
    await page.getByRole("button", { name: /yes, i've exported/i }).click();
    await page.getByRole("button", { name: /delete for good/i }).click();
    await page.getByText(/Observations · 0/).waitFor();
    expect((await page.evaluate(() => localStorage.getItem("support-shelf-abc-v2"))) === null, "localStorage key removed");
    await page.reload();
    await page.getByText(/Observations · 0/).waitFor();
  });

  await step("no horizontal overflow at 375px on /abc", async () => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > 375);
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
