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
