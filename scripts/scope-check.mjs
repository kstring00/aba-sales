#!/usr/bin/env node
/**
 * Fails the build when parent-facing content uses prescriptive or
 * diagnostic wording (rules in scope-rules.mjs). Runs before every build.
 * Also warns about outside resources that were never verified or were
 * last verified more than six months ago.
 *   node scripts/scope-check.mjs            check content
 *   node scripts/scope-check.mjs --self-test  prove the rules catch bad text
 */
import fs from "node:fs";
import path from "node:path";
import { checkJson, checkText } from "./scope-rules.mjs";

const ROOT = process.cwd();
const TARGETS = ["content", "src/content", "src/lib/resources.ts", "src/lib/shelves.ts", "src/lib/observation.ts"];

if (process.argv.includes("--self-test")) {
  const bad = ["Your child is seeking attention when this happens.", "Just ignore the behavior and it will stop.", "Try extinction.", "The function is escape.", "This will cure meltdowns.", "He is so manipulative."];
  const good = ["Write what you saw, not what it means.", "Most moments came right after an instruction.", "Ask your BCBA what could help with transitions.", "Keep your connection secure."];
  const missed = bad.filter((t) => checkText(t).length === 0);
  const flagged = good.filter((t) => checkText(t).length > 0);
  const escaped = checkText("<!-- scope-ok: quoting a myth in order to correct it -->\nSome say ignore the behavior.");
  if (missed.length || flagged.length || escaped.length) {
    console.error("scope-check self-test FAILED", { missed, flagged, escaped });
    process.exit(1);
  }
  console.log(`scope-check self-test passed (${bad.length} bad caught, ${good.length} good allowed, escape honored).`);
  process.exit(0);
}

function walk(p) {
  const abs = path.join(ROOT, p);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return [p];
  return fs.readdirSync(abs).flatMap((f) => walk(path.join(p, f)));
}

const files = TARGETS.flatMap(walk).filter((f) => /\.(md|json|ts|tsx)$/.test(f) && !f.endsWith("README.md"));
let total = 0;
for (const f of files) {
  const raw = fs.readFileSync(path.join(ROOT, f), "utf8");
  const hits = f.endsWith(".json") ? checkJson(JSON.parse(raw)) : checkText(raw);
  for (const h of hits) {
    total++;
    console.error(`✗ ${f}:${h.line}  "${h.match}" (${h.why})\n    ${h.text}`);
  }
}

// Resource freshness: warn, never fail.
const resFile = path.join(ROOT, "content/resources.json");
if (fs.existsSync(resFile)) {
  const sixMonths = 183 * 24 * 3600 * 1000;
  for (const r of JSON.parse(fs.readFileSync(resFile, "utf8")).resources ?? []) {
    if (JSON.stringify(r).includes("TODO_VERIFY")) console.warn(`⚠ resource "${r.id}" has TODO_VERIFY fields; hidden on the live site until filled.`);
    else if (!r.lastVerified) console.warn(`⚠ resource "${r.id}" has never been verified (lastVerified is empty).`);
    else if (Date.now() - Date.parse(r.lastVerified) > sixMonths) console.warn(`⚠ resource "${r.id}" was last verified ${r.lastVerified}, over six months ago.`);
  }
}

if (total) {
  console.error(`\nscope-check: ${total} problem${total === 1 ? "" : "s"} in ${files.length} files. Rephrase, or add "<!-- scope-ok: <reason> -->" on the line above if the wording is intentional (see content/README.md).`);
  process.exit(1);
}
console.log(`scope-check: ${files.length} files clean.`);
