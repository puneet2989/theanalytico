# Spec 10a — Phase 6 work breakdown (revised 15 Aug 2026)

Replaces section 10 of `docs/specs/10-work-breakdown.md`. Where the two disagree, this file wins. Sections 1–9 and 11–16 of spec 10 are unchanged and still apply.

## 1. What changed since spec 10 was written

| Spec 10 said | Reality now |
|---|---|
| `css-stylist` writes `assets/css/pages.css` | **No `pages.css` exists** and `index.html` links only `tokens.css`, `base.css`, `components.css`. Creating a fourth stylesheet means either an extra request on every page or a chrome mismatch with `index.html`. All Phase 6 CSS goes into `components.css` instead. |
| `html-builder` H2 captures six work screenshots | No headless browser is installed and none is being installed in this pass. `work.html` reuses the three existing `*-card.webp` files. No image work in Phase 6. |
| Phase 6 might need motion work | It does not. Every effect the five pages use already ships. **`motion-engineer` has no Phase 6 task.** |
| Insights page carries six posts | Three posts, matching the three that exist on the home page and the three images in the repo. See spec 05 section 2. |
| Contact page needs `functions/api/contact.js` | It already exists and is complete. Out of scope. |

## 2. Phase 6a–6e — page markup (five agents, fully parallel)

Agent: `html-builder`. Model: Haiku 4.5.

| Agent | Owns exactly this file | Spec |
|---|---|---|
| H1 | `services.html` | `docs/specs/03-services.md` |
| H2 | `work.html` | `docs/specs/04-work.md` |
| H3 | `insights.html` | `docs/specs/05-insights.md` |
| H4 | `about.html` | `docs/specs/06-about.md` |
| H5 | `contact.html` | `docs/specs/07-contact.md` |

Disjoint file sets. No worktree isolation needed. All five may run at once.

Every agent must first read `docs/specs/08-motion-modules.md` sections 2, 4 and 6, then its own page spec.

Constraints for all five, repeated because Haiku will otherwise drift:

1. Create one `.html` file. Create or edit nothing else.
2. Do not write any `.css` file.
3. Do not write or edit any `.js` file, including anything under `assets/js/modules/`.
4. Do not edit `index.html`.
5. Do not edit another agent's page file.
6. Do not edit `_headers`, `_redirects`, `wrangler.toml`, `robots.txt`, `sitemap.xml`, `worker.js`, or `PLACEHOLDER-CONTENT.md`.
7. Do not add, capture, resize, or generate any image or video asset.
8. Copy the header, drawer, footer, skip link, flowmap div, `<head>` boilerplate and script tags from `index.html` rather than retyping them from the spec. Line ranges are listed in each page spec.
9. Do not invent a component class for a pattern already in `components.css`.
10. Report every class name used that does not yet exist in `components.css`.

Shared-chrome drift is the single most common Phase 6 defect. `design-reviewer` diffs the header and footer blocks of all six pages byte for byte.

## 3. Phase 6f — page styles (one agent, blocking, after 6a–6e)

Agent: `css-stylist`. Model: Sonnet 5. **One agent, not five.** `components.css` is a single file and concurrent writers would collide.

Owns and writes: `assets/css/components.css` only. Does not create `pages.css`. Does not touch `tokens.css` unless a genuinely new token is needed, in which case it is added to `tokens.css` and named in the summary.

New class inventory to build, grouped by first use:

| Class | First used by | Note |
|---|---|---|
| `.page__title` | all five | inner-page `h1`; `--fs-h1`, `--fw-medium`, `--lh-heading`, `--ls-heading`, `--ink-black` |
| `.page__lead` | all five | `--fs-lead`, `--ink-soft`, `max-width: var(--container-text)` |
| `.pillar__list` | services, work, about | card grid: 1 col, 2 at 640, 3 at 1024, `gap: var(--gap-grid)` |
| `.faq__list` | services, contact | `<dl>`; `dt` `--fs-h4` `--fw-medium` `--ink-black`; `dd` `--fs-body` `--ink-soft` |
| `.facts__list` | work | `<dl>` label/value rows; `dt` `--fs-micro` `--ls-caps` `--ink-soft` |
| `.topics__list` | insights | wrapping pill chips, `--radius-pill`, `gap: var(--s-3)` |
| `.contact__address`, `.contact__phone` | about, contact | `font-style: normal`; phone at `--fs-h3` |
| `.enquiry__form`, `.enquiry__details` | contact | 7/5 split at 1024, single column below |
| `.form`, `.form__set`, `.form__submit`, `.form__status` | contact | **no form styles exist in `components.css` today** |
| `.field`, `.field--check`, `.field__label`, `.field__optional`, `.field__input`, `.field__input--area`, `.field__check`, `.field__hint`, `.field__error` | contact | token values in spec 07 section 8.4 |

Rules:

1. Error text uses `--accent-strong`, never `--accent`. `--accent` on `--surface` fails 4.5:1.
2. No raw hex, no raw px font size, no magic number outside `tokens.css`.
3. Mobile-first, `min-width` queries only, breakpoints 640 / 768 / 1024 / 1280.
4. Do not restyle anything `index.html` already uses. Any change to `.card`, `.btn`, `.section`, `.header`, `.footer`, `.services__grid`, `.work__grid`, `.insights__grid`, `.kpi__list`, `.process__list` or `.carousel` risks regressing the approved home page and must be reported as a deliberate decision, not slipped in.
5. Nothing may set an initial `opacity: 0` or a transform that hides content. Reveal start states are set from JS only.

## 4. Phase 6g — motion

**None.** No JavaScript file is created or edited in Phase 6. If any page spec's "New hooks required" line ever says something other than "none", that page stops and the architect reviews before `motion-engineer` is engaged. Today all five say none.

## 5. Sequencing

```
6a  6b  6c  6d  6e     five html-builder agents, concurrent
        |
        v
6f                     one css-stylist agent, blocking
        |
        v
7                      seo-auditor, single agent, edits all six heads
        |
        v
8                      design-reviewer, sign-off
```

Blocking: 6f cannot start until all five pages exist, because it styles classes it must be able to see in use.
Parallel: 6a–6e only.
No phase in this group needs worktree isolation; no two concurrent agents share a file.

## 6. What Phase 7 inherits, not Phase 6

`seo-auditor` handles these across all six pages in one pass. Phase 6 agents must not attempt them:

1. Adding `sitemap.xml` entries for the five new URLs.
2. Giving the business JSON-LD node a shared `@id` and referencing it from the five inner pages.
3. Reconciling `robots.txt`, `X-Robots-Tag` and the absence of `<meta name="robots">` with whatever indexing decision the client confirms.
4. Deciding whether `og:image` needs a per-page variant.
5. Lighthouse runs on all six pages.

## 7. Definition of done for Phase 6

1. Five new `.html` files exist at the repository root.
2. Every page passes its own spec's numbered acceptance criteria.
3. The header block on all six pages is byte-identical except for the placement of `aria-current="page"`.
4. The footer block on all six pages is byte-identical.
5. `grep -c 'data-flowmap' *.html` returns exactly 1 for each of the six files.
6. No `.js` file changed, verified with `git diff --name-only`.
7. Every new class name used in markup has a rule in `components.css` after 6f.
8. Every fabricated fact on the five new pages is marked per CLAUDE.md and has a row in `PLACEHOLDER-CONTENT.md` (the architect adds the rows; the agents report them).
