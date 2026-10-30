#!/usr/bin/env node
/**
 * End-to-end parent journey against the local stand-in.
 * Prereqs: local stand-in on :54321, app on BASE (default :3100).
 *
 *   npm run test:e2e
 *
 * Writes screenshots to tests/e2e/shots/ (gitignored) and exits non-zero on
 * the first failed step.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// Playwright may be installed globally (as in the cloud build box) or locally.
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE ?? "http://localhost:3100";
const STANDIN = process.env.STANDIN ?? "http://localhost:54321";
const SHOTS = path.resolve("tests/e2e/shots");
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
let shotIndex = 0;
async function step(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ name, ok: false, error: String(e?.message ?? e) });
    console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n")[0]}`);
    throw e;
  }
}
async function shot(page, label) {
  shotIndex += 1;
  await page.screenshot({ path: path.join(SHOTS, `${String(shotIndex).padStart(2, "0")}-${label}.png`) });
}
async function latestMagicLink(email) {
  const res = await fetch(`${STANDIN}/_dev/outbox`);
  const box = await res.json();
  const mine = box.filter((m) => m.to === email);
  if (mine.length === 0) throw new Error(`no magic link for ${email}`);
  return mine[mine.length - 1].link.replace("http://localhost:3000", BASE);
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const email = `parent-${Date.now()}@example.test`;
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  timezoneId: "America/Chicago",
});
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));

try {
  console.log("Parent journey (375px, touch)");

  await step("sign-in page renders and requires the adult checkbox", async () => {
    await page.goto(`${BASE}/sign-in`);
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: /email me a sign-in link/i }).click();
    // Native required-checkbox validation blocks submission; still on the form.
    await page.waitForTimeout(300);
    expect(await page.getByRole("button", { name: /email me a sign-in link/i }).isVisible(), "form should still be visible");
    await shot(page, "sign-in");
  });

  await step("magic link is requested and arrives in the outbox", async () => {
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /email me a sign-in link/i }).click();
    await page.getByText(/check your email/i).waitFor();
    await shot(page, "check-email");
    const link = await latestMagicLink(email);
    await page.goto(link);
    await page.waitForURL(/\/app/);
  });

  await step("first run shows onboarding; create a child with edited suggestions", async () => {
    await page.getByRole("heading", { name: /noticing/i }).waitFor();
    await shot(page, "onboarding");
    await page.getByLabel("Nickname").fill("Bean");
    // Remove one suggestion, add a custom one.
    await page.getByRole("button", { name: "Refusing", exact: true }).click();
    await page.getByLabel("Add your own").fill("Covering ears");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByRole("button", { name: /start tracking/i }).click();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    await shot(page, "home-empty");
  });

  await step("log an entry in three taps plus save", async () => {
    await page.getByRole("button", { name: /log what happened/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("heading", { name: /what did you notice/i }).waitFor();
    await shot(page, "sheet-step-1");
    await dialog.getByRole("button", { name: "Covering ears", exact: true }).click(); // tap 1
    await dialog.getByRole("heading", { name: /right before/i }).waitFor();
    await shot(page, "sheet-step-2");
    await dialog.getByRole("button", { name: "An activity or location changed" }).click(); // tap 2
    await dialog.getByRole("heading", { name: /right after/i }).waitFor();
    await dialog.getByRole("button", { name: "Someone offered comfort" }).click(); // tap 3
    await dialog.getByRole("heading", { name: /ready to save/i }).waitFor();
    await shot(page, "sheet-review");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByText("Logged.").waitFor();
    await page.getByRole("button", { name: /edit entry: covering ears/i }).waitFor();
    await shot(page, "home-one-entry");
  });

  await step("'Something else' reveals a note and details are optional", async () => {
    await page.getByRole("button", { name: /log what happened/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Hitting", exact: true }).click();
    await dialog.getByRole("button", { name: "Something else", exact: true }).click();
    await dialog.getByLabel(/right before/i).fill("Sibling took the tablet");
    await dialog.getByRole("button", { name: "Next", exact: true }).click();
    await dialog.getByRole("button", { name: "Not sure", exact: true }).click();
    await dialog.getByRole("button", { name: /add details/i }).click();
    await dialog.getByRole("button", { name: "About 5 min" }).click();
    await dialog.getByRole("button", { name: "Moderate" }).click();
    await dialog.getByLabel("Note").fill("Calmed down after a few minutes with headphones.");
    await shot(page, "sheet-details");
    await dialog.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByText("Logged.").waitFor();
    await page.getByText("Sibling took the tablet").waitFor();
    await page.getByText("5m · Moderate · Note").waitFor();
  });

  await step("edit an entry from the list and see the change", async () => {
    await page.getByRole("button", { name: /edit entry: covering ears/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("heading", { name: /ready to save/i }).waitFor();
    await dialog.getByRole("button", { name: "Change" }).nth(2).click(); // right after
    await dialog.getByRole("button", { name: "No immediate response was observed" }).click();
    await dialog.getByRole("button", { name: /save changes/i }).click();
    await page.getByText("Saved.").waitFor();
    await page.getByText(/No immediate response was observed/).waitFor();
    await shot(page, "home-after-edit");
  });

  await step("entries page lists, filters, and groups by day", async () => {
    await page.goto(`${BASE}/app/entries`);
    await page.getByRole("heading", { name: "Entries" }).waitFor();
    await page.getByText(/2 entries for Bean/).waitFor();
    await shot(page, "entries");
    await page.getByLabel("What").selectOption({ label: "Hitting" });
    await page.getByRole("button", { name: "Show" }).click();
    await page.getByText(/1 entry for Bean/).waitFor();
  });

  await step("delete an entry with confirmation", async () => {
    await page.getByRole("button", { name: /edit entry: hitting/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /delete this entry/i }).click();
    await dialog.getByRole("button", { name: "Delete", exact: true }).click();
    await page.getByText("Deleted.").waitFor();
    await page.getByText(/No entries in this range|0 entries for Bean/).waitFor();
  });

  await step("settings: rename child, add and hide a label", async () => {
    await page.goto(`${BASE}/app/settings`);
    await page.getByRole("button", { name: "Rename" }).first().click();
    await page.getByLabel("Nickname").fill("Beanie");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByText("Beanie").first().waitFor();
    await page.getByLabel("New label").fill("Lining up toys");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByText("Lining up toys").waitFor();
    await shot(page, "settings");
  });

  let childId = "";
  await step("export page offers PDF and CSV; downloads are real files", async () => {
    await page.goto(`${BASE}/app/export`);
    const href = await page.getByRole("link", { name: "Download PDF" }).getAttribute("href");
    expect(href && href.startsWith("/app/export/pdf?child="), "pdf link present");
    childId = new URL(href, BASE).searchParams.get("child");
    await shot(page, "export");

    const pdf = await page.request.get(`${BASE}${href}`);
    expect(pdf.status() === 200, `pdf status ${pdf.status()}`);
    expect((pdf.headers()["content-type"] || "").includes("application/pdf"), "pdf content type");
    const pdfBytes = await pdf.body();
    expect(pdfBytes.subarray(0, 5).toString() === "%PDF-", "pdf magic bytes");
    fs.writeFileSync(path.join(SHOTS, "export.pdf"), pdfBytes);

    const csv = await page.request.get(`${BASE}${href.replace("/pdf?", "/csv?")}`);
    expect(csv.status() === 200, `csv status ${csv.status()}`);
    const text = await csv.text();
    expect(text.includes("date,time,noticed,right_before"), "csv header");
    expect(text.includes("Covering ears"), "csv contains the surviving entry");
    expect(!text.includes("Hitting"), "csv excludes the deleted entry");

    const all = await page.request.get(`${BASE}/app/export/all`);
    expect(all.status() === 200, `json status ${all.status()}`);
    const json = await all.json();
    expect(json.children.length === 1 && json.entries.length === 1, "json export has the account's data");
  });

  await step("sign out clears access to /app", async () => {
    await page.goto(`${BASE}/app/settings`);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL((u) => !u.pathname.startsWith("/app"));
    await page.goto(`${BASE}/app`);
    await page.waitForURL(/sign-in/);
  });

  await step("a second parent cannot see the first parent's child", async () => {
    const other = `other-${Date.now()}@example.test`;
    await page.goto(`${BASE}/sign-in`);
    await page.getByLabel("Email").fill(other);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /email me a sign-in link/i }).click();
    await page.getByText(/check your email/i).waitFor();
    await page.goto(await latestMagicLink(other));
    await page.waitForURL(/\/app/);
    await page.getByRole("heading", { name: /noticing/i }).waitFor(); // onboarding, not Beanie
    expect((await page.getByText("Beanie").count()) === 0, "other parent must not see Beanie");

    // Cross-user export attempts are refused.
    const denied = await page.request.get(`${BASE}/app/export/pdf?child=${childId}`);
    expect(denied.status() === 403, `cross-user pdf export should be 403, got ${denied.status()}`);
    const deniedCsv = await page.request.get(`${BASE}/app/export/csv?child=${childId}`);
    expect(deniedCsv.status() === 403, `cross-user csv export should be 403, got ${deniedCsv.status()}`);
  });

  await step("account deletion requires both confirmations and then signs out", async () => {
    await page.getByLabel("Nickname").fill("Temp");
    await page.getByRole("button", { name: /start tracking/i }).click();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    await page.goto(`${BASE}/app/settings`);
    await page.getByRole("button", { name: /i want to delete my account/i }).click();
    // Wrong confirmation word is refused.
    await page.getByRole("checkbox", { name: /i understand/i }).check();
    await page.getByLabel(/type delete/i).fill("delete me");
    await page.getByRole("button", { name: /delete everything/i }).click();
    await page.getByRole("alert").waitFor();
    await shot(page, "delete-confirm");
    expect(await page.getByRole("checkbox", { name: /i understand/i }).isChecked(), "checkbox must survive a validation error");
    await page.getByLabel(/type delete/i).fill("DELETE");
    await page.getByRole("button", { name: /delete everything/i }).click();
    await page.waitForURL(/\/goodbye/);
    await shot(page, "goodbye");
    await page.goto(`${BASE}/app`);
    await page.waitForURL(/sign-in/);
  });

  expect(consoleErrors.length === 0, `page errors: ${consoleErrors.join(" | ")}`);
  console.log(`\nAll ${results.length} steps passed. Screenshots: ${SHOTS}`);
} catch {
  await shot(page, "FAILED").catch(() => {});
  console.log(`\nFailed after ${results.filter((r) => r.ok).length} passing steps.`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
