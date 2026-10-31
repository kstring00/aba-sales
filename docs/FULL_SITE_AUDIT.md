# The Support Shelf — Full Site Audit

**Site:** https://www.thesupportshelf.org  
**Audited:** Oct 30–31, 2026 (live production site only; repository not inspected)  
**Method:** Every reachable route crawled; interactive flows exercised in a real browser at 449 px (phone), 768 px (tablet) and 1440 px (desktop); ABC Tracker run end-to-end including CSV + PDF export (intercepted, not downloaded), edit, delete and delete-everything; axe-core 4.10 WCAG 2.2 AA scan on 6 routes; response headers, sitemap, robots, metadata and localStorage inspected; Shopify catalog checked read-only. No emails sent, no signups submitted, no purchases, no production data mutated. All test ABC entries were deleted through the site's own "Delete everything" flow.

**Not verified (needs the repo):** code quality, dependency versions/vulnerabilities, env config, server-side email handling, rate limiting, test coverage, bundle composition, and Core Web Vitals (the browser link dropped before timings were captured). Anything below marked *unverified* is a flag, not a finding.

---

## A. Executive Assessment

The Support Shelf is a well-crafted shell around one real product. The design system is distinctive and consistent, the copy is unusually honest ("Observe, don't diagnose"; "Your BCBA writes the plan"), accessibility is better than most commercial sites (zero axe violations on every route), and the ABC Tracker works end-to-end with faithful exports. That is a strong foundation.

The problem is what a parent actually finds. Of 16 tools shown on the site, 15 are "Coming soon." The four products that exist in Shopify (two free, two paid) are **not on the site at all** — no product pages, no download links, no prices — even though the homepage mockup is labelled "Home ABC Printable" and the /shelf page says "Prices are shown as they are." Production metadata (sitemap, robots, social image) points at `localhost:3000`. There is no way to contact you anywhere on the site, while the privacy page and thank-you page both tell visitors to "write to us using the details in the footer."

A first-time parent will understand what the site is within five seconds, try the tracker, and then hit a wall of coming-soon cards. The site is ready to *demo*; it is not yet ready to *promote*.

### Scores (0–100)

| Area | Score | How it was determined |
|---|---|---|
| Visual design | **82** | Cohesive palette, typography (Fraunces/Figtree/Caveat) and component language across all 8 routes; shelf hero is a genuine signature. Deductions: books re-run their entrance animation on every click (reads as a glitch), 10 px eyebrow text, mobile drawer opens below the fold. |
| User experience | **55** | Clear purpose, but the two shelf pages contradict each other (ABC Tracker on Shelf 1 vs Shelf 4; different shelf descriptions), mobile header hides About/Shelves with no menu, search can never return a result, and most journeys dead-end at "Coming soon." |
| Mobile usability | **72** | No horizontal overflow at 375/449/768; buttons and chips comfortably tappable (hero CTAs 49 px tall); text readable. Deductions: hidden nav, drawer below the fold, weekly table scrolls sideways with no affordance, 24 text nodes under 12 px. |
| Functionality | **50** | ABC Tracker: create/edit/delete/export/delete-all all verified. Catalog: 0 of 4 Shopify products reachable; cart/thanks exist for a flow that can't start. Email signup: validation works; submission not tested. |
| Accessibility | **86** | axe-core: 0 violations on /, /abc, /shelf, /about, /privacy, /crisis (drawer open and closed). Landmarks, skip link, tabs, dialog, tel:/sms: links all correct. Deductions: newsletter checkbox has no accessible name ("on"); focus returns to `<body>` after closing the edit sheet; hero books lack `aria-expanded`. |
| Technical quality | **60** | Next.js on Vercel, brotli, self-hosted fonts, server actions with honeypot. Deductions: React hydration error #418 on every /abc load; `NEXT_PUBLIC_SITE_URL` (or equivalent) unset in production; no canonical tags; no CSP. Repo not inspected. |
| Performance | **not scored** | Timings were not captured (browser link dropped). Observed: 13 JS chunks + 1 CSS + 3 woff2 on first load, PDF fonts (3 TTF) lazy-loaded only on export, no third-party scripts. Run Lighthouse mobile before launch; do not treat this as a pass. |
| SEO | **35** | Unique titles and descriptions per page ✔. But: sitemap and robots `Sitemap:` line list `http://localhost:3000/...`; og:image/twitter:image are `localhost` (social previews broken everywhere); no canonical; no structured data observed; only 6 URLs; nothing to rank for beyond the brand. |
| Security & privacy | **74** | HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy ✔. Tracker data stays in localStorage ✔ (verified: zero network calls on save). Deductions: no CSP (a third-party script injected from the page context without resistance — any XSS could read child data in localStorage); pre-ticked marketing consent; privacy page has no date, describes a shop that isn't live, and promises contact details that don't exist; `x-powered-by` exposed. Server-side export handling unverified. |
| Clinical accuracy & trust | **78** | Scope language is excellent and consistent (every surface says the tool records, the BCBA plans; function question labelled "reflection… not a diagnosis"; exports say "no interpretation"). Deductions: one observation with two behaviors is saved as two entries, which doubles counts in the BCBA summary; "Parent's reflection: might be not sure" phrasing; founder note says "first year as an RBT" (stale — you've been an RBT since 2023); no RBT credential verification or named BCBA reviewer; no founder photo. |
| Business & product readiness | **30** | Value prop clear, pricing principle honest, but 15/16 tools are coming soon, 4 finished products are invisible, no contact path, no proof (testimonials, samples, downloads), and the only conversion available is a waitlist email. |

---

## B. Complete Website Inventory

| Route / feature | State | Notes |
|---|---|---|
| `/` homepage | **Verified working** | Hero, 4-book shelf, drawer per shelf, Why-it-matters, ABC log mockup, CTA, footer. |
| Shelf interaction (click book → drawer) | **Verified working** | aria-pressed toggles, aria-controls → `#shelf-drawer`, hidden panels for inactive shelves. Entrance animation replays on each click (see F-09). |
| "Find my shelf" button | **Unable to verify** | `type=button`; presumed scroll-to-shelf. |
| Header search → `/shelf?q=` | **Verified working (always empty)** | Returns "Nothing on the shelf matches…" for every query because only one item exists. |
| `/shelf` | **Verified working / Incomplete** | 4 shelf cards, 15 coming-soon tools, ABC logger card, 4 waitlist forms. **No products.** |
| Waitlist email form (×4 on /shelf) | **Partially verified** | Server action, `required`, `type=email`, honeypot `website` field, hidden `source`. Native validation blocks bad input; no inline error message. Submission not tested. |
| `/abc` ABC Tracker | **Verified working** | Nickname, 12 preset behaviors + custom, function picker, A/B/C with phrase pickers + free text, intensity, duration, save → localStorage key `support-shelf-abc-v1`. |
| Entries list / Time of day / Right before views | **Verified working** | Tabs are real `role=tab`; chart has text summary. |
| Edit entry (bottom sheet) | **Verified working** | Change noticed/before/after, when, how long, intensity, note, Save changes. |
| Delete entry | **Verified working** | Inline "Delete this entry for good? Keep / Delete", status "Deleted." |
| Delete everything | **Verified working** | 3-step confirm; clears localStorage entirely. |
| Labels & settings | **Verified working** | Rename nickname, hide/add labels; delete label only when unused. |
| Download CSV | **Verified working** | RFC-4180 escaping correct; special characters, quotes, commas, semicolons, emoji all preserved. |
| Download PDF | **Verified working** | pdf-lib, 2 pages (weekly table + counts), faithful to entries; emoji render as tofu; not a tagged PDF. |
| Email me my export | **Partially verified** | Panel opens with email field, Send, pre-checked newsletter box. Not sent. Server path unverified. |
| `/about` | **Verified working** | Founder note, "What this is not", CTA. No contact details. |
| `/privacy` | **Verified working** | Plain-language policy. No date; references contact details that don't exist. |
| `/crisis` | **Verified working** | 911, 988, Childhelp, Crisis Text Line, 211 with tel:/sms: links. |
| `/cart` | **Verified working (empty)** | "Nothing here yet. Browse the shelf." robots-disallowed. |
| `/thanks` | **Verified working (orphan)** | Post-purchase page for a purchase flow that cannot start. robots-disallowed. |
| 404 page | **Verified working** | "That shelf is empty." + Back home. Good. |
| Product pages / checkout | **Not implemented on site** | 4 ACTIVE products exist in Shopify (Home ABC Printable $0, Waitlist Playbook $0, Care Binder $14.99, Read Your Child's Treatment Plan $9.99) tagged `shelf-organized` / `shelf-plan`; none rendered anywhere. |
| Contact form / email / phone | **Not implemented** | Footer "Contact" → `/about`. |
| `sitemap.xml`, `robots.txt` | **Defective** | All URLs `http://localhost:3000/...`. |
| Open Graph / Twitter card | **Defective** | `og:image` = `http://localhost:3000/og.png` (the file itself exists at `/og.png`, 44 KB). |
| Favicon / icons | **Verified working** | favicon.ico, icons/icon.svg, apple-touch-icon all 200. No manifest (not required). |
| Security headers | **Verified** | HSTS 2y, XFO DENY, nosniff, referrer-policy, permissions-policy. No CSP. |
| Analytics / trackers | **Verified absent** | Only first-party `_next` chunks load. Matches privacy page. |
| `/api/*` | **Unable to verify** | `/api` and `/api/health` 404. Email export endpoint not exercised. |
| Build, lint, types, tests, deps | **Unable to verify** | Repo not inspected. |

---

## C. Detailed Findings

Severity: **P0** critical · **P1** high · **P2** medium · **P3** low. Effort: S (< 2 h), M (half–one day), L (multi-day).

| ID | Sev | Page/Feature | Problem | Evidence | Recommended fix | Effort |
|---|---|---|---|---|---|---|
| F-01 | **P0** | Catalog | The four finished products are not reachable anywhere on the site. No product cards, pages, prices or download links. The homepage mockup is labelled "Home ABC Printable"; `/shelf` says "Prices are shown as they are; free means free"; `/thanks` promises a Shopify download email — all for products a visitor cannot find. | `/shelf` main contains exactly one link (`/abc`). Shopify Admin (read-only) shows 4 ACTIVE products tagged `shelf-organized`/`shelf-plan`, Headless channel. | Wire the Storefront API: render product cards on `/shelf` under their shelf, add `/shelf/[handle]` pages with price, preview image, what's inside, BCBA-review status, and a Buy/Download button; free items → instant download or email-gate; paid → Shopify checkout. Then the cart and thanks pages have a job. | L |
| F-02 | **P1** | Metadata | Sitemap URLs, `robots.txt` `Sitemap:` line, `og:image` and `twitter:image` all use `http://localhost:3000`. Google receives a sitemap of localhost URLs; every social/iMessage/Slack share shows no image. | `sitemap.xml` → `<loc>http://localhost:3000/shelf</loc>` ×6; homepage meta `og:image: http://localhost:3000/og.png`. | Set the site-URL env var in Vercel production (and preview) and use `metadataBase` in the Next.js root layout; redeploy; resubmit sitemap in Search Console; re-scrape with Facebook/LinkedIn debuggers. | S |
| F-03 | **P1** | Contact | No email, phone or form exists on any page. Footer "Contact" links to `/about`, which has none. `/privacy` says "Email or call us using the details in the footer. A person answers." `/thanks` says "write to us." | DOM scan of all 8 routes: zero `mailto:`, zero phone, zero contact form. | Add a real contact method (at minimum a `mailto:` in the footer and on `/about`; ideally a short form with honeypot) and make the footer "Contact" link point to it. | S |
| F-04 | **P1** | ABC Tracker · data integrity | Selecting two behaviors for one observation saves **two entries** with identical A/C/time. The BCBA PDF then counts the antecedent and consequence twice ("An instruction was given — 2") and the weekly header says "2 entries" for one event. The on-page sample ("6 entries") teaches the same inflated reading. | Saved Hitting + custom behavior once → toast "Saved 2 entries"; localStorage `entries.length === 2`; PDF Counts page shows Right before = 2. | Model one observation with `behaviorIds[]`; count observations, not behavior rows; in the PDF show "2 behaviors in 1 observation." If you keep one-row-per-behavior, say so in the UI and compute counts per observation. | M |
| F-05 | **P1** | Email export | Newsletter consent checkbox is pre-ticked ("Also tell me when new downloads reach the shelf"), and its accessible name is "on" (no label association). Pre-checked marketing consent is a dark pattern, conflicts with the site's trust posture, and is non-compliant in several jurisdictions. | `checkbox "on" [type=checkbox]` `checked === true` on open; `labels.length === 1` but name not exposed. | Default unchecked; associate the label (`<label for>` or wrap); keep the honest copy. | S |
| F-06 | **P1** | Mobile header | Below the `sm` breakpoint the header shows only logo, "ABC", search and cart. About, How it works and Shelves are `display:none` with no menu button, so phone users can only reach About and Shelves through the footer. | `header a` visibility at 449 px: About:false, How it works:false, Shelves:false; no `[aria-expanded]` button. | Either keep all 4 links visible (they fit at 375 px with the search collapsed) or add a menu button. | S |
| F-07 | **P1** | Information architecture | The two shelf surfaces disagree. Homepage: ABC Tracker lives on Shelf 1 "Get Organized" ("Track, plan, and keep everything in one place"). `/shelf`: the ABC logger lives on Shelf 4 "Support at Home" ("Notice what happens, write it down…"). All four shelf descriptions differ between pages. Shopify tags the printable `shelf-organized`. | Compare homepage drawer H2/H3 structure vs `/shelf` sections. | Pick one home per tool and one description per shelf; drive both pages from the same data source. | S |
| F-08 | **P1** | Privacy page | No effective date; says "This page has not yet been reviewed by a lawyer"; describes a Shopify shopping flow and a cart cookie for a shop that isn't live; promises contact details that don't exist. Also doesn't name who receives emailed exports (Resend) or retention of the email address. | Page text. | Add date + version; remove or reframe the lawyer line ("Plain-language summary; a formal policy is being prepared"); describe the export pipeline (server → PDF → Resend → discarded; address retained until unsubscribe); fix contact; ship the shop or remove the shop section until it exists. | S |
| F-09 | **P2** | Shelf hero | Every time a book is clicked, all four books re-run their `sd-settle` entrance animation (~0.9–1.2 s), so the shelf briefly empties before the books drop back in. On screenshots taken 1.5 s after a click the shelf was bare. | `document.getAnimations()` after a click: 4× `sd-settle` restarted, `currentTime` 900–1170 ms. | Run the settle animation once on mount only; on selection animate only `transform`/`opacity` of the selected book. Also honor `prefers-reduced-motion` for `scroll-behavior:smooth` and these keyframes (*reduced-motion handling unverified*). | S |
| F-10 | **P2** | `/abc` | React hydration error #418 (text mismatch) on load. Almost certainly the `datetime-local` default value or the "10:42 PM" time rendered on the server differing from the client. | Console: `Uncaught Error: Minified React error #418` on `/abc`. | Render time-dependent values client-side only (`useEffect`/`suppressHydrationWarning` on that input). | S |
| F-11 | **P2** | Search | Header search exists on every page but can only ever return "Nothing on the shelf matches … yet", and the placeholder ("Binder, plan, routines…") advertises items that don't exist. The no-results copy ("the Everyday Life shelf takes an email") is confusing. | `/shelf?q=binder` → empty state despite a "Care Binder" product in Shopify. | Hide search until there are ≥ 8 findable items, or make it search the Shopify catalog + coming-soon titles. Rewrite the empty state: "Not here yet. Tell me when it is → [email]". | S |
| F-12 | **P2** | Coming-soon density | 15 of 16 tools are "Coming soon." Each has a Learn-more link that only jumps to the same /shelf anchor, so every click is a dead end. | Homepage drawer: 15 "Coming soon" cards; `/shelf`: 14 coming-soon items. | Show at most 2–3 coming-soon items per shelf (the ones actually in production); drop the "Learn more" links; put the four real products first. | S |
| F-13 | **P2** | Trust / credentials | "Made by an RBT" appears repeatedly, but there is no founder photo, no RBT certification number or BACB registry link, and no named BCBA reviewer on any clinical content. The founder note says "In my first year as a Registered Behavior Technician" — stale (RBT since 2023). | `/about` text; `/` trust strip. | Add a photo, "RBT since 2023 · BACB #…" with registry link, and a "Reviewed by [Name], BCBA" line once you have one. Do not imply review before it exists. | S |
| F-14 | **P2** | Security headers | No `Content-Security-Policy`. From the page context a script from a third-party CDN loaded and executed without resistance. Child observations live in localStorage, so any future XSS (e.g. a dependency, a rogue browser extension interaction) could read them. `x-powered-by: Next.js` exposed. | `fetch('/').headers` — CSP absent; axe-core injected from cdnjs executed. | Add a CSP (`default-src 'self'; script-src 'self' 'nonce-…'; img-src 'self' cdn.shopify.com data:; connect-src 'self' <storefront endpoint>; frame-ancestors 'none'`), `poweredByHeader:false`. | M |
| F-15 | **P2** | Mobile shelf drawer | After tapping a book on a phone, the page scrolls so the shelf is in view but the drawer content starts ~300 px below the fold; nothing signals that something opened. | At 449 px after click: `scrollY` 259, drawer H2 top 890. | Scroll so the drawer's heading lands ~16 px below the (sticky) shelf, or animate the selected book toward the drawer. | S |
| F-16 | **P2** | ABC Tracker · single child | Data model holds one `child` object. A parent with two children in ABA cannot keep separate logs; renaming the nickname relabels all history. | localStorage `child: {nickname, createdAt}`. | Support multiple children (array + switcher) or state the one-child limit plainly in the nickname helper text. | M |
| F-17 | **P2** | ABC Tracker · edit sheet | Sheet title is "Ready to save" when *editing* an existing entry. Duration choices differ between create form (`< 1 min / 1–5 / 6–15 / 15+`) and edit sheet (`Under a minute / About 5 min / About 15 min / 30 min or more / exact minutes`). | Dialog text; create form buttons. | Title "Edit entry"; use one duration control in both places (the edit sheet's, with exact-minutes, is the better one). | S |
| F-18 | **P2** | PDF export | Function "Not sure" renders as "Parent's reflection: might be not sure." Consequence/antecedent typed without picking a phrase renders as "Something else: …" prefix. | PDF text extraction. | Omit the reflection column when "Not sure"; drop the "Something else:" prefix when a note exists. | S |
| F-19 | **P2** | Email signup feedback | Invalid email relies on native browser validation only; no inline message, no `aria-live` region. Success/failure state after submit *unverified*. | `:invalid` on 4 inputs, `[role=alert]` empty. | Add inline validation text and a status region; show "You're on the list" in place. | S |
| F-20 | **P3** | PDF export | Emoji and non-Latin glyphs render as tofu (standard fonts in pdf-lib). PDF is untagged. | Rendered page 1: "😀" → ▯. | Strip unsupported glyphs with a note, or embed a Noto subset; add PDF title/lang (already has title). | S |
| F-21 | **P3** | ABC Tracker · a11y | After closing the edit sheet, focus lands on `<body>` instead of the entry button that opened it. "Saved… Jr.." double period when nickname ends in a period. Save toast remained visible > 60 s. | `document.activeElement === BODY` after Delete; toast text. | Return focus to the trigger; trim trailing punctuation; auto-dismiss toast after ~5 s. | S |
| F-22 | **P3** | Weekly preview table | On phones the sample/weekly table scrolls horizontally (602 px in a 362 px box) with no visual cue; last columns are hidden. | `scrollWidth 602`, `clientWidth 362`. | Fade edge or "scroll →" hint; or stack columns on mobile. | S |
| F-23 | **P3** | Typography | 24 text nodes under 12 px on mobile; eyebrows at 10 px ("REAL SUPPORT FOR REAL FAMILY LIFE"). | Computed font sizes at 375 px. | Raise eyebrows/captions to 12 px minimum. | S |
| F-24 | **P3** | SEO | No `<link rel=canonical>` on any page (verified on `/shelf`, DOM); no JSON-LD observed (Organization/WebSite/SoftwareApplication for the tracker, Product for downloads). | DOM query. | Add canonical per page; add Organization + WebSite JSON-LD; Product JSON-LD on product pages once they exist. | S |
| F-25 | **P3** | `/crisis` | "988lifeline.org" and "childhelphotline.org" appear as plain text, not links. | Links list contains only tel:/sms:. | Link them. | S |
| F-26 | **P3** | Console | One resource 404s on page load (not the icons or og.png — those return 200). | Console: "Failed to load resource: 404". | Identify in the Network tab and fix. | S |
| F-27 | **P3** | Footer / global | "The free ABC logger stores nothing on our servers" sits in the copyright line of every page, including `/cart` and `/crisis`, where it reads oddly. | Footer text. | Move it to the `/abc` page and privacy page only. | S |

---

## D. Page-by-Page Recommendations

**Homepage.** Works: hero message passes the 5-second test; the shelf is a real signature interaction; trust strip and "Observe, don't diagnose" framing; ABC log mockup sells the free tool; footer disclaimer. Doesn't: 15 coming-soon cards; ABC Tracker on the wrong shelf vs `/shelf`; books re-animate on click; drawer below the fold on phone; "Find my shelf" and "Browse all support" compete (two CTAs, equal weight). Missing: the four real products; a founder face; any proof (a quote from a BCBA or parent). Change: make the drawer show *real* items first, cap coming-soon at 2–3 per shelf, one dominant CTA ("Open the free ABC Tracker" is the honest one today), fix the animation. Outcome: a parent sees something they can use within one tap.

**/shelf.** Works: the four shelf cards, per-shelf waitlist with honest "Nothing else" promise, logger card with "nothing leaves your device." Doesn't: zero products, broken promise in the intro copy, search that can't succeed, confusing empty-state copy. Change: render Shopify products under their shelf with price and a one-line "who it's for"; move the ABC logger to the same shelf as the homepage; one waitlist form at the bottom instead of four. Outcome: this page becomes the catalog it claims to be.

**/abc.** Works: almost everything — the form, scope language, the three views, the exports, delete flows, crisis link. Doesn't: per-behavior entry splitting, hydration error, pre-ticked newsletter box, single child, inconsistent duration control, focus management. Missing: a 20-second "what ABC is and what to write" primer *above* the form for first-timers (the explainer sits at the bottom); a "share with your BCBA" step after export. Change: fix F-04, F-05, F-10; move a 3-line primer up; add "What to do next" after the first save. Outcome: the tracker becomes the thing people return for, and its exports stay credible with BCBAs.

**/about.** Works: the founder note is sincere and specific; "What this is not" is exactly right. Doesn't: no photo, no credential proof, stale "first year," no contact. Change: photo, "RBT since 2023," BACB link, email. Outcome: trust page actually earns trust.

**/privacy.** Works: plain language, accurate about localStorage and trackers. Doesn't: F-08. Change: date, contact, export pipeline, remove shop section until live.

**/crisis.** Works: correct numbers, tel/sms links, calm layout, "no one monitors messages here." Change: link the two websites. Keep otherwise.

**/cart, /thanks, 404.** Fine as-is once products exist. The 404 copy is a small delight — keep it.

---

## E. End-to-End User Journey Results

| Scenario | What happened | Friction | Outcome |
|---|---|---|---|
| **A. Newly diagnosed, doesn't know what's next** | Lands on hero → taps "Make a Plan" → drawer shows 4 coming-soon cards (Next Steps Roadmap first) → "Learn more" jumps to /shelf anchor → same card, "Tell me first" email box. | 4 taps to discover nothing exists. The one product that answers this question (*The Waitlist Playbook*, free) is invisible. | **Fails.** Leaves with an optional email signup. |
| **B. Challenging behavior, wants to document it** | Hero → "ABC" in header (phone) or ABC Tracker card → form → saves in ~60 s. | Two behaviors → two entries (F-04). Explainer is below the fold. | **Succeeds.** Best journey on the site. |
| **C. Already in ABA, wants to share with BCBA** | /abc → log → Download PDF → clean 2-page summary with counts. | Doesn't know whether to email the PDF, print it, or use "Email me my export"; no guidance after export; duplicate counting could embarrass them. | **Succeeds** with caveats. |
| **D. Wants visual schedules / routines** | "Everyday Life" shelf → 4 coming-soon cards. | Dead end. | **Fails.** |
| **E. Busy parent on a phone, 2 minutes** | Hero readable; "Find my shelf" → shelf; taps a book → has to scroll to see the drawer; nav lacks About/Shelves. | Drawer below fold; search useless; header gaps. | **Partial.** Finds the tracker if they tap "ABC". |
| **F. First-timer deciding whether to trust it** | Reads "Made by an RBT," founder note, scope disclaimers, privacy page. | No photo, no credential proof, no reviewer, "not reviewed by a lawyer," no way to contact a human. | **Partial.** Tone earns trust; absence of proof and contact loses it. |

**Does the four-shelf system help?** Yes as a mental model (parents think in "get organized / plan / everyday / home"), and it will scale. Today it is a burden because it adds a layer of navigation over mostly-empty shelves, and the two pages that present it disagree. Fix F-07 and F-12 and the model earns its keep.

---

## F. Technical and Security Findings

**Confirmed**
- Tracker data never leaves the device on save/edit/delete: zero network requests during the whole flow; single localStorage key `support-shelf-abc-v1` (~2.7 KB for 2 entries; comfortably within limits for years of use).
- CSV escaping correct (doubled quotes, quoted fields with commas/semicolons, UTF-8, CRLF). PDF content faithful except unsupported glyphs.
- Security headers present (HSTS 2 years, XFO DENY, nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy camera/mic/geo off). No CSP (F-14).
- No script-readable cookies on any visited page (privacy page's "one cookie" only applies once a cart exists — consistent).
- No analytics or third-party scripts — matches the privacy page.
- Server actions used for email capture with a honeypot (`website`) and `source` field.
- Hydration error on `/abc` (F-10). One unidentified 404 on load (F-26).
- `robots.txt` correctly disallows `/cart`, `/thanks`, `/api`.
- Fonts: Fraunces, Figtree, Caveat self-hosted as woff2; PDF fonts (Inter ×2, Fraunces TTF) fetched only when exporting — good.

**Unverified (needs repo or staging)**
- Email-export endpoint: validation, size limits, rate limiting, whether entries are logged in transit, Resend configuration, and that the PDF is generated server-side identically to the client version.
- Waitlist action: rate limiting, duplicate handling, confirmation email, unsubscribe wiring.
- Dependency vulnerabilities, TypeScript strictness, tests, error boundaries, bundle composition.
- `prefers-reduced-motion` handling for the shelf keyframes and `scroll-behavior: smooth`.
- Core Web Vitals.

**Compliance flags (not legal conclusions)**
- Pre-checked consent (F-05) is the one item most likely to be an actual legal problem (GDPR/ePrivacy if any EU parent uses the site; CAN-SPAM in spirit).
- HIPAA: the site is not a covered entity and does not store PHI server-side, so HIPAA likely does not apply as operated today; the email-export path is the one place child data touches your infrastructure — document it precisely (F-08). Get a real review before adding any server-side storage.
- COPPA: no child-directed collection observed; nickname-only design is the right call.

---

## G. The 10 Most Important Improvements (ranked)

1. **Put the four real products on the site** (F-01). Nothing else matters until a parent can get the Waitlist Playbook and Home ABC Printable.
2. **Fix production metadata** — site URL env var, sitemap, og:image (F-02). 30 minutes; affects every share and every crawl.
3. **Add a contact method** and fix the privacy/thanks copy that references it (F-03, F-08).
4. **Stop splitting one observation into N entries** (F-04). This is the credibility of the tracker with BCBAs.
5. **Uncheck and label the newsletter box** (F-05).
6. **Make the mobile header complete** (F-06).
7. **One source of truth for shelves** — same tool placement and descriptions on `/` and `/shelf` (F-07).
8. **Thin the coming-soon wall** to 2–3 real-pipeline items per shelf and remove dead "Learn more" links (F-12).
9. **Founder proof**: photo, RBT-since-2023 + BACB link, named BCBA reviewer when you have one (F-13).
10. **Shelf animation + drawer scroll on mobile** (F-09, F-15) — the one visual thing that currently reads as broken.

---

## H. Implementation Roadmap

**Phase 1 — Immediate (before any promotion; ~1–2 days)**  
F-02 metadata → F-03 contact → F-05 consent → F-08 privacy copy → F-06 mobile nav → F-07 shelf consistency → F-10 hydration → F-13 founder facts → F-12 coming-soon cap. All S effort, no dependencies, each independently shippable. Impact: trust, crawlability, legal exposure.

**Phase 2 — Experience (~3–5 days)**  
F-01 catalog (L; depends on Storefront API token + product-page design) → F-04 observation model (M; migrate existing localStorage v1 → v2 with a one-time converter) → F-09/F-15 shelf motion and scroll → F-17/F-18/F-21/F-22 tracker polish → F-11 search (hide or wire). Impact: first real conversions; tracker credible with clinicians.

**Phase 3 — Maturity (ongoing)**  
F-14 CSP → F-16 multi-child → F-24 canonical/JSON-LD → F-19 form feedback → Lighthouse pass and CWV budget → 3–5 search-intent pages that answer real caregiver questions ("What is ABC data and what should I write down?", "What happens after an autism diagnosis in Texas?", "How to read an ABA treatment plan") each tied to a product → named BCBA review on every clinical artifact → testimonial/quote collection from the first 10 downloads. Impact: organic discovery, retention, recurring revenue base.

---

## I. What Should NOT Change

- The **voice**: "Observe, don't diagnose", "Your BCBA writes the plan", "Nothing was lost" (404), "The rest can wait until it can't." This is the brand. Protect it from any copywriter who wants to add urgency.
- The **scope discipline** on every clinical surface — function picker labelled reflection, exports with "no interpretation," crisis link next to the data. This is exactly right for an RBT-run site.
- The **shelf metaphor and the four categories**. Keep them; fix the consistency.
- The **visual system**: dark botanical palette, Fraunces display + Figtree body, handwritten Caveat accents, the physical binder rendering. Do not go to Three.js; the CSS version is already distinctive and loads instantly.
- The **privacy architecture** of the tracker (localStorage, nickname-only, delete-everything with export nudge). Add to it, don't rework it.
- **Accessibility baseline** — zero axe violations, real tabs/dialog semantics, tel:/sms: links, skip link. Keep running axe on every PR.
- **Honest free/paid framing** ("free means free"; per-shelf "Nothing else" email promise).
- The **PDF export layout** — clean, clinician-readable, counts separated from entries.

---

## J. Final Verdict

1. **Ready for real parents?** The ABC Tracker is. The site as a whole is not — a parent who comes for anything other than the tracker finds nothing to take.
2. **Would a first-timer understand the purpose?** Yes, within five seconds. The hero and trust strip do their job.
3. **Can parents find and use what they need?** Only the tracker. The four finished products are invisible, and 15 of 16 tools are coming soon.
4. **Is the ABC Tracker reliable and useful?** Reliable — every flow verified, data stays local, exports are faithful. Useful — yes for parents; for BCBAs only after the duplicate-entry counting is fixed.
5. **Does it feel trustworthy and professional?** It looks and reads professional. It falls short on proof: no face, no credential link, no reviewer, no contact, a privacy page that says it hasn't been reviewed.
6. **What would stop someone returning?** Nothing new to come back for, and no reason given to come back (no "log again tomorrow" nudge, no weekly export reminder, no new-download notice except an opt-in they didn't notice).
7. **Fix before promoting:** F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08 — in that order. Everything else can ship after the first parents arrive.
8. **What would make it exceptional:** a tracker that ends each session with "here's what to bring to your next BCBA meeting" and a one-tap share; product pages that show a real spread of each printable; a named BCBA reviewer on every tool; a founder page with a face and a story a parent recognizes; and three or four plain-language guides that answer the questions parents type into Google at 11 pm — each one pointing to the tool that helps.
