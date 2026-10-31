# THE SUPPORT SHELF — AUDIT REMEDIATION

Repo: the Support Shelf Next.js app (headless Shopify front end on Vercel).  
Source of truth for this work: `docs/FULL_SITE_AUDIT.md`. Read it fully before touching code. Finding IDs below (F-01 … F-27) refer to that document.

**Role:** senior full-stack engineer + accessibility reviewer + ABA scope-of-practice editor. Behave like someone who has to defend every diff to the person who wrote the audit.

**The conversion this site exists for (do not lose sight of it):**
Primary — a parent gets a free tool (ABC Tracker, Home ABC Printable or Waitlist Playbook) and leaves an email.  
Secondary — a parent buys The Care Binder ($14.99) or Read Your Child's Treatment Plan ($9.99).  
Every change should make one of those two things easier or more trustworthy. Nothing should add urgency, pressure or dark patterns. Parents' trust comes before conversion.

---

## 0. Ground rules

1. Work in stages, in order. Commit at the end of each stage with message `fix(audit): Stage N — <summary> (F-xx, F-yy)`. Do not start a stage until the previous one builds, typechecks and lints clean.
2. **Do not change anything in audit Section I ("What should NOT change")** — voice, scope language, shelf metaphor, visual system, tracker privacy architecture, PDF layout, accessibility baseline. If a fix would touch those, stop and explain before doing it.
3. No new dependencies unless a fix is impossible without one; if you add one, say why in the commit.
4. No deploys, no env var changes in Vercel, no Shopify mutations, no emails sent, no domain purchases. Where a fix needs a production env var, write the exact key + value I must set into `docs/AUDIT_FIXES.md` under "Operator actions" and make the code fail loudly (build-time) if it's missing in production.
5. Never invent: no fake testimonials, no "Reviewed by a BCBA" unless a name is supplied, no made-up certification numbers, no citations.
6. Keep a running log at `docs/AUDIT_FIXES.md`: one row per finding — ID, what changed, files, how you verified it, anything left for me. This is the handoff.
7. The decisions block (§1) contains values I've already made. Where a value is marked `DECIDE`, stop at that point and ask me; don't guess.

---

## 1. Decisions already made (use these)

| Item | Value |
|---|---|
| Contact email | `DECIDE` — use `kyle@stringhamwebdesign.com` unless a `@thesupportshelf.org` mailbox exists |
| Founder photo | `DECIDE` — file path if available; if not, build the slot and leave a clearly-marked placeholder *component* (not placeholder text) hidden until an image exists |
| RBT credential line | "Registered Behavior Technician since 2023" + link to the BACB registry search page. Certification number: `DECIDE` (omit the number if not supplied; never fabricate) |
| BCBA reviewer | None yet. Do not imply review anywhere. Where product pages have a "review status" slot, show "Clinical review: pending" in neutral language |
| ABC Tracker's home shelf | **Shelf 1 — Get Organized** (matches the Shopify tag `shelf-organized` on Home ABC Printable). Remove it from Shelf 4 on `/shelf` |
| Canonical shelf descriptions | Use the **homepage** one-liners as the single source; `/shelf` adopts them |
| Free product delivery | Shopify $0 checkout (automated delivery through the existing digital-downloads setup, email captured, no new infra). Label the button "Get it free" and say "Checkout takes 30 seconds, no card needed" next to it |
| Coming-soon cap | Max 3 per shelf, in the order already on the page; the rest are removed from the UI (keep the data) |
| Newsletter checkbox | Unchecked by default, labelled, copy unchanged |
| Search | Hide the header search until the catalog has ≥ 8 findable items (products + ABC tracker). Keep the component; gate it on a count |
| Site URL | `https://www.thesupportshelf.org` (www is canonical; non-www must 301 to www — verify in `next.config` / Vercel domain settings and note in operator actions if it's a dashboard setting) |

---

## 2. Stage 1 — Trust, metadata, navigation (Phase 1 of the audit roadmap)

*What this stage adds:* the site stops contradicting itself and becomes shareable and crawlable. Nothing new is built; broken promises are removed.

Fix, in this order, with the audit's evidence as your acceptance test:

- **F-02** — `metadataBase` in the root layout from a `NEXT_PUBLIC_SITE_URL` env var; sitemap and robots use the same source; og:image / twitter:image resolve to `https://www.thesupportshelf.org/og.png`. Fail the production build if the var is missing or contains `localhost`. Add the operator action to set it in Vercel (Production + Preview).
- **F-03** — Add the contact email as a `mailto:` in the footer and on `/about`. Point the footer "Contact" link at `/about#contact`. Update `/privacy` ("Email or call us using the details in the footer") and `/thanks` ("write to us") so they point at something real. No phone number.
- **F-08** — Privacy page: add an "Last updated" date; replace "This page has not yet been reviewed by a lawyer" with "This is a plain-language summary of what the site does today; a formal policy is being prepared"; describe the email-export pipeline precisely (sent once → PDF built on the server → emailed through Resend → entries discarded; email address kept only to send the export and, if the box is ticked, for new-download notices; unsubscribe link in every email); keep the Shopping section (products go live in Stage 2) but make it accurate to $0 checkouts too.
- **F-05** — Email-export newsletter checkbox: `defaultChecked={false}`, proper `<label htmlFor>` association. Copy stays.
- **F-06** — Mobile header: show About, Shelves and ABC tracker at all widths (drop "How it works" below `sm` if space is tight — it's an anchor to the same page). Collapse the search into an icon that expands. Verify at 375 px: no overflow, all four links tappable (≥ 44 px targets).
- **F-07** — Make `/` and `/shelf` read from one shelf data module (id, name, one-liner, tools[], coming-soon[]). ABC Tracker on Shelf 1 only. Descriptions identical on both pages.
- **F-12** — Cap coming-soon cards to 3 per shelf on both pages. Remove the "Learn more about X" links (they only anchor to the same page). Keep each shelf's single "Tell me first" email form on `/shelf`; reduce to one form per shelf, not one per card.
- **F-10** — Fix the React #418 hydration error on `/abc` (time-dependent default on the `datetime-local` input and any "now" text): render those client-side after mount. Acceptance: zero console errors on a fresh load of `/abc`, `/`, `/cart`.
- **F-13** — `/about`: change "In my first year as a Registered Behavior Technician" to accurate wording; add the credential line from §1; add the photo slot. On `/`, the "Made by an RBT · With real experience" trust item stays.
- **F-26** — Find the resource that 404s on load (Network tab on `/`) and fix it.
- **F-27** — Move "The free ABC logger stores nothing on our servers" out of the global footer; keep it on `/abc` and `/privacy`.
- **F-25** — Link `988lifeline.org` and `childhelphotline.org` on `/crisis` (external, `rel="noopener"`).
- **F-24** — Canonical `<link>` per page via the metadata API; Organization + WebSite JSON-LD in the root layout (name, url, logo, founder "Kyle Stringham", `sameAs` only if you have real URLs).

**Stage 1 verification before commit:** `next build`, typecheck, lint; fetch `/sitemap.xml`, `/robots.txt`, and the rendered `<head>` of `/` from the local build and confirm no `localhost`; run axe (jest-axe or `@axe-core/cli` against the local server) on `/`, `/shelf`, `/abc`, `/about`, `/privacy`, `/crisis` — must stay at zero violations; screenshot `/` at 375 and 768 with the header fix.

---

## 3. Stage 2 — The catalog (F-01)

*What this stage adds:* the four finished products become visible, purchasable/downloadable, and the cart/thanks pages finally have a job. This is the first real conversion path on the site.

Facts (verified against Shopify Admin, read-only):

| Handle | Title | Price | Tags (shelf) |
|---|---|---|---|
| `home-abc-printable` | Home ABC Printable | $0 | `shelf-organized`, `free` |
| `waitlist-playbook` | The Waitlist Playbook | $0 | `shelf-plan`, `free` |
| `care-binder` | The Care Binder | $14.99 | `shelf-organized` |
| `read-your-childs-treatment-plan` | Read Your Child's Treatment Plan | $9.99 | `shelf-plan` |

All four are ACTIVE on the Headless sales channel with featured images on `cdn.shopify.com`.

Build:

1. **Storefront client.** If a Storefront API client already exists, use it; if not, add a minimal typed fetch wrapper (no SDK) reading `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (server-only). Operator action: I will create the token; list the exact scopes you need (`unauthenticated_read_product_listings`, `unauthenticated_write_checkouts` / cart). Fail loudly in production if missing.
2. **Shelf placement from tags.** Map `shelf-organized` → Shelf 1, `shelf-plan` → Shelf 2, `shelf-everyday` → Shelf 3, `shelf-home` → Shelf 4. Products render **above** the coming-soon list on both `/` (drawer) and `/shelf`.
3. **Product card** (shared component): image, title, one-line "who it's for" (from the product description's first sentence), price or "Free", primary button ("Get it free" / "Buy · $14.99"). "Free" is never styled as a discount.
4. **Product page** `/shelf/[handle]`: image, title, price, full description (Shopify rich text → sanitized HTML), "What's inside" (from description or metafield if present), file type + page count if available, "Clinical review: pending" line, the standard scope line ("This tool records and organizes. Your BCBA writes the plan."), primary button, link back to its shelf. Unique `<title>` and meta description per product; Product JSON-LD with `offers`. One H1.
5. **Cart + checkout.** Add-to-cart → Shopify cart (Storefront Cart API) → redirect to Shopify checkout. `/cart` lists items, totals, "Checkout" and "Keep browsing". `/thanks` copy stays as the post-checkout landing (confirm the checkout return URL points there; if that's a Shopify dashboard setting, add to operator actions).
6. **Homepage ABC log mockup** — its caption "The Support Shelf · Home ABC Printable" becomes a link to that product.
7. **Search** — gate per §1 (hidden until ≥ 8 items). Leave the empty-state copy fixed anyway: "Not on the shelf yet. The four shelves below hold everything that exists today."
8. **CSP (F-14)** — now that you know the exact origins, add a Content-Security-Policy via `next.config` headers: `default-src 'self'; script-src 'self' 'nonce-…' (or 'unsafe-inline' only if the framework needs it — explain); img-src 'self' cdn.shopify.com data:; connect-src 'self' <store>.myshopify.com; font-src 'self'; frame-ancestors 'none'; form-action 'self' <checkout domain>`. Set `poweredByHeader: false`. Verify nothing breaks (hero, drawer, tracker export, checkout redirect).

**Stage 2 verification:** every product reachable from `/` and `/shelf` and by direct URL; a $0 product can be added to cart and the checkout redirect URL is correct (do not complete it); every link on the new pages clicked; axe zero on `/shelf/care-binder` and `/cart` with an item; Lighthouse mobile on `/`, `/shelf`, `/shelf/care-binder` — record the scores in the log (target ≥ 80 performance, don't game it).

---

## 4. Stage 3 — ABC Tracker integrity and polish (F-04, F-09, F-15, F-16-lite, F-17, F-18, F-19, F-20, F-21, F-22, F-23)

*What this stage adds:* the tracker's exports become something a BCBA can trust, and the one visual that reads as broken (the shelf animation) is fixed.

- **F-04 (highest priority here).** One observation = one entry with `behaviorIds: string[]`. Bump storage to `support-shelf-abc-v2` with a one-time migration that merges v1 rows sharing identical `occurredAt + antecedentCode + antecedentNote + consequenceCode + consequenceNote + createdAt` into one observation (log the merge count to the console once, then delete the v1 key). Counts in the PDF, CSV and on-page views are per observation; behaviors are listed within a row. PDF Counts page header: "N observations · M behaviors noticed". CSV: one row per observation, behaviors joined with `; ` in `noticed`, plus a second optional file or column set if a BCBA needs one-row-per-behavior — choose the simpler and document it. Update the on-page sample data so it demonstrates the correct model (6 observations, with at least one showing two behaviors).
- **F-09** — Books run `sd-settle` once on mount only; selecting a book animates that book's lift and the drawer. Respect `prefers-reduced-motion` for all shelf keyframes and for `scroll-behavior: smooth` (disable both).
- **F-15** — After selecting a book on viewports < 768 px, scroll so the drawer's heading sits just below the shelf; add `aria-expanded` to each book reflecting the drawer state.
- **F-17** — Edit sheet title "Edit entry"; use the edit sheet's duration control (presets + exact minutes) in the create form too.
- **F-18** — PDF/CSV: when function is "Not sure", omit the reflection text; drop the "Something else:" prefix when a free-text note exists.
- **F-19** — Waitlist and export email forms: inline validation message + `aria-live="polite"` status; on success replace the form with "You're on the list" (waitlist) / "Sent — check your inbox" (export); on failure, a retry message. Test the server action's error path with the network blocked.
- **F-20** — PDF: replace glyphs outside the embedded fonts' coverage with `[emoji]`-style markers rather than tofu, or embed a Noto subset if it costs < 150 KB. Add a `/Lang` entry and set the document language.
- **F-21** — Return focus to the triggering entry button when the edit sheet closes; auto-dismiss toasts after 5 s (keep `role=status`); trim trailing punctuation before "Saved N entries for X."
- **F-22** — Weekly table on mobile: edge fade + "swipe to see more" hint, or stack columns under 480 px.
- **F-23** — Minimum 12 px for eyebrows/captions site-wide.
- **F-16 (lite)** — Don't build multi-child yet. Add one sentence under the nickname field: "One child per browser for now. For a second child, use a different browser or profile." Log the full multi-child feature as a follow-up in `AUDIT_FIXES.md`.
- **Primer** — Move a three-line "What ABC is and what to write" block above the form (reuse the existing explainer copy; don't write new clinical content). After the first successful save, show a one-time "What to do next" card: export weekly, bring it to your BCBA, the tracker never interprets.

**Stage 3 verification:** run the exact test from the audit — nickname with quotes/comma, two behaviors, custom behavior with `"` `,` `;` `<b>` and an emoji, Moderate, 1–5 min → expect **1** entry; export CSV and PDF and confirm counts; edit; delete; delete-everything; confirm `support-shelf-abc-v1` is gone and `-v2` is the only key; zero console errors; axe zero on `/abc` with an entry and with the edit sheet open.

---

## 5. Stage 4 — Launch-checklist pass and handoff

*What this stage adds:* proof the site is ready, in my checklist's terms, and a record I can hand to anyone.

Run through every item and write the result in `docs/AUDIT_FIXES.md` under "Launch checklist":

- Message: homepage says what / for whom within 5 s; **one** primary CTA per page, visually dominant (on `/` that is now "Find my shelf" → the shelf; demote "Browse all support" to a text link); contact reachable from every page (footer mailto).
- Mobile: 375 and 768 screenshots of every route — readable without zoom, no overflow, thumb-tappable buttons.
- Speed: images sized and compressed (Shopify CDN params for product images); Lighthouse mobile ≥ 80 on `/`, `/shelf`, `/abc`, a product page — record real numbers.
- Credibility: founder photo slot (filled or hidden cleanly), credential line, privacy link, © 2026, `grep -ri "lorem\|TODO\|placeholder\|localhost" src/ app/ public/` returns nothing user-facing. No testimonials yet — do not fabricate; add a "Collect first 3 parent quotes" item to operator actions.
- Search: unique title + description per page; one H1 per page; alt text on every image (product images get the product title); favicon and og image verified in the rendered head; sitemap lists every public route including product pages; operator action: submit sitemap in Search Console after deploy.
- Plumbing: waitlist form and export email tested against a staging/preview environment, not production; every internal and external link clicked (write a small link-check script and keep it in `scripts/`); 404 page exists; HTTPS; www and non-www both resolve to www.
- Handoff: `docs/AUDIT_FIXES.md` complete; list of env vars and Shopify/Vercel dashboard settings I must set, each with the exact value or where to find it.

Finish with a short summary in chat: what shipped per stage, what's blocked on me (the `DECIDE` items and operator actions), and the three things you'd fix next if you had another day.

---

## 6. What "done" looks like

A parent on a phone lands on `/`, understands it in five seconds, taps one shelf, sees a real free tool above the coming-soon list, gets it in under a minute, and can email a human if something goes wrong. A BCBA who receives the PDF sees one row per observation and counts they can trust. Every share shows the right image. No page contradicts another.
