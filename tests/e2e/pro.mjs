#!/usr/bin/env node
/**
 * Pro journey against the local stand-in: gating, upgrade (simulated webhook
 * write), patterns, caregiver invite + acceptance, caregiver limits, share link.
 *   node tests/e2e/pro.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE ?? "http://localhost:3100";
const STANDIN = process.env.STANDIN ?? "http://localhost:54321";
const SHOTS = path.resolve("tests/e2e/shots/pro");
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
async function signOut(page) {
  await page.goto(`${BASE}/app/settings`);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/app"));
}
/** What the Stripe webhook does, minus Stripe: write the subscriptions row with the service key. */
async function makePro(userId) {
  const keys = await (await fetch(`${STANDIN}/_dev/keys`)).json();
  const r = await fetch(`${STANDIN}/rest/v1/subscriptions?on_conflict=user_id`, {
    method: "POST",
    headers: { apikey: keys.service, Authorization: `Bearer ${keys.service}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ user_id: userId, status: "active", stripe_customer_id: `cus_${userId.slice(0, 8)}`, current_period_end: new Date(Date.now() + 30 * 86400000).toISOString() }),
  });
  expect(r.ok, `makePro failed: ${r.status} ${await r.text()}`);
}
async function logEntry(page, behavior, before, after) {
  await page.getByRole("button", { name: /log what happened/i }).click();
  const d = page.getByRole("dialog");
  await d.getByRole("button", { name: behavior, exact: true }).click();
  await d.getByRole("button", { name: before }).click();
  await d.getByRole("button", { name: after }).click();
  await d.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByText("Logged.").waitFor();
}

const owner = `owner-${Date.now()}@example.test`;
const caregiver = `caregiver-${Date.now()}@example.test`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, timezoneId: "America/Chicago" });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
let ownerId = "";
let inviteLink = "";
let shareLink = "";

try {
  console.log("Pro journey (375px)");
  await step("free account: patterns are blurred with one upgrade button; invites and share links are gated", async () => {
    await signIn(page, owner);
    await page.getByLabel("Nickname").fill("Juniper");
    await page.getByRole("button", { name: /start tracking/i }).click();
    await page.getByRole("button", { name: /log what happened/i }).waitFor();
    await logEntry(page, "Hitting", "An instruction was given", "The activity or instruction stopped");
    await logEntry(page, "Screaming", "The child was alone", "Someone offered comfort");
    ownerId = (await (await page.request.get(`${BASE}/app/export/all`)).json()).account.id;

    await page.goto(`${BASE}/app/patterns`);
    await page.getByRole("heading", { name: /patterns are part of pro/i }).waitFor();
    await page.getByText(/made-up data/i).waitFor();
    await shot(page, "patterns-locked");
    await page.goto(`${BASE}/app/settings`);
    await page.getByText(/sharing with a second caregiver is part of pro/i).waitFor();
    await page.getByText("Free", { exact: true }).first().waitFor();
    await shot(page, "plan-free");
    await page.goto(`${BASE}/app/export`);
    await page.getByText(/share links are part of pro/i).waitFor();
    expect((await page.getByText(/PDF layout/).count()) === 0, "layout options hidden for free");
  });

  await step("after the subscriptions row is written (webhook), Pro unlocks everywhere", async () => {
    await makePro(ownerId);
    await page.goto(`${BASE}/app/settings`);
    await page.getByText("Pro", { exact: true }).first().waitFor();
    await page.getByRole("button", { name: /manage billing/i }).waitFor();
    await page.goto(`${BASE}/app/patterns`);
    expect((await page.getByRole("heading", { name: /patterns are part of pro/i }).count()) === 0, "no upsell for Pro");
    await page.getByText(/Most entries:/).first().waitFor();
    await page.getByText(/Most often recorded right before: An instruction was given \(1 of 2\)/).waitFor();
    await shot(page, "patterns-pro");
    await page.goto(`${BASE}/app/export`);
    await page.getByText(/PDF layout/).waitFor();
    await page.getByLabel(/include notes/i).uncheck();
    await page.getByLabel(/include the counts page/i).uncheck();
    const href = await page.getByRole("link", { name: "Download PDF" }).getAttribute("href");
    expect(href.includes("notes=0") && href.includes("counts=0"), `layout params in href: ${href}`);
    const pdf = await page.request.get(`${BASE}${href}`);
    expect(pdf.status() === 200, "pro pdf downloads");
  });

  await step("owner creates a share link; it opens without an account and the PDF works", async () => {
    await page.getByRole("button", { name: /create a 30-day link/i }).click();
    const linkEl = page.locator("p.font-mono").first();
    await linkEl.waitFor();
    shareLink = (await linkEl.textContent()).trim();
    expect(shareLink.includes("/share/"), `share link: ${shareLink}`);
    const anon = await browser.newContext();
    const p2 = await anon.newPage();
    await p2.goto(shareLink.replace("http://localhost:3000", BASE));
    await p2.getByRole("heading", { name: /observations · juniper/i }).waitFor();
    await p2.getByText(/read-only link/i).waitFor();
    await p2.screenshot({ path: path.join(SHOTS, "share-page.png"), fullPage: true });
    const pdf = await p2.request.get(shareLink.replace("http://localhost:3000", BASE) + "/pdf");
    expect(pdf.status() === 200 && (pdf.headers()["content-type"] || "").includes("pdf"), "shared pdf");
    // A wrong token is a 404, not an error page with data.
    const bad = await p2.goto(`${BASE}/share/${"x".repeat(43)}`);
    expect(bad.status() === 404, `bad token should 404, got ${bad.status()}`);
    await anon.close();
  });

  await step("owner withdraws the share link and it stops working", async () => {
    await page.goto(`${BASE}/app/export`);
    await page.getByRole("button", { name: "Withdraw" }).first().click();
    await page.waitForTimeout(500);
    const anon = await browser.newContext();
    const p2 = await anon.newPage();
    const res = await p2.goto(shareLink.replace("http://localhost:3000", BASE));
    expect(res.status() === 404, `revoked link should 404, got ${res.status()}`);
    await anon.close();
  });

  await step("owner invites a caregiver; the wrong account is refused; the invited one gets in", async () => {
    await page.goto(`${BASE}/app/settings`);
    await page.getByLabel(/invite a second caregiver/i).fill(caregiver);
    await page.getByRole("button", { name: "Invite", exact: true }).click();
    const linkEl = page.locator("p.font-mono").first();
    await linkEl.waitFor();
    inviteLink = (await linkEl.textContent()).trim().replace("http://localhost:3000", BASE);
    await page.getByText("Invited · waiting to accept").waitFor(); // pending invite listed
    await shot(page, "invite-created");
    await signOut(page);

    // Wrong account.
    await signIn(page, `stranger-${Date.now()}@example.test`);
    await page.goto(inviteLink);
    await page.getByRole("button", { name: /accept invite/i }).click();
    await page.getByText(/different email address/i).waitFor();
    await shot(page, "invite-wrong-account");
    await signOut(page);

    // Right account.
    await signIn(page, caregiver);
    await page.goto(inviteLink);
    await page.getByRole("button", { name: /accept invite/i }).click();
    await page.waitForURL(/\/app\?joined=1/);
    await page.getByText(/you now share juniper/i).waitFor();
    await page.getByText("Hitting").waitFor(); // sees owner's entries
    await shot(page, "caregiver-joined");
  });

  await step("caregiver can log but cannot rename, delete, or invite; replaying the invite fails", async () => {
    await logEntry(page, "Hitting", "Not sure", "Not sure");
    await page.goto(`${BASE}/app/settings`);
    await page.getByText("Shared with you").waitFor();
    // The child row offers Leave, never Rename/Delete (label renames are allowed for caregivers).
    await page.getByRole("button", { name: "Leave" }).waitFor();
    const childRow = page.locator("li", { hasText: "Shared with you" });
    expect((await childRow.getByRole("button", { name: "Rename" }).count()) === 0, "no rename for caregiver");
    expect((await childRow.getByRole("button", { name: "Delete" }).count()) === 0, "no delete for caregiver");
    expect((await page.getByLabel(/invite a second caregiver/i).count()) === 0, "no invite form for caregiver");
    await page.goto(inviteLink);
    await page.getByRole("button", { name: /accept invite/i }).click();
    await page.getByText(/already used|already have access/i).waitFor();
    // Cannot export the owner's child under a different child id? They can export this child (they have access).
    const data = await (await page.request.get(`${BASE}/app/export/all`)).json();
    expect(data.children.length === 1 && data.entries.length === 3, "caregiver sees the shared child and all 3 entries");
    await signOut(page);
  });

  await step("owner removes the caregiver; access ends immediately", async () => {
    await signIn(page, owner);
    await page.goto(`${BASE}/app/settings`);
    await page.getByRole("button", { name: "Remove" }).click();
    await page.waitForTimeout(500);
    expect((await page.getByRole("button", { name: "Remove" }).count()) === 0, "caregiver row gone");
    await signOut(page);
    await signIn(page, caregiver);
    await page.getByRole("heading", { name: /noticing/i }).waitFor(); // back to onboarding: no children
    const data = await (await page.request.get(`${BASE}/app/export/all`)).json();
    expect(data.children.length === 0 && data.entries.length === 0, "removed caregiver sees nothing");
  });

  console.log(`\nAll ${passed} Pro steps passed. Screenshots: ${SHOTS}`);
} catch {
  await shot(page, "FAILED").catch(() => {});
  console.log(`\nFailed after ${passed} passing steps.`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
