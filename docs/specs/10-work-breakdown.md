# Spec 10 — Work breakdown

Phase-by-phase plan. Maps each spec to its implementing agent and model, marks blocking versus parallel, and declares file ownership so parallel agents never write the same file.

## 1. Ownership rule

The split is by file, not by feature. A file has exactly one owner per phase. Two agents never hold the same file in the same phase.

If an agent believes it needs to edit a file it does not own, it stops and reports. It does not edit the file.

## 2. Agent roster and models

| Agent | Model | Writes code |
|---|---|---|
| `site-architect` | Opus | No |
| `html-builder` | Haiku 4.5 | Yes |
| `css-stylist` | Sonnet 5 | Yes |
| `motion-engineer` | Sonnet 5 | Yes |
| `cf-deploy` | Haiku 4.5 | Yes |
| `seo-auditor` | Sonnet 5 | Yes |
| `design-reviewer` | Opus | No |

Model policy, from `AGENTS.md`: GSAP timelines stay on Sonnet. Haiku misplaces `scrub`, double-registers triggers, and conflicts with the Lenis RAF loop. Never assign a motion module to Haiku.

## 3. Phase table

| Phase | Agent | Model | Spec | Blocking or parallel | Depends on |
|---|---|---|---|---|---|
| 0 | `site-architect` | Opus | all | Blocking | nothing |
| 1 | `css-stylist` | Sonnet 5 | 00 | Blocking | Phase 0 |
| 2a | `html-builder` | Haiku 4.5 | 01, 02 | Parallel with 2b | Phase 1 |
| 2b | `cf-deploy` | Haiku 4.5 | 07 §9, 09 | Parallel with 2a | Phase 0 |
| 2c | `css-stylist` | Sonnet 5 | 01, 02 | Blocking after 2a | Phase 2a |
| 3 | `motion-engineer` × 14 | Sonnet 5 | 08 | Parallel, 14 agents | Phase 2c |
| 4 | `design-reviewer` | Opus | 02, 08 | Blocking gate | Phase 3 |
| 5 | `motion-engineer`, `css-stylist` | Sonnet 5 | defect list | Parallel by file | Phase 4 |
| 6a | `html-builder` | Haiku 4.5 | 03 | Parallel with 6b–6e | Phase 5 |
| 6b | `html-builder` | Haiku 4.5 | 04 | Parallel with 6a, 6c–6e | Phase 5 |
| 6c | `html-builder` | Haiku 4.5 | 05 | Parallel with 6a–6b, 6d–6e | Phase 5 |
| 6d | `html-builder` | Haiku 4.5 | 06 | Parallel with 6a–6c, 6e | Phase 5 |
| 6e | `html-builder` | Haiku 4.5 | 07 | Parallel with 6a–6d | Phase 5 |
| 6f | `css-stylist` | Sonnet 5 | 03–07 | Blocking after 6a–6e | Phase 6a–6e |
| 7 | `seo-auditor` | Sonnet 5 | 09 | Blocking | Phase 6f |
| 8 | `design-reviewer` | Opus | all | Blocking gate | Phase 7 |

Phase 4 is the hard gate. `index.html` is the reference implementation. No other page starts until it passes.

## 4. Phase 0 — Architecture

Agent: `site-architect`. Model: Opus. Blocking.

Owns and writes:
- `docs/specs/00-tokens-and-foundations.md`
- `docs/specs/01-logo-and-header.md`
- `docs/specs/02-home.md`
- `docs/specs/03-services.md`
- `docs/specs/04-work.md`
- `docs/specs/05-insights.md`
- `docs/specs/06-about.md`
- `docs/specs/07-contact.md`
- `docs/specs/08-motion-modules.md`
- `docs/specs/09-cloudflare-and-seo.md`
- `docs/specs/10-work-breakdown.md`
- `PLACEHOLDER-CONTENT.md`

Writes no `.html`, no `.css`, no `.js`.

Exit condition: all twelve files exist.

## 5. Phase 1 — Tokens and base

Agent: `css-stylist`. Model: Sonnet 5. Blocking. Everything depends on this.

Spec: `docs/specs/00-tokens-and-foundations.md`.

Owns and writes:
- `assets/css/tokens.css`
- `assets/css/base.css`
- `assets/fonts/space-grotesk-500.woff2`
- `assets/fonts/space-grotesk-600.woff2`
- `assets/fonts/inter-400.woff2`
- `assets/fonts/inter-500.woff2`

Touches nothing else.

Exit condition: acceptance criteria 1 to 25 in spec 00 all pass.

Why blocking: every later agent references token names. A missing token forces a rewrite everywhere.

## 6. Phase 2 — Reference page, config, and components

Three sub-phases. 2a and 2b run at the same time. 2c waits for 2a.

### 6.1 Phase 2a — Reference markup

Agent: `html-builder`. Model: Haiku 4.5. Parallel with 2b.

Specs: `docs/specs/01-logo-and-header.md`, `docs/specs/02-home.md`.

Owns and writes:
- `index.html`
- `assets/logo/monogram.svg`
- `assets/logo/wordmark.svg`
- `assets/logo/lockup.svg`
- `assets/img/favicon.svg`
- `assets/img/favicon-32.png`
- `assets/img/favicon-180.png`
- `assets/img/og-default.png`
- `site.webmanifest`

Must not write any `.css` file.
Must not write any `.js` file.
Must not write `_headers`, `_redirects`, `wrangler.toml`, `robots.txt`, or `sitemap.xml`.

### 6.2 Phase 2b — Cloudflare config and the contact Function

Agent: `cf-deploy`. Model: Haiku 4.5. Parallel with 2a.

Specs: `docs/specs/09-cloudflare-and-seo.md`, `docs/specs/07-contact.md` section 9.

Owns and writes:
- `_headers`
- `_redirects`
- `wrangler.toml`
- `robots.txt`
- `functions/api/contact.js`
- `.gitignore`

Must not write any `.html` file.
Must not write any `.css` file.
Must not write `sitemap.xml`. That belongs to `seo-auditor` in Phase 7.

No collision with 2a: disjoint file sets. Both may run concurrently with no worktree isolation.

### 6.3 Phase 2c — Components and page styles

Agent: `css-stylist`. Model: Sonnet 5. Blocking after 2a, because it styles the markup 2a produces.

Specs: `docs/specs/00-tokens-and-foundations.md`, `docs/specs/01-logo-and-header.md`, `docs/specs/02-home.md`.

Owns and writes:
- `assets/css/components.css`
- `assets/css/pages.css`

May also edit, as the Phase 1 owner:
- `assets/css/tokens.css`, only to add a token the specs flag as missing: `--surface-60`, `--accent-strong`

Must not write any `.html` file.
Must not write any `.js` file.

Exit condition: `index.html` renders correctly with zero JS loaded.

## 7. Phase 3 — Motion modules

Agent: `motion-engineer`. Model: Sonnet 5. Fourteen agents, fully parallel.

Spec: `docs/specs/08-motion-modules.md`.

One agent per file. Each agent owns exactly one file and reads only its own section.

| Agent | Owns exactly this file | Spec section | Gating |
|---|---|---|---|
| M0 | `assets/js/main.js` | 08 §0.1 | n/a |
| M1 | `assets/js/modules/hero-headline.js` | 08 §1 | desktop only |
| M2 | `assets/js/modules/hero-tilt.js` | 08 §2 | desktop only |
| M3 | `assets/js/modules/heading-mask.js` | 08 §3 | desktop only |
| M4 | `assets/js/modules/header-pill.js` | 08 §4 | mobile enabled |
| M5 | `assets/js/modules/section-curtain.js` | 08 §5 | desktop only |
| M6 | `assets/js/modules/cursor-blob.js` | 08 §6 | desktop only, fine pointer |
| M7 | `assets/js/modules/service-loops.js` | 08 §7 | desktop only |
| M8 | `assets/js/modules/work-hover.js` | 08 §8 | desktop only, hover |
| M9 | `assets/js/modules/peek-carousel.js` | 08 §9 | mobile enabled |
| M10 | `assets/js/modules/tilt-cards.js` | 08 §10 | desktop only |
| M11 | `assets/js/modules/kpi-counter.js` | 08 §11 | mobile enabled |
| M12 | `assets/js/modules/reveal-stagger.js` | 08 §12 | desktop only |
| M13 | `assets/js/modules/lenis-scroll.js` | 08 §13 | desktop only |
| M14 | `assets/js/modules/contact-form.js` | 08 §14 | always runs |

M0 is a partial exception: `main.js` imports every module, so M0 must run last, after M1 to M14 have declared their export names. Sequence M0 after the other fourteen. It is the only sequencing constraint inside Phase 3.

Vendor files. `assets/js/vendor/gsap.min.js`, `assets/js/vendor/ScrollTrigger.min.js`, and `assets/js/vendor/lenis.min.js` are downloaded once by M0 before the other agents start. No other agent writes into `assets/js/vendor/`.

Worktree isolation: not required. The fifteen file sets are disjoint. `AGENTS.md` says use isolation only when agents would write the same file.

Hard constraints for every M agent:
- Do not write any `.html` file.
- Do not write any `.css` file.
- Do not import another module.
- Do not call `requestAnimationFrame`.
- Do not call `gsap.registerPlugin` outside `main.js`.
- Do not animate `width`, `height`, `top`, or `left`, except M4 within the documented exception.

If a module needs a `data-*` hook that `index.html` does not carry, the M agent stops and reports. It does not edit `index.html`.

## 8. Phase 4 — Design review gate

Agent: `design-reviewer`. Model: Opus. Blocking gate.

Reads: the reference recording in `examples/`, `docs/specs/02-home.md`, `docs/specs/08-motion-modules.md`.
Writes: `docs/reviews/phase-4-defects.md`.
Writes no code.

Rejects on any of the seven conditions in `AGENTS.md`:
1. A hardcoded hex, px font size, or magic number outside `tokens.css`
2. Motion without a `prefers-reduced-motion` guard
3. A second RAF loop alongside Lenis
4. `width`, `height`, `top`, or `left` animated outside the header shell
5. Content invisible with JS disabled
6. An invented fact not marked `[EVIDENCE NEEDED: …]` or not carrying `data-placeholder="true"`
7. Layout shift above the fold, CLS above 0.05

Also rejects on:
8. A `data-placeholder="true"` element with no matching row in `PLACEHOLDER-CONTENT.md`
9. Any of the three preview-mode gates missing: the meta robots tag, the `X-Robots-Tag` header, or the `robots.txt` disallow
10. Any reference to the `rmyf` project
11. Any invented quote attributed to ArdLens, KC Accountants, or SodoLT
12. `aggregateRating` or `review` in any JSON-LD

No page beyond `index.html` starts until this gate passes.

## 9. Phase 5 — Defect fixes

Agents: `motion-engineer` and `css-stylist`. Model: Sonnet 5. Parallel, split by file.

Reads: `docs/reviews/phase-4-defects.md`.

File ownership:
- Every defect in a `.js` file goes to `motion-engineer`, one agent per file.
- Every defect in a `.css` file goes to `css-stylist`.
- Every defect in `index.html` goes back to `html-builder`, re-running Phase 2a on that file only.

No two agents in Phase 5 may hold the same file. The orchestrator groups defects by file before dispatching.

Exit condition: Phase 4 re-run passes with zero rejections.

## 10. Phase 6 — Remaining pages

Five `html-builder` agents in parallel, then one `css-stylist` pass.

### 10.1 Phases 6a to 6e — Page markup

Agent: `html-builder`. Model: Haiku 4.5. Five agents, fully parallel.

| Agent | Owns exactly this file | Spec |
|---|---|---|
| H1 | `services.html` | `docs/specs/03-services.md` |
| H2 | `work.html` | `docs/specs/04-work.md` |
| H3 | `insights.html` | `docs/specs/05-insights.md` |
| H4 | `about.html` | `docs/specs/06-about.md` |
| H5 | `contact.html` | `docs/specs/07-contact.md` |

Each agent owns one file. Disjoint sets, so no worktree isolation is needed.

Shared markup rule. The header, footer, and button markup must be byte-identical to `index.html` apart from `aria-current`. Each agent copies from `index.html` rather than rewriting from the spec. This is the single most common source of drift between pages.

H2 additionally owns:
- `assets/img/work/ardlens-card.webp`
- `assets/img/work/ardlens-full.webp`
- `assets/img/work/kc-accountants-card.webp`
- `assets/img/work/kc-accountants-full.webp`
- `assets/img/work/sodolt-card.webp`
- `assets/img/work/sodolt-full.webp`

Blocker for H2: no headless browser is installed. H2 must install one before capturing screenshots from the three live URLs. If installation fails, H2 ships the markup with placeholder-marked missing images and reports the blocker. It does not fabricate a screenshot.

Constraints for all five:
- Do not write any `.css` file.
- Do not write any `.js` file.
- Do not edit `index.html`.
- Do not edit another agent's page file.
- Do not edit `_headers`, `_redirects`, `wrangler.toml`, `robots.txt`, or `sitemap.xml`.
- Do not add a new component class for a pattern already styled in `components.css`.

H5 does not write `functions/api/contact.js`. `cf-deploy` already delivered it in Phase 2b.

### 10.2 Phase 6f — Page styles

Agent: `css-stylist`. Model: Sonnet 5. Blocking after 6a to 6e.

Owns and writes:
- `assets/css/pages.css`
- `assets/css/components.css`, only to generalise a component the five new pages reuse

One agent, not five. `pages.css` is a single file and five concurrent agents would collide.

## 11. Phase 7 — SEO and meta audit

Agent: `seo-auditor`. Model: Sonnet 5. Blocking.

Spec: `docs/specs/09-cloudflare-and-seo.md`.

Owns and writes:
- `sitemap.xml`
- the `<head>` block of all six HTML files
- the inline critical-CSS `<style>` block in all six HTML files
- the JSON-LD `<script type="application/ld+json">` block in all six HTML files

Must not edit anything inside `<main>` on any page.
Must not edit any `.css` file.
Must not edit any `.js` file.
Must not edit `_headers`, `_redirects`, `wrangler.toml`, or `robots.txt`.

Head-block ownership conflict, resolved: `html-builder` writes the initial `<head>` in Phases 2a and 6a to 6e. From Phase 7 onward, `seo-auditor` owns every `<head>`. `html-builder` does not touch a `<head>` after Phase 6.

Exit condition: acceptance criteria 1 to 80 in spec 09 all pass, and Lighthouse mobile scores 95 or above on all four categories on all six pages.

## 12. Phase 8 — Sign-off

Agent: `design-reviewer`. Model: Opus. Blocking gate.

Reads: every spec, the reference recording, all six pages.
Writes: `docs/reviews/phase-8-signoff.md`.
Writes no code.

Checks the twelve rejection conditions from Phase 4 across all six pages, plus:
13. Every acceptance criterion in specs 00 to 09 is checkable and checked.
14. Every `data-placeholder="true"` element on every page has a row in `PLACEHOLDER-CONTENT.md`.
15. Every `[EVIDENCE NEEDED: …]` marker has a row in `PLACEHOLDER-CONTENT.md`.
16. The launch checklist in `PLACEHOLDER-CONTENT.md` includes removing the noindex meta tags, the `X-Robots-Tag` header, and the `robots.txt` disallow.

## 13. Complete file ownership matrix

One row per file. The owner column is the only agent that may write it, in the phase given.

| File | Owner | Phase |
|---|---|---|
| `docs/specs/*.md` | `site-architect` | 0 |
| `PLACEHOLDER-CONTENT.md` | `site-architect` | 0, updated by any agent that adds a placeholder |
| `assets/css/tokens.css` | `css-stylist` | 1 |
| `assets/css/base.css` | `css-stylist` | 1 |
| `assets/fonts/*.woff2` | `css-stylist` | 1 |
| `index.html` body | `html-builder` | 2a |
| `assets/logo/*.svg` | `html-builder` | 2a |
| `assets/img/favicon*.*` | `html-builder` | 2a |
| `assets/img/og-default.png` | `html-builder` | 2a |
| `site.webmanifest` | `html-builder` | 2a |
| `_headers` | `cf-deploy` | 2b |
| `_redirects` | `cf-deploy` | 2b |
| `wrangler.toml` | `cf-deploy` | 2b |
| `robots.txt` | `cf-deploy` | 2b |
| `functions/api/contact.js` | `cf-deploy` | 2b |
| `.gitignore` | `cf-deploy` | 2b |
| `assets/css/components.css` | `css-stylist` | 2c, 6f |
| `assets/css/pages.css` | `css-stylist` | 2c, 6f |
| `assets/js/vendor/*.js` | `motion-engineer` M0 | 3 |
| `assets/js/main.js` | `motion-engineer` M0 | 3 |
| `assets/js/modules/hero-headline.js` | `motion-engineer` M1 | 3 |
| `assets/js/modules/hero-tilt.js` | `motion-engineer` M2 | 3 |
| `assets/js/modules/heading-mask.js` | `motion-engineer` M3 | 3 |
| `assets/js/modules/header-pill.js` | `motion-engineer` M4 | 3 |
| `assets/js/modules/section-curtain.js` | `motion-engineer` M5 | 3 |
| `assets/js/modules/cursor-blob.js` | `motion-engineer` M6 | 3 |
| `assets/js/modules/service-loops.js` | `motion-engineer` M7 | 3 |
| `assets/js/modules/work-hover.js` | `motion-engineer` M8 | 3 |
| `assets/js/modules/peek-carousel.js` | `motion-engineer` M9 | 3 |
| `assets/js/modules/tilt-cards.js` | `motion-engineer` M10 | 3 |
| `assets/js/modules/kpi-counter.js` | `motion-engineer` M11 | 3 |
| `assets/js/modules/reveal-stagger.js` | `motion-engineer` M12 | 3 |
| `assets/js/modules/lenis-scroll.js` | `motion-engineer` M13 | 3 |
| `assets/js/modules/contact-form.js` | `motion-engineer` M14 | 3 |
| `docs/reviews/phase-4-defects.md` | `design-reviewer` | 4 |
| `services.html` body | `html-builder` H1 | 6a |
| `work.html` body | `html-builder` H2 | 6b |
| `assets/img/work/*.webp` | `html-builder` H2 | 6b |
| `insights.html` body | `html-builder` H3 | 6c |
| `about.html` body | `html-builder` H4 | 6d |
| `contact.html` body | `html-builder` H5 | 6e |
| every `<head>` block | `seo-auditor` | 7 onward |
| every inline `<style>` block | `seo-auditor` | 7 onward |
| every JSON-LD block | `seo-auditor` | 7 onward |
| `sitemap.xml` | `seo-auditor` | 7 |
| `docs/reviews/phase-8-signoff.md` | `design-reviewer` | 8 |

Files no agent may create in any phase: `package.json`, `package-lock.json`, any `.env`, `.dev.vars`, any bundler config, any framework config, any file under `examples/`.

## 14. Parallelism summary

| Phase | Concurrent agents | Collision risk |
|---|---|---|
| 0 | 1 | none |
| 1 | 1 | none |
| 2a and 2b | 2 | none, disjoint file sets |
| 2c | 1 | none |
| 3 | 14, then M0 | none, one file each |
| 4 | 1 | none |
| 5 | up to 4, grouped by file | none if grouped correctly |
| 6a to 6e | 5 | none, one page each |
| 6f | 1 | would collide if parallel, so it is single |
| 7 | 1 | edits all six heads, so it must be single |
| 8 | 1 | none |

Maximum concurrency is 14, in Phase 3.
Worktree isolation is needed in no phase, because no two concurrent agents share a file.

## 15. Blocking summary

Blocking phases, in order: 0, 1, 2c, 4, 5, 6f, 7, 8.
Parallel phases: 2a with 2b; the fourteen agents inside 3; the five agents inside 6a to 6e; the grouped agents inside 5.

Hard gates that stop everything on failure: Phase 1, Phase 4, Phase 8.

## 16. Non-goals for this breakdown

Do not reassign a motion module to Haiku.
Do not merge Phase 6f into the five parallel Phase 6 agents.
Do not let `seo-auditor` edit page body content.
Do not let `html-builder` edit a `<head>` after Phase 6.
Do not start Phase 6 before Phase 4 passes.
Do not add a Phase 9. Sign-off ends the pipeline.
