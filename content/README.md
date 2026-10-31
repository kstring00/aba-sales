# Writing content for The Support Shelf

Everything a parent reads on the hub lives in this folder. You never need to touch code.

## Long pages (Markdown)

Each page is one `.md` file in `content/pages/` (lessons will live in `content/learn/`). A file has two parts:

```
---
title: Right now
description: One sentence that shows in Google and link previews.
status: pending
reviewedBy:
lastReviewed:
related: for-you, learn
sources:
- Title of the source | https://example.org/page
- Another source | https://example.org/other
---

## Is anyone in danger?

Write the words here, in plain Markdown: **bold**, *italic*, lists with `-`, links like [this](https://example.org).
```

**The top part (between the `---` lines)**

| Line | What to put | Required |
| --- | --- | --- |
| `title:` | The page heading | yes |
| `description:` | One sentence for search results and link previews | yes |
| `status:` | `pending` (not written), `draft` (written, not ready), `published` (live) | yes |
| `reviewedBy:` | Name and credential of a reviewer, only once someone has actually reviewed it | no |
| `lastReviewed:` | A date like `2026-11-15` | no |
| `related:` | Other page names, separated by commas | no |
| `sources:` | One per line, starting with `- `, as `Title | https://link` | no |

**Only `published` pages appear on the live site.** `pending` and `draft` pages show on preview deployments with a "Content pending" banner so you can read them in place, and they 404 on the live site, stay out of the sitemap and stay out of the menus.

**Keep the `## ` headings exactly as they are.** Each heading is a slot the page is built around (for example, the "Is anyone in danger?" question on Right now has a Yes and a No path). Write under the heading. Lines like `<!-- WRITE: ... -->` describe what the slot needs; delete them once you've written it.

## Short items (JSON)

- `content/glossary.json` — terms, expansions and definitions. Fill `full`, `short` (one line) and optionally `long`; set `status` to `published` when a term is ready.
- `content/resources.json` — every outside phone line, agency and website. Each entry needs `lastVerified` (the date you last checked it works). The build warns about entries older than six months. Anything still marked `TODO_VERIFY` is hidden on the live site.
- `content/ui.json` — short interface labels (menu names, banners). You can edit these too.

## The scope check

Before every build, `scripts/scope-check.mjs` reads every file here and stops the build if it finds wording that tells a parent why their child does something or what intervention to use (for example "your child is seeking", "ignore the behavior", "extinction", "the function is", "cure", "guarantee"). If a match is intentional, for example on a page explaining what ABA *isn't*, put this on the line above it, with a real reason:

```
<!-- scope-ok: quoting a common myth in order to correct it -->
```

Run it yourself any time with `npm run scope-check`.
