# Free parent hub — build log

Brief: "THE SUPPORT SHELF — FREE PARENT HUB BUILD". One section per stage: what shipped, files, verification, and every content slot still pending.

## Decisions

- **Long-form content is plain Markdown** in `content/` (pages now, lessons in `content/learn/` from Stage 4). Front matter is a simple `key: value` block with `- ` lists, read by `src/lib/content/frontmatter.ts`; no YAML library. How to write it: `content/README.md`.
- **Short items are JSON:** `content/glossary.json`, `content/resources.json`, `content/ui.json`.
- **Markdown renderer: not chosen yet.** None is a dependency. Options measured on 2026-10-31: `marked` 18.1.2 (14.5 KB gzipped, no dependencies, MIT), `snarkdown` 2.0.0 (1.0 KB, MIT, limited syntax), or a small renderer in the repo (~1 KB, no dependency). Pages render on the server, so none of these ships to the browser. Until you pick one, `src/components/hub/SectionText.tsx` shows paragraphs only; every hub page is still pending, so this is preview-only.
- **Visibility:** `isVisible()` in `src/lib/content/pages.ts` is the single rule. Published pages show everywhere. Pending and draft pages show on local and preview builds with a banner and return 404 on the production deployment (`VERCEL_ENV=production`), and they stay out of the sitemap, header, footer and Start here strip.

## Stage 1 — Content system, guardrails, navigation

| Item | What shipped | Files | Verified |
| --- | --- | --- | --- |
| Content layer | Markdown pages with front matter (`title`, `description`, `status`, `reviewedBy`, `lastReviewed`, `related`, `sources`); `## ` headings are slots; `<!-- WRITE: … -->` notes describe each slot; `isPublished` / `isVisible` / `hubSections` | `content/pages/*.md`, `content/README.md`, `src/lib/content/{frontmatter,pages,data}.ts` | Unit tests for parsing, lists, sources, section splitting, bad status |
| Scope check | `scripts/scope-check.mjs` (+ `scope-rules.mjs`) scans `content/`, `src/content/`, `src/lib/{resources,shelves,observation}.ts`; runs as `prebuild`; `npm run scope-check` also runs a self-test. Escape: `<!-- scope-ok: reason -->` (or `// scope-ok:` in code) on the line above, reason ≥ 10 characters; JSON objects use `"scopeOk": "reason"`. Also warns on resources never verified, older than six months, or still `TODO_VERIFY`. | `scripts/scope-check.mjs`, `scripts/scope-rules.mjs`, `package.json` | Self-test catches six bad strings and allows four good ones; unit tests; three existing lines marked as intentional ("after a diagnosis" ×2 in `src/content/shelf-drawer.ts`, the "Not a diagnosis" disclaimer comment in `src/lib/observation.ts`) |
| Resources | `content/resources.json` seeded with the five `/crisis` lines (unchanged wording, `lastVerified: null` because they have not been re-checked) and five `TODO_VERIFY` Find care placeholders. `/crisis` now renders from this file and shows "Outside resource. We're not affiliated." under each line. | `content/resources.json`, `src/app/crisis/page.tsx` | `/crisis` renders five lines in preview and production builds |
| Glossary | `content/glossary.json`: the 39 terms from the brief, categories assigned, `full`/`short`/`long` empty, all `pending` | `content/glossary.json` | — |
| Navigation | Header: calm "Right now" pill (sage, never red), then Learn, Find care, For you, Shelves, ABC tracker inline from 1024px; below that a Menu button (aria-expanded, Esc and outside tap close and return focus, closes on navigation) holding everything plus About. Footer adds visible hub sections. Only visible sections appear. | `src/components/site/{SiteHeader,MobileMenu,SiteFooter}.tsx`, `content/ui.json` | 375 / 768 / 1440: no overflow, menu opens and Esc returns focus |
| Start here | Strip under the hero with the four doors, each only when visible; hidden entirely when none is | `src/components/home/StartHere.tsx`, `src/app/page.tsx` | Shown in preview; absent in a production build |
| Section pages | `/right-now`, `/for-you`, `/learn`, `/find-care` from Markdown, with the pending banner | `src/app/{right-now,for-you,learn,find-care}/page.tsx`, `src/components/hub/*` | Preview: 200 with banner. Production build: 404, not in sitemap, nav or strip |
| Test fix | `pages.mjs`, `abc.mjs` and `route-shots.mjs` compared `scrollWidth` with `innerWidth`, which mobile emulation stretches to fit overflowing content, so 375px overflow went unseen. They now compare with the configured width. This caught a 19px header overflow at 375px, fixed in the same stage. | `tests/e2e/pages.mjs`, `tests/e2e/abc.mjs`, `scripts/route-shots.mjs` | — |

Gate: build (scope check first), typecheck, lint · unit 46/46 · pages pass (14 routes × 2 widths) · axe 0 on 14 routes · `/abc` journey 8/8 · production-mode build checked as above.

## Pending content slots (Stage 1)

| File | Slot | Needed |
| --- | --- | --- |
| `content/pages/right-now.md` | Is anyone in danger? / For the next 5 minutes / Tantrum or meltdown? / Then, for you / Afterwards | Your words for each; notes in the file |
| `content/pages/for-you.md` | It's okay to feel this / If you're about to lose it / Who you can talk to | Your words; the helpline list comes from `resources.json` |
| `content/pages/learn.md` | Start here | Two or three sentences |
| `content/pages/find-care.md` | Start here | Two or three sentences |
| `content/glossary.json` | All 39 terms | `full`, `short`, optional `long`, then `status: published` |
| `content/resources.json` | 5 crisis lines | `lastVerified` date once checked |
| `content/resources.json` | 5 Find care entries | Every `TODO_VERIFY` field |

## Stage 2 — Right now, For you, calming tools, offline

| Item | What shipped | Files | Verified |
| --- | --- | --- | --- |
| `/right-now` | One column, large type, no product mentions. "Is anyone in danger?" with two large answers: **Yes** shows Call 911 and All crisis lines; **No, we're safe** reveals For the next 5 minutes, Tantrum or meltdown? (links the full lesson once it exists), Then, for you (both tools), Afterwards (ABC tracker). Answers start hidden so nothing shifts on load; with JavaScript off a `<noscript>` style shows everything. | `src/app/right-now/page.tsx`, `src/components/hub/RightNowSafety.tsx` | Yes/No paths; no-JS shows all; 0 product links in the page body; Lighthouse mobile 94–96, CLS 0 |
| `/for-you` | It's okay to feel this · If you're about to lose it (both tools embedded) · Who you can talk to (rendered from `resources.json`: parent-support entries plus the crisis lines except 911, each with "not affiliated") · link to the research page once it exists | `src/app/for-you/page.tsx` | axe 0 |
| Box breathing `/for-you/breathe` | A dot travels the square, one side per phase (in, hold, out, hold); 4 s default, 3–6 s slider; Start/Stop; rounds; optional vibration (off by default, shown only where supported); phase announced politely. Motion is a `transform` on the dot. Reduced motion: dot stays still and a large countdown carries the timing. | `src/components/tools/BoxBreathing.tsx` | Keyboard-only start/stop; phase changes announced; reduced-motion path; Lighthouse 92 |
| Grounding `/for-you/ground` | 5-4-3-2-1, one step per screen, optional tap-to-count dots, focus moves to each step heading, Back/Next, Done with Start again; step fades in (opacity/transform), instant under reduced motion | `src/components/tools/Grounding.tsx` | Keyboard-only through all five steps with focus on each heading; Lighthouse 94 |
| Do it together | Toggle on both tools: bigger visuals, simpler words | `src/components/tools/ToolFrame.tsx`, `content/ui.json` | — |
| Offline | `public/sw.js` precaches `/right-now`, `/for-you`, both tools and `/crisis`, plus the static files those pages reference; network-first for those five pages, cache-first only for those hashed assets; nothing else is touched. Registered on every page in production builds; `sw.js` served `no-cache`. No CSP change needed (`worker-src` falls back to `script-src 'self'`). Pages that 404 (pending, on production) are never cached. | `public/sw.js`, `src/components/site/OfflineRegister.tsx`, `src/app/layout.tsx`, `next.config.ts` | After one visit to `/`, offline: all five pages load and box breathing runs; an uncached page (`/shelf`) fails as intended |

Tool pages are complete (interface wording only, no pending content), so they are live on production at their URLs; nothing links to them there until For you or Right now is published, and they join the sitemap when For you is published.

Gate: build (scope check first), typecheck, lint · unit 46/46 · pages pass (16 routes × 2 widths) · axe 0 on 16 routes with the tools running · `/abc` journey 8/8.

## Pending content slots (Stage 2)

No new slots: Right now and For you use the sections listed under Stage 1. Interface wording for the tools is in `content/ui.json` → `tools` and `rightNow`; edit freely.

## Stage 3 — The 15-second ABC tracker and "What you're noticing"

| Item | What shipped | Files | Verified |
| --- | --- | --- | --- |
| Quick log | One screen, three chip questions in order (What did they do? → What happened right before? → What happened right after?), each with "+ my own words". Time defaults to now with a one-tap change. Save is in a bar pinned to the bottom of the screen. | `src/components/abc/QuickLog.tsx` | At 375×667: three taps, then Save fully on screen without scrolling (y 604–655) |
| Early signs | Optional "Did you notice anything before it got big?" chips plus own words, stored as optional `earlySigns` on the v2 observation (no new storage version, no migration) | `QuickLog.tsx`, `src/lib/abc/types.ts`, `content/tracker.json` | Stored and exported (CSV `early_signs`, PDF note column) |
| Add detail | Intensity, duration (ranges + exact minutes) and "What it looked like" behind "+ Add detail" | `QuickLog.tsx` | Journey |
| Nickname | Asked only at first export; logging seeds the behavior labels without one | `ExportPanel.tsx`, `src/lib/abc/store.ts` (`ensureBehaviors`) | Journey: `child` is null after logging; set at first export |
| Reflection picker | Removed from logging. `functionCode` stays readable: older entries still render and export | `QuickLog.tsx`, `src/lib/export/report.ts` | A seeded v2 entry with `functionCode: "attention"` lists and exports "Attention" |
| Describe, don't label | One-line inline prompt when Tantrum, Refusing or Property destruction is picked | `content/tracker.json → labelNudge` | Shows on preview as a pending marker |
| Safety card | After saving a moment with Self-injury, Hitting, Biting or Running off: the crisis link and "Talk to your child's doctor or BCBA." always; title and body once published | `QuickLog.tsx → SafetyCard`, `content/tracker.json → safetyCard` | Journey (Hitting) |
| After each save | One rotating "Did you know" line (when published); the existing one-time "What happens next" card, now read from content | `Tracker.tsx`, `content/tracker.json` | Journey |
| Walkthrough | Dismissible first-visit card (shoes example) once written | `Tracker.tsx`, `content/tracker.json → walkthrough` | Preview shows the pending marker |
| What you're noticing | Default view at five or more observations (List stays a tab; Time of day and Right before tabs folded into the cards). Template-only cards with counts: most common right before, right after, time-of-day window, most common early sign, moments with an early sign. Then the general lesson link (when it exists) and "Questions you could bring…" (draft wording from the brief's example, preview-only until published). Under five: "Log a few more moments and patterns will show up here." | `src/lib/abc/patterns.ts`, `src/components/abc/Insights.tsx` | Eight hand-worked fixture observations: 5, 4, 4, 3 and 4 of 8, matching in a unit test and in the browser |
| Client-side pending | `next.config` inlines the deployment environment so client components hide pending items on production too | `next.config.ts`, `src/lib/content/deploy.ts` | — |

Gate: build (scope check: 12 files clean, including all templates), typecheck, lint · unit 51/51 · `/abc` journey 8/8 (rewritten for the new form) · axe 0 on `/abc` with an observation saved and the edit sheet open · pages pass.

## Pending content slots (Stage 3) — all in `content/tracker.json`

| Key | Needed |
| --- | --- |
| `earlySigns` | Finalize the chip list (seeded with the brief's examples), then publish |
| `labelNudge.text` | One line inviting a description when a label-type behavior is picked |
| `safetyCard.title`, `safetyCard.body` | Calm safety wording; links already show |
| `didYouKnow.lines` | A handful of short general facts |
| `walkthrough.title`, `walkthrough.steps` | Three or four steps using the shoes example |
| `questionsToBring` | Review the draft templates, then publish |

## Stage 4 — Learn: glossary everywhere, Decode my paperwork, core lessons

| Item | What shipped | Files | Verified |
| --- | --- | --- | --- |
| Lessons | Six pending Markdown lessons with slots: What ABA is, and what it isn't (What ABA is · What it isn't · What autistic adults have said · What good modern ABA looks like · Questions to ask a provider), Tantrum or meltdown?, Warning signs before it gets big, Why behavior happens (in general), Transitions, Your child's team. Each page: one H1, sections, sources from front matter, "Last reviewed" / "Reviewed by" line, related lessons, and one soft next step from a `nextStep: /path \| Label` line. | `content/learn/*.md`, `src/app/learn/[slug]/page.tsx` | axe 0 |
| `/learn` | Introduction, the visible lessons, and the two look-up tools (shown once any glossary term is visible) | `src/app/learn/page.tsx` | — |
| `/learn/glossary` | Grouped by category, A–Z jump, search as you type in the browser, an anchor per term (`#bcba`), `DefinedTermSet` JSON-LD for published terms with a definition. Production shows only published terms and the page 404s until at least one exists. | `src/app/learn/glossary/page.tsx`, `src/components/hub/GlossaryList.tsx`, `content/pages/glossary.md` | Search "prior" → prior authorization; letter jump to `#bacb` |
| `<Term>` everywhere | The first occurrence on a page of each visible glossary term or alias in lesson text becomes a button with a definition popover (Enter or tap opens; Esc or a tap elsewhere closes and returns focus). Never in headings, links, buttons or the tracker. | `src/components/hub/Term.tsx`, `src/components/hub/SectionText.tsx`, `src/lib/content/terms.ts` | With temporary lesson text (since removed): BCBA, RBT, IEP wrapped once each; none in headings; keyboard and touch; axe 0 with a popover open |
| Matching | Acronyms case-sensitive, words case-insensitive, plurals, aliases, longest match first; unknown acronyms of 2–6 capitals, hyphen-joined parts kept together (VB-MAPP) | `src/lib/content/terms.ts` | Unit tests: ten known terms with aliases and plurals in reading order; unknowns listed once |
| `/learn/decode` | Paste text; every term highlighted and listed in reading order with its definition; unknown acronyms listed with a "Suggest it" email (subject only, no pasted text). Runs entirely in the browser: no request on input (glossary links have prefetch off), nothing saved, not even localStorage. Soft next step: Read Your Child's Treatment Plan. Hidden on production until a term is published. | `src/app/learn/decode/page.tsx`, `src/components/hub/Decode.tsx` | Paragraph with eleven known terms and two unknown acronyms: all highlighted, 0 requests during input, 0 localStorage keys; Lighthouse 92 |

Gate: build (scope check: 19 files clean), typecheck, lint · unit 54/54 · pages pass (21 routes) · axe 0 on 21 routes with Decode filled and glossary searched · `/abc` journey 8/8.

## Pending content slots (Stage 4)

| File | Needed |
| --- | --- |
| `content/learn/what-aba-is-and-isnt.md` | All five sections, in your words, with sources |
| `content/learn/tantrum-or-meltdown.md` | The short version · How they usually differ · What to write down |
| `content/learn/warning-signs.md` | What parents often notice · Writing them down |
| `content/learn/why-behavior-happens.md` | The four common reasons (general only) · Why only your child's team can say |
| `content/learn/transitions.md` | Why transitions are hard · What families often find helps (general only) |
| `content/learn/your-childs-team.md` | The people you may meet · Who to ask about what |
| `content/pages/glossary.md` | One or two introductory sentences |
| `content/glossary.json` | Definitions (see Stage 1); add aliases such as expansions so they link too |

## Stage 5 — Find care guide and the research page

| Item | What shipped | Files | Verified |
| --- | --- | --- | --- |
| `/find-care` | Three questions (age: under 3 / 3–5 / 6+; coverage: Medicaid or CHIP / private / none or not sure; state: Texas / another state). The result card is assembled from `content/find-care/blocks.md` (where to search for the situation, Outside Texas when relevant, questions to ask, a short call script, red flags, what a waitlist involves → Waitlist Playbook) and the matching `find-care` entries in `resources.json`. Answers live only in the address: read on the server, written with `history.replaceState`. No storage, no geolocation, no provider named or ranked. `TODO_VERIFY` resources show a dashed "Needs verifying" box on preview and are hidden on production. | `src/app/find-care/page.tsx`, `src/components/hub/FindCare.tsx`, `src/lib/content/findCare.ts`, `content/find-care/blocks.md` | All 18 combinations snapshot-tested (each card has at least six blocks, always "Questions to ask a provider" and the BACB registry; Texas-only entries never appear for another state). 0 requests while answering; geolocation never called; 0 storage keys; reload restores the answers from the address; Lighthouse 92–94, CLS 0 |
| `/for-you/research` | Finding sections (heading = the finding, paragraph, "What this means for you" line) and the sources list from front matter; linked from For you once visible | `src/app/for-you/research/page.tsx`, `content/pages/for-you-research.md` | axe 0 |

Production-mode build (`VERCEL_ENV=production`): `/right-now`, `/for-you`, `/learn`, `/find-care`, `/for-you/research`, `/learn/glossary`, `/learn/decode` and every lesson return 404; the sitemap lists none of them; `/abc` shows no pending markers; `/for-you/breathe`, `/for-you/ground`, `/abc` and `/crisis` return 200.

Gate: build (scope check: 21 files clean), typecheck, lint · unit 56/56 · pages pass · axe 0 on 24 routes · `/abc` journey 8/8.

## Pending content slots (Stage 5)

| File | Needed |
| --- | --- |
| `content/find-care/blocks.md` | All ten sections; then set `status: published` |
| `content/resources.json` | The five `find-care` entries: every `TODO_VERIFY` field, then a `lastVerified` date |
| `content/pages/for-you-research.md` | Each finding, its "What this means for you" line, and every citation in `sources` |

## Stage 6 — Launch-checklist pass and handoff

| Check | Result |
| --- | --- |
| Message | Every new page opens with an H1 and a one-line description saying what it is and who it's for; one primary action per page (Right now: the safety answer; tools: Start / Next; Decode: the box; Find care: the questions; lessons: the soft next step). The Right now pill is in the header and the contact mailbox in the footer on every page, once Right now is published. |
| Mobile | `scripts/route-shots.mjs` → `tests/e2e/shots/launch/{375,768}-*.png` for 21 routes: no horizontal overflow, no tappable element under 44px (the lesson breadcrumb was enlarged in this stage). |
| Speed (Lighthouse mobile, local production build) | `/right-now` 92 · `/for-you/breathe` 95 · `/abc` 90 · `/learn/decode` 94 · `/find-care` 94 performance; 100 accessibility and best practices on all five. SEO reads 66 on `/right-now` and `/find-care` only because pending pages are deliberately `noindex`; it returns to 100 when they are published. |
| Credibility | Published lessons render sources and "Last reviewed" from front matter; grep for lorem / placeholder / localhost finds nothing user-facing; `TODO_VERIFY` exists only in `content/resources.json` and is hidden on production; pending markers (`[pending: …]`) render only on preview; scope check clean (21 files). |
| Search | Titles and descriptions come from each file's front matter in parents' words ("Tantrum or meltdown?", "What does BCBA mean? …"); one H1 per page (`tests/e2e/pages.mjs`); canonical from the root layout; the sitemap lists only published hub pages (verified empty in a production-mode build). |
| Plumbing | `scripts/link-check.mjs`: all 27 internal links resolve (externals can't be fetched from this environment: 988lifeline.org, childhelphotline.org, bacb.com). Offline: after one visit, `/right-now`, `/for-you`, both tools and `/crisis` load with no network and box breathing runs; uncached pages fail as intended. 404 page unchanged. |

## Suggested writing order

1. `content/pages/right-now.md` — all five sections.
2. `content/tracker.json → safetyCard` — title and body.
3. `content/glossary.json` — definitions (start with BCBA, RBT, ABA, IEP, FBA, BIP, prior authorization, treatment plan), plus aliases such as expansions.
4. `content/learn/tantrum-or-meltdown.md`.
5. `content/learn/what-aba-is-and-isnt.md`.
6. `content/find-care/blocks.md` and the `find-care` entries in `content/resources.json`.
7. `content/pages/for-you-research.md`.

Then, in any order: `content/pages/for-you.md`, `learn.md`, `find-care.md`, `glossary.md`, the other four lessons, and the rest of `content/tracker.json` (early signs, label nudge, Did you know, walkthrough, questions to bring). Set `status: published` on each file when it's ready; nothing else needs to change.

## Launch content (written by Claude at the owner's request)

All hub content was written in one pass and set to `published` so the hub is live; the owner reviews and rewrites anything that reads wrong.

- Every page, lesson, Find care block, glossary term (39) and tracker item is filled; the scope check passes with no `scope-ok` escapes.
- Sources: every lesson and the research page cite organization pages or DOIs. Links were confirmed through search; none could be opened from the build environment.
- Resources: the 5 crisis lines and 5 Find care entries have `lastVerified: 2026-10-31`, meaning checked against each organization's official site that day, not by calling.
- `reviewedBy` and `lastReviewed` are left empty on purpose: no one has reviewed this content yet.
- Markdown renderer: a small in-repo renderer (`SectionText.tsx`) handles paragraphs, `-` and `1.` lists, bold, italic and links, with no new dependency. Output is React elements only; unknown link schemes are dropped.

Review first, in this order: Right now, the safety card, "What autistic adults have said" in What ABA is and isn't, the research page numbers, and the Texas facts in Find care.
