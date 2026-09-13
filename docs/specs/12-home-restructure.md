# Spec 12 — Home page restructure (`index.html`)

Owner agents: `site-architect` (Opus, this document) → `css-stylist` (Sonnet 5) for `components.css`/`pages.css` → `html-builder` (Haiku 4.5) for `index.html` markup → `motion-engineer` (Sonnet 5) for the two new modules and the one extended module → `design-reviewer` (Opus) as the Phase 4 gate, per `docs/specs/10-work-breakdown.md` §2's roster and `AGENTS.md`'s pipeline.

Written against `docs/DESIGN-DIRECTION-v2.md`, "Proposed home page restructure" and "Decisions taken, 12 September 2026". Spec only — no production code in this pass, per `CLAUDE.md` "Model policy".

Movement 1 (hero) already shipped in a prior pass and is included here for completeness and cross-reference only; it is not re-specified.

---

## 1. Conflicts found — read before implementing

Flagged rather than silently resolved, per instruction.

### 1.1 "Seven movements" vs. the source document's own count

The brief asks for markup covering "all seven movements." `DESIGN-DIRECTION-v2.md` itself proposes seven, then drops one in the same section: *"2. Full-bleed statement — dropped. ... Six movements, not seven."* The movements that remain keep their original numbers (1, 3, 4, 5, 6, 7) with 2 absent — the document does not renumber.

This spec follows the document's explicit, later statement (six) over its own section header (seven), since the drop is a reasoned decision recorded in the same document, not an oversight. Section 6 below covers movements 1, 3, 4, 5, 6, 7. There is no movement 2.

### 1.2 Module count: measured 21, not 22

The brief states the current count as 22. Counted directly: `ls assets/js/modules/*.js` returns 21 files, and `assets/js/main.js` imports exactly 21, one-to-one. The budget and ledger in this spec use 21 as the measured baseline. If 22 came from a different count (for example including `main.js` itself), say so and this document can be corrected; nothing here depends on which number is nominally "right", only on the ledger in §5 being accurate against the real file list.

### 1.3 Payload baseline: measured 708KB today, not 968KB

The brief states 968KB as the baseline. That figure matches `docs/DESIGN-DIRECTION-v2.md`'s own performance table (0.97MB), written earlier on 12 September 2026. Measured just now, over a local static server, 390×844 viewport, full network capture to `networkidle`: **`index.html` currently transfers 725,155 bytes (708KB)**. The gap is explained by work already landed later the same day in this session — the P3-1 dynamic-import fix on `flowmap-trail.js` and the P3-2 dead-asset cleanup from `docs/REVIEW-2026-09-12.md` both post-date the 968KB measurement. §8 below budgets from the measured 708KB, not the stated 968KB.

### 1.4 `docs/specs/02-home.md` is comprehensively superseded

That spec documents the pre-monochrome, eight-section, pastel-palette home page: `--bg-blue`/`--bg-cream`/`--bg-grey` backgrounds (all three retired in the monochrome migration), a hero with inline chip images and a hand-drawn SVG doodle (replaced by the sprite-sheet morph), and `cursor-blob.js`/`service-loops.js` as the specified modules (neither exists in `assets/js/modules/` today). It also assumes `LOCAL PREVIEW ONLY` mode throughout, which conflicts with `PLACEHOLDER-CONTENT.md`'s current header (see §1.6).

This document does not edit or delete spec 02. It supersedes it for the home page's structure, module set, and palette. Recommend spec 02 be formally marked historical once this spec is approved, rather than left as an silently-contradicted "current" spec.

### 1.5 `docs/specs/08-motion-modules.md` is already stale, independent of this restructure

It lists 19 modules including `hero-arrow.js` and `hero-unfold.js`, neither of which exists in `assets/js/modules/` today. It does not list `hero-morph.js`, `process-path.js`, `insight-hover.js`, or `showcase-hero.js`, all of which do exist and are wired into `main.js`. This predates the current restructure and is not caused by it. The module ledger in §5 of this document is checked directly against `assets/js/modules/*.js` and `assets/js/main.js`, not against spec 08. Spec 08's own stated rule — *"Where this document and a module disagree, the module wins and this document is the bug"* — applies to spec 08 itself here.

### 1.6 `CLAUDE.md` vs. `PLACEHOLDER-CONTENT.md` on publication mode

`CLAUDE.md`, "Content rules", still opens with *"Current mode: LOCAL PREVIEW ONLY. Not for publication."* `PLACEHOLDER-CONTENT.md` opens with *"Current mode: LIVE, indexable, dev and prod identical"* and describes the preview gates as already removed. This is a standing, unresolved conflict (flagged separately, prior to this task) and this spec does not resolve it. Movement 6 (§6.5) reuses the existing testimonial and KPI markup, which already carries the `data-placeholder="true"` / HTML-comment marking discipline either mode would require — so implementation is not blocked by the conflict, but whoever builds this should confirm which mode applies before writing `<meta name="robots">` and JSON-LD for any new markup.

### 1.7 Movement 3 is asset-blocked, not code-blocked

`DESIGN-DIRECTION-v2.md`'s "Asset production plan" item 2 — four chrome-render sprite sheets, one per pillar, matching the hero morph's material — does not exist yet. A prior pass in this session was asked to produce them and stopped, explicitly, rather than ship placeholder shapes in that material's name: no chrome-render tool is available in this environment. §6.2 below specs movement 3's markup and module against that eventual asset, and separately specs a zero-asset interim (flat colour, per-pillar heading and body copy only, no visual) so the section can ship and the module can be built and tested against a stand-in before the real renders exist.

### 1.8 Movement 4 is already asset-ready

By contrast, `DESIGN-DIRECTION-v2.md`'s "Asset production plan" item 1 — scroll-capture video of the three live sites — is done. `assets/img/work/{ardlens,kc-accountants,sodolt}-capture.{webm,mp4}` and matching `-poster.webp` files exist (produced in this session), 9 files, 2,366,730 bytes total, none of it currently linked from any page. §6.3 specs wiring these into the new work grid; no new capture work is required.

### 1.9 `docs/specs/11-homepage-colour-and-services-motion.md` — adopt Part C, discard Part A

Spec 11 already proposes a `services-pin.js` module for a pinned services section — the same concept this document specs in §6.2, independently arrived at from the same source document. Its Part C (owners: `motion-engineer`, new module, hero-morph handover fade) is compatible with this spec and should be treated as the origin of that module, not duplicated.

Its Part A (new gradient tokens built on the retired `--accent-2`, for the services panel background) is void: the monochrome migration deleted `--accent-2` and all four `--gradient-*` tokens, and `CLAUDE.md`'s "Design tokens" section now forbids reintroducing them. Do not implement spec 11 Part A. §6.2 below specs the pinned panel's colour in monochrome terms instead.

### 1.10 `section-curtain.js`'s documented effect no longer matches what it renders

Inventory item 5 (`CLAUDE.md`) and the module's own doc comment describe "rounded next-section slide over previous" — a visual that depended on the pre-monochrome overlap CSS (`.section` negative top margin plus `--radius-section`), both retired earlier in this session. The module still runs and still does something real (a 4%-of-height `yPercent` drift as each `[data-curtain]` section enters), so it is not dead code, but the "curtain" it was named for — a rounded corner sliding over another rounded corner — has no corner left to slide over. This predates and is unrelated to this restructure.

This spec's position: leave `section-curtain.js` in place for the five pages this restructure does not touch (it is still a harmless, functioning entrance drift there). Do not apply `data-curtain` to any of the six rebuilt home sections — each already has its own bespoke pin or scrub motion (§6), and a generic drift stacked on top of a pin is redundant at best and liable to fight the pin's own transform at worst.

---

## 2. Files

`html-builder` may create or edit only:

- `index.html`

`css-stylist` may create or edit only:

- `assets/css/components.css`
- `assets/css/pages.css`

`motion-engineer` may create or edit only:

- `assets/js/modules/services-pin.js` (new)
- `assets/js/modules/process-scrub.js` (new)
- `assets/js/modules/work-hover.js` (extended, not replaced)
- `assets/js/modules/process-dial.js` (deleted)
- `assets/js/modules/hero-tilt.js` (deleted)
- `assets/js/modules/peek-carousel.js` (deleted)
- `assets/js/main.js` (import list only: remove three, add two)

Do not edit `assets/css/tokens.css` or `assets/css/base.css` — no new tokens are required (§6 uses only existing tokens) and no base-layer rule needs to change.
Do not edit any other `.js` file. Nine modules are explicitly untouched (§5).
Do not create any other file. Do not touch `assets/img/work/*-capture.*` — they already exist (§1.8).

---

## 3. Module ledger

Measured against `assets/js/modules/*.js` and `assets/js/main.js` directly (§1.2, §1.5). 21 modules today.

| # | Module | Disposition | Reason |
|---|---|---|---|
| 1 | `hero-tilt.js` | **Retire** | `[data-hero-tilt]` appears in zero `.html` files. Already fully unused before this restructure. |
| 2 | `peek-carousel.js` | **Retire** | Its own hook contract requires `[data-carousel]` *without* `[data-marquee]`; the only `[data-carousel]` in the site (`index.html` testimonials) always carries `[data-marquee]`, so the guard never passes. Already fully unused before this restructure. |
| 3 | `process-dial.js` | **Retire** | `[data-dial]` appears only in `index.html`. Movement 5 replaces the section it drives; no other page uses it. |
| 4 | `services-pin.js` | **New** | Movement 3. Pin one side, advance the visual as the pillar list scrolls (Mercury pattern). Concept originates in `docs/specs/11-…md` Part C (§1.9); this spec is the current source for it. |
| 5 | `process-scrub.js` | **New** | Movement 5. Pin the section vertically, translate a horizontal track of four steps as scroll progress advances. Nothing existing does a pinned horizontal translate; `hero-morph.js` pins and scrubs a canvas draw, not a DOM transform. |
| 6 | `work-hover.js` | **Extended** | Movement 4. Keeps its existing image-scale-plus-chip-slide behaviour unchanged for `work.html`. Adds one optional branch: if a card contains a `[data-work-video]`, play it muted/looped on the same enter event that currently only scales the image, pause on leave. Guarded by the same `hover: hover` and `pointer: fine` gate the module already uses — on touch, nothing changes, the poster just displays. One file, no new module, per "one effect per module" read as *one concern* (work-card hover), not *one element type per module*. |
| 7 | `hero-headline.js` | Reused, unchanged | Movement 1. Already shipped. |
| 8 | `hero-morph.js` | Reused, unchanged | Movement 1. Already shipped. |
| 9 | `kpi-counter.js` | Reused, unchanged | Movement 6. Markup relocates into the merged Proof section; module untouched. Already mobile-enabled. |
| 10 | `testimonial-marquee.js` | Reused, unchanged | Movement 6. Same relocation. Already mobile-enabled (30px/s per spec 08 §3). |
| 11 | `testimonial-dissolve.js` | Reused, unchanged | Movement 6. Paired with the marquee; same relocation. |
| 12 | `heading-mask.js` | Reused, unchanged | Sitewide. Used on any movement 3–7 heading that is plain text and not part of a pin's own choreography (see each movement's motion notes for which headings qualify). |
| 13 | `reveal-stagger.js` | Reused, unchanged | Sitewide. Used for any plain card list this restructure still has (movement 6's proof cards where not covered by `kpi-counter`/marquee). |
| 14 | `flowmap-trail.js` | Reused, unchanged | Sitewide, one instance, outside any section. Unaffected. |
| 15 | `lenis-scroll.js` | Reused, unchanged | Sitewide. Unaffected. |
| 16 | `header-pill.js` | Reused, unchanged | Sitewide. Unaffected. |
| 17 | `section-curtain.js` | Reused elsewhere only | Not applied to any of the six rebuilt sections (§1.10). Stays in place for `services.html`, `work.html`, `insights.html`, `about.html`, `contact.html`. |
| 18 | `tilt-cards.js` | Reused elsewhere, plus new duty | Not used for movement 5's desktop track. **Is** the mobile degradation path for movement 5 (§6.4) — same module already used for `about.html`/`contact.html`'s plain step lists. |
| 19 | `service-videos.js` | Reused elsewhere only | Home's current services grid (hover-plays a looping clip per card) is retired along with that grid. `services.html`'s own service cards are untouched and keep using it. |
| 20 | `contact-form.js` | Unaffected | `contact.html` only. Never touched home. |
| 21 | `insight-hover.js` | Unaffected | `insights.html` only. Home's insights section is deleted (§7), not replaced — this module has never been home-scoped. |
| — | `process-path.js` | Unaffected | `about.html` + `contact.html` only, never `index.html`. Not reused for movement 5: its connecting-line concept is vertical-list-shaped; movement 5's horizontal track needs `process-scrub.js` to own its own connector, not a cross-import (rule 1, one effect per module — no module imports another). |
| — | `showcase-hero.js` | Unaffected | `work.html` only. |

**Count: 21 today → retire 3 → add 2 → 20 after this restructure.** A reduction, as asked, though a modest one: the two "free" retirements (already-dead code, found during this audit, unrelated to the restructure's own logic) do the work; the restructure's own trade is 1-for-1 (`process-dial.js` out, `process-scrub.js` in) plus one in-place extension that adds no file.

---

## 4. Document structure

Section order, top to bottom. Movement numbers from `DESIGN-DIRECTION-v2.md` kept for traceability (§1.1); no section 2.

| Movement | Section | `id` | Background | Pinned/scrubbed? | Mobile behaviour |
|---|---|---|---|---|---|
| 1 | Hero | `hero` | near-black (`hero--dark`) | Yes — pins, canvas-scrubbed | Already pins on mobile too (shipped) |
| 3 | Services | `services` | white | Yes — pins, step-advances on scroll | Does not pin; stacked list (§6.2) |
| 4 | Work | `work` | near-black | No — hover only, layout is CSS grid | Single column, hover video never loads (touch) |
| 5 | Process | `process` | white | Yes — pins, horizontal translate | Does not pin; stacked `tilt-cards.js` list (§6.4) |
| 6 | Proof | `proof` | near-black | No — counters + marquee, both already mobile-enabled | Runs as-is |
| 7 | Contact | `cta` | white | No | Runs as-is |

Six sections after the hero, alternating white/near-black with no adjacent repeat — the collision the earlier monochrome CSS-only pass could not fix without a markup change (`base.css` comment, "see the file-level note in components.css… for which pages still have an adjacent same-colour pair") is resolved here, because this pass *is* the markup change.

`<main id="main">` wraps `hero` through `cta`. Heading order: one `<h1>` (hero, already shipped); each of `services`, `work`, `process`, `proof`, `cta` has one `<h2>`; cards/steps inside use `<h3>`.

---

## 5. Section 3 — Services, pinned

Markup:

```
section#services.section.section--blue    (resolves to white; class name kept for continuity, see base.css note)
  div.container
    p.eyebrow                        "What we do"
    h2#services-title                data-mask-heading
    div.services-pin                 data-services-pin-stage
      div.services-pin__visual       data-services-pin-visual (one <canvas> or <img> per pillar, see below)
      ol.services-pin__list          data-services-pin-list
        li.services-pin__item        data-services-pin-item="0"   (Web Design)
        li.services-pin__item        data-services-pin-item="1"   (SEO)
        li.services-pin__item        data-services-pin-item="2"   (Paid Advertising)
        li.services-pin__item        data-services-pin-item="3"   (AI Services)
    a.btn.btn--ghost                 "/services"
```

Pillar order is Web Design, SEO, Paid Advertising, AI Services — matching `CLAUDE.md` "Services" and every other pillar list on the site (the current hero-morph caption order, Web → Paid → SEO → AI, was flagged as inconsistent in `DESIGN-DIRECTION-v2.md` and is already gone with the hero rebuild; this section must not reintroduce a different order).

Each `li.services-pin__item` carries a heading (`h3`), one line of body copy (reuse the existing four pillar bodies already in `CLAUDE.md`/`services.html`, do not draft new ones), and a link to its `services.html` anchor — copy this from the current `#services` grid, which already has it right.

**Interim visual (ships now, §1.7):** `div.services-pin__visual` holds one `<div class="services-pin__flat" data-services-pin-flat>` per pillar, flat `--ink-black`/`--surface` fill with the pillar name in large display type, `text-align` and sizing matching the hero's own occluded-headline treatment loosely (large, tight, confident) — zero new image assets, matching `DESIGN-DIRECTION-v2.md`'s own zero-cost fallback ("hobro does this for their OUR CORE IDENTITY screen"). Swap logic in `services-pin.js` is identical whichever visual variant is present — it toggles a class/attribute on whichever child matches the active index, it does not care if that child is a flat div or a canvas.

**Final visual (ships once §1.7 clears):** one `<canvas data-services-pin-canvas>` per pillar, same sprite-sheet-to-canvas technique as `hero-morph.js`, each on its own small sprite (see §8 for the budget assumption). `services-pin.js` need not change either way; only the markup inside `.services-pin__visual` does.

Motion — `services-pin.js` (new):
- Pin `.services-pin__stage` for a scroll distance proportional to the list (`list items × one viewport`, roughly — exact value is an implementation decision, not specified here).
- As the pinned scroll advances, compute which `li` is centred/active (by scroll fraction, same `Math.floor(progress * count)` approach `hero-morph.js` already uses for its own now-removed stage logic) and toggle an active class on the matching visual child and list item.
- Transform/opacity only for the swap (a short crossfade), never `top`/`left`/`width`/`height`.
- `reduced`: no pin, all four visuals and list items rendered in their final "settled" state, no animation.
- `heading-mask.js` still owns `h2#services-title` (plain text, outside the pinned stage). Do not put `data-mask-heading` on anything inside `.services-pin__stage` — the pin's own crossfade is that content's reveal.

Mobile (§1.1's instruction: every pinned section needs a stated degradation path):
- `services-pin.js` does **not** pin below 768px (default `CLAUDE.md` motion gate; not explicitly overridden, unlike `hero-morph.js`).
- Markup does not change — the same four `li.services-pin__item` blocks render, but CSS stacks them as plain full-width cards, each with its own visual inline above its heading (mirrors the desktop's non-pinned flat-fallback exactly, so the interim and final visual assets both degrade the same way with zero extra markup).
- Acceptance: at 390px, all four pillars are visible by scrolling normally, no pin, no `will-change` set, no `ScrollTrigger.create` call made for this module (verify via `ScrollTrigger.getAll().length` before/after, or by confirming the module's own mobile branch never reaches its `ScrollTrigger.create`).

Acceptance criteria, testable in a browser:
1. At 1440×900, scrolling through `#services` holds the section pinned (viewport does not advance) until all four pillars have been the active one.
2. Exactly one `.services-pin__item` and one visual child carry the active state at any scroll position within the pin.
3. Pillar order in the DOM is Web Design, SEO, Paid Advertising, AI Services.
4. At 390×844, `#services` is not pinned (confirm no added scroll distance versus the section's own content height) and all four pillars are reachable by normal scroll.
5. With `prefers-reduced-motion: reduce`, all four pillars render in place with no animation and no pin.
6. With JS disabled, all four pillars and their copy are present and readable in source order.
7. `h2#services-title` carries `data-mask-heading` and contains plain text only; nothing inside `.services-pin__stage` does.

---

## 6. Section 4 — Work, asymmetric grid

Markup:

```
section#work.section.section--grey     (near-black)
  div.container
    p.eyebrow                    "Selected work"
    h2#work-title                data-mask-heading
    ul.work-grid--asymmetric     data-reveal-group
      li.card--work               data-work-card   (ArdLens)
      li.card--work               data-work-card   (KC Accountants)
      li.card--work               data-work-card   (SodoLT)
    a.btn.btn--ghost              "/work"
```

Each `li.card--work` keeps its existing `data-work-img`/`data-work-chip` structure (unchanged from today) and adds one sibling: `<video data-work-video muted loop playsinline preload="none" poster="[same poster as data-work-img]">` with the matching `.webm`/`.mp4` pair from `assets/img/work/` (§1.8 — already produced, already sized to the 400KB-per-file cap from the earlier capture pass). `data-reveal-item` on each `li`, reusing `reveal-stagger.js` for entrance — no new entrance module needed, this movement's only new behaviour is the hover-video branch in `work-hover.js` (§3).

Layout: staggered/asymmetric column spans and row placement, full-bleed to the section's own edge (no `.container` max-width constraining the grid itself, only the eyebrow/heading/lead above it) at 1024px and above. Below 1024px, a plain single column — CSS-only responsive change, not a motion concern.

Mono captions per card (project / sector / stack) reuse the `.label-mono` typographic treatment from the editorial-overlay pass earlier this session, not new CSS.

Motion:
- `work-hover.js` (extended, §3): image scale + chip slide, unchanged; video plays on the same enter event when present, `hover: hover` and `pointer: fine` gated as today.
- `reveal-stagger.js`: entrance, as above.
- No pin, no horizontal scrub — this movement does not need a mobile degradation path for pinning because it never pins. The one thing that does change behaviour by viewport is the hover video, and it already has a stated, existing gate (touch never requests it).

Acceptance criteria:
1. Exactly three `<li class="card--work">`, titled ArdLens, KC Accountants, SodoLT, in that order.
2. Each card's `<video>` has `muted`, `loop`, `playsinline`, `preload="none"`, and a `poster` matching its sibling `<img>`'s `src`.
3. At a desktop viewport with `hover: hover` and `pointer: fine` simulated, hovering a card plays its video within one animation frame of the existing image-scale start; leaving pauses it.
4. At 390×844 with touch/coarse-pointer emulated, the video element exists in the DOM but its network request is never made (confirm via a request log — zero requests to any `*-capture.mp4`/`.webm` URL).
5. Below 1024px the grid is a single column; at 1024px and above it uses the staggered layout.
6. With JS disabled, all three cards, their images, and their links are visible and functional; the videos are simply inert `<video poster>` elements, which is correct.
7. No traffic, ranking, or revenue claim appears on any card (permanent rule, `PLACEHOLDER-CONTENT.md` §4).

---

## 7. Section 5 — Process, horizontal scroll

Markup:

```
section#process.section.section--cream   (resolves to white)
  div.container
    p.eyebrow                    "How it runs"
    h2#process-title             data-mask-heading
  div.process-scrub                data-process-scrub-stage
    ol.process-scrub__track        data-process-scrub-track, data-tilt-card on each li (mobile path, §"Mobile" below)
      li.process-scrub__step       "Call"
      li.process-scrub__step       "Plan"
      li.process-scrub__step       "Build"
      li.process-scrub__step       "Grow"
```

`div.process-scrub` sits outside `.container` (full-bleed pinned stage, same reasoning as the hero: a horizontal track needs more inline room than a padded column gives it). The eyebrow and heading stay inside `.container` above it, in normal flow, not part of the pin.

Four steps, copy reused verbatim from the current `#process` section (Call / Plan / Build / Grow — already correct, already confirmed no turnaround-time claim per `PLACEHOLDER-CONTENT.md`'s permanent rules).

Motion — `process-scrub.js` (new):
- Pins `.process-scrub__stage` vertically for a scroll distance proportional to the track's overflow width.
- Translates `.process-scrub__track` on the inline axis (`transform: translateX(...)`, never `left`) as pinned scroll progress advances, 0 to `-(trackWidth - viewportWidth)`.
- `reduced`: no pin, track rendered at its natural (unscrolled) position; all four steps still reachable by whatever normal document flow surrounds it (i.e. the track must not rely on the scrub to become visible — set it as a normal horizontally-scrollable strip, `overflow-x: auto`, `scroll-snap-type: x mandatory`, as the CSS-only fallback baseline, matching the "content must be readable with JS disabled" rule doing double duty for reduced-motion too).
- Optional connector line between steps: if built, it is owned by this module (`data-process-scrub-line` or similar), not by importing `process-path.js` (rule 1, no cross-imports) — conceptually the same idea as that module, independently drawn for a horizontal layout, since geometry differs enough that adapting the existing vertical-list implementation is not meaningfully cheaper than a fresh, small path-draw local to this module.

Mobile — the clearest case of §"mobile degradation path for every pinned or horizontally-scrubbed section" the brief asks for:
- `process-scrub.js` does not pin or scrub below 768px (default gate, not overridden).
- Markup does not change. `data-tilt-card` is already present on each `li.process-scrub__step` (harmless, ignored, on desktop where `process-scrub.js` handles the track instead — see next point), so `tilt-cards.js` — already mobile-enabled, already used for this exact "four-step list" job on `about.html` and `contact.html` — picks the steps up automatically below 768px with no new code.
- One overlap to guard against: `tilt-cards.js` groups siblings by `parentElement` and animates `rotate`/`y`/`opacity`; `process-scrub.js` must not also touch those properties on the same `<li>` on desktop, or the two will fight the moment a viewport crosses the 768px boundary during a live resize. Simplest correct rule: `process-scrub.js` only ever touches `.process-scrub__track`'s own transform, never the individual `<li>` elements' transforms — matching how `hero-morph.js` and `heading-mask.js` already divide "who moves the container" from "who moves the item" on other pins.

Acceptance criteria:
1. At 1440×900, `#process` pins and the track visibly translates left as the user scrolls through the pinned distance; all four steps become visible in order.
2. At 390×844, `#process` does not pin; the four steps render as a normal vertical list, each tilted at rest and rotating straight on enter (the existing `tilt-cards.js` behaviour, unchanged).
3. With `prefers-reduced-motion: reduce` at any width, all four steps are reachable without any pin, scrub, or tilt animation.
4. With JS disabled, all four steps and their copy are present, in order, and readable (as a horizontally-scrollable CSS strip on wide viewports per the fallback above, or simply stacked given the mobile CSS already applies below 768px regardless of JS).
5. No element in this section has both `data-tilt-card` and a transform written by `process-scrub.js` at the same viewport width.
6. No turnaround-time or delivery-speed claim appears in any step's copy (permanent rule already satisfied by the reused copy; do not add one).

---

## 8. Section 6 — Proof (KPI + testimonials merged)

Markup:

```
section#proof.section.section--grey     (near-black)
  div.container
    h2#proof-title                data-mask-heading   "Numbers so far, and who they're for"
    ul.kpi__list                  (existing kpi-counter.js markup, unchanged, fewer/larger — see below)
    div.carousel                  (existing testimonial-marquee.js / testimonial-dissolve.js markup, unchanged, data-placeholder discipline unchanged)
    div.carousel__controls
```

*Fewer, larger numbers* (`DESIGN-DIRECTION-v2.md`, movement 6): drop the current four-KPI band to two — keep KPI 1 (`3`, sites shipped and live — a confirmed fact, never marked as a placeholder) and one placeholder KPI, rather than three placeholders plus one real one. Which placeholder KPI survives is a copy decision for whoever writes the merged section's markup, not specified here; whichever it is keeps its existing `data-placeholder="true"` and preceding HTML comment unchanged, per `PLACEHOLDER-CONTENT.md` row 1.2/5.1/5.2's existing discipline. Do not invent a new number to replace the two dropped.

Testimonial markup, three slides, is reused byte-for-byte from the current `#testimonials` section — same draft quotes pending Raj/Kat/Piotr sign-off (`PLACEHOLDER-CONTENT.md` rows 1.1/5.5), same "no photo" decision, same carousel/marquee structure. This movement only relocates it; it does not touch its content or its placeholder marking.

Motion: `kpi-counter.js` and `testimonial-marquee.js`/`testimonial-dissolve.js`, unchanged, both already mobile-enabled (§3). `reveal-stagger.js` on the KPI `<ul>` if it is not already using `kpi-counter.js`'s own trigger for its container-level entrance (it is not — `kpi-counter.js` only animates the numeral, per spec 08 §4.9 — so `data-reveal-group`/`data-reveal-item` on the KPI list is retained from the current section, unchanged).

Acceptance criteria:
1. `#proof` contains exactly one KPI list with exactly two items, one of which is the confirmed `3` with no `data-placeholder` attribute.
2. The other KPI carries `data-placeholder="true"` and a preceding `<!-- PLACEHOLDER: … -->` comment.
3. Exactly one carousel exists on the page (unchanged from today — this movement does not add a second).
4. All three testimonial slides carry `data-placeholder="true"` and their preceding comments, unchanged.
5. No `AggregateRating` or `review` key in this page's JSON-LD (permanent rule, unaffected by the merge).
6. At 390×844, both the KPI counters and the carousel are usable (counters show final values or count up per `reduced`; carousel is swipeable/arrow-navigable).

---

## 9. Section 7 — Contact

Markup:

```
section#cta.section.section--blue    (resolves to white)
  div.container.container--narrow
    h2#cta-title            data-mask-heading, one display line
    div.cta__actions        phone link (tel:), "Send a message" button to /contact
```

Full-bleed per the movement's own description means the *section* runs edge to edge (no radius, already the default post-monochrome-migration); the text column inside stays `.container--narrow`, same as the current CTA section — "full-bleed, one display line" describes the background/visual treatment, not an unreadable full-width line of 92px type.

Drop the footer-duplicating link list mentioned in `DESIGN-DIRECTION-v2.md` movement 7 — check the current `#cta` section for one before assuming; if none exists today, this line of the movement is already satisfied and there is nothing to remove.

Motion: `heading-mask.js` on `h2#cta-title`, unchanged from the current CTA section. No pin, no new module.

Acceptance criteria:
1. `#cta` contains exactly one `<h2>`, one phone link (`tel:+353872520034`), and one link to `/contact`.
2. No email address appears here (none is confirmed — `[EVIDENCE NEEDED: business email]`, unchanged).
3. No duplicate footer link list exists inside `#cta`.

---

## 10. Insights — removed from the home page

`DESIGN-DIRECTION-v2.md`: *"Insights moves off the home page to its own index."* `insights.html` already exists, already live, already linked from the primary nav on every page (confirmed: `insights.html` is one of the current six pages, not a new page this spec introduces). This movement is a deletion, not a migration:

- Delete the current `#insights` section from `index.html` entirely (eyebrow, heading, three-card grid, "See more" link).
- `insight-hover.js` is unaffected — it was already `insights.html`-scoped only (§3, row 21); nothing about its usage changes.
- No new page, no new route, no redirect needed.
- Net payload effect: a reduction (§8) — whatever the current three insight cards cost on the home page (images, if any, plus the markup itself) is removed, not replaced.

Acceptance criteria:
1. `index.html` contains no element with `id="insights"`.
2. `grep -c 'insight' index.html` (case-insensitive) returns zero outside of unrelated substrings, if any.
3. The primary nav's `Insights` link, unaffected by this change, still points at `/insights`.

---

## 11. Payload budget

Methodology: current figures are measured, not estimated — Playwright network capture, 390×844 viewport, `device_scale_factor: 2`, `wait_until: "networkidle"`, against a local static server serving the repository as-is, immediately before writing this spec. New-module sizes are estimated by proxy against existing modules of comparable complexity (stated per line). Image/video figures for already-produced assets are measured file sizes; figures for the not-yet-produced movement 3 sprites are a stated ceiling, flagged provisional (§1.7).

| Component | Measured today | After restructure | Method |
|---|---|---|---|
| Scripts (vendor + `main.js` + all modules) | 292,387 B | ≈ 287,486 B | −19,901 B (retire `hero-tilt.js` 2,917 + `peek-carousel.js` 8,157 + `process-dial.js` 8,827, measured) + ≈15,000 B (two new modules, proxied against `hero-morph.js` 9,022 B and `showcase-hero.js` 6,449 B) |
| Fonts | 91,052 B | 91,052 B | Unchanged — no new typeface needed |
| CSS (`tokens` + `base` + `components`) | 69,146 B | ≈ 80,000 B | +≈11KB estimated for six new section layouts (pinned panel, asymmetric grid, horizontal track, merged proof) |
| Document (`index.html`) | 22,538 B | ≈ 23,000 B | Roughly flat — new movement 3/4/5 markup offsets the deleted insights section |
| **Fixed subtotal** | **475,123 B** | **≈ 481,538 B** | |
| Hero imagery (movement 1) | 181,478 B | 181,478 B | Unchanged, already shipped (`hero-morph-sprite-mobile.webp` 173,398 + poster 8,080) |
| Services visual, first-load (movement 3) | 0 | ≈ 60,000 B ceiling | **Provisional (§1.7).** First active pillar only; remaining three lazy-load on scroll-into-view, not counted in first load. Zero-asset flat-colour interim (§6.2) would make this 0 B until real renders land. |
| Work posters (movement 4) | 0 (unlinked, §1.8) | 149,638 B | Measured: three posters, 37,170 + 43,036 + 69,432 B. Videos excluded from mobile total — `pointer: coarse` never requests them (§6.3, acceptance 4). |
| Process (movement 5) | included above | 0 B | "Type and rules only" per source doc; no image/video asset. |
| Proof (movement 6) | included above | 0 B | Reused markup, no photos (testimonial photos already dropped this session). |
| Contact (movement 7) | included above | 0 B | No asset. |
| Insights removal | (whatever it costs today) | savings, not itemized further | Net negative contribution; not separately measured since the section is deleted rather than resized. |
| **First-load total** | **725,155 B (measured, §1.3)** | **≈ 872,654 B (≈ 852KB / 0.83MB)** | |
| **Full-scroll-through total** (all four services visuals loaded) | — | ≈ 1,052,654 B (≈ 1.00MB) | Adds the remaining three services sprites at the same ≈60KB ceiling each |

**Budget: ≤900KB first load, ≤1.1MB full-scroll-through, mobile (390px), until movement 3's real assets land** — both comfortably inside the 3–4MB realistic ceiling `DESIGN-DIRECTION-v2.md` itself sets, and a deliberate, bounded increase of roughly 150KB over today's measured 708KB baseline (§1.3), spent entirely on the real portfolio and service visuals the diagnosis in that document says the site is missing. This is a budget, not a guarantee: Lighthouse's Performance score also weighs main-thread time from three additional `ScrollTrigger.create` pins running on one page (hero, services, process) plus the existing marquee/dissolve pair, which this document does not attempt to model from a spec. Confirm 92+ empirically once built, per `CLAUDE.md`'s own floor.

---

## 12. Sitewide motion and mobile-gating summary for this page

| Section | Module(s) | Pins/scrubs? | Below 768px |
|---|---|---|---|
| Hero | `hero-morph.js`, `hero-headline.js` | Yes | Pins too (mobile-enabled, shipped) |
| Services | `services-pin.js` (new) | Yes | Does not pin — stacked list, same markup |
| Work | `work-hover.js` (extended), `reveal-stagger.js` | No | Hover video never requested (`pointer: coarse`) |
| Process | `process-scrub.js` (new) | Yes | Does not pin — `tilt-cards.js` picks up the same `<li>`s |
| Proof | `kpi-counter.js`, `testimonial-marquee.js`, `testimonial-dissolve.js`, `reveal-stagger.js` | No | All already mobile-enabled, unchanged |
| Contact | `heading-mask.js` | No | Unchanged |

Every module not explicitly declared mobile-enabled above bails at `matchMedia('(max-width: 768px)')`, per `CLAUDE.md`'s default. Every module bails entirely under `prefers-reduced-motion: reduce`, no exceptions, including the two new ones.

---

## 13. Acceptance criteria — page level

1. `index.html` contains exactly one `<h1>` (hero, unchanged) and six `<h2>` elements, one per section in §4's table, each with `data-mask-heading` where stated in that section's own notes.
2. Section order top to bottom matches §4 exactly: `hero`, `services`, `work`, `process`, `proof`, `cta`.
3. Background classes alternate with no two adjacent sections resolving to the same monochrome value (hero dark, services white, work dark, process white, proof dark, cta white).
4. No `id="insights"`, `id="results"`, or `id="testimonials"` exists (the last two are absorbed into `id="proof"`).
5. Total module count in `assets/js/modules/` is 20 (§3), and `main.js` imports exactly those 20, one-to-one.
6. `hero-tilt.js`, `peek-carousel.js`, and `process-dial.js` do not exist in the repository after this pass ships.
7. Mobile first-load transfer at 390×844 is ≤900KB; full-scroll-through is ≤1.1MB (§11), re-measured against the shipped page, not assumed from this budget.
8. Every pinned or horizontally-scrubbed module (`hero-morph.js`, `services-pin.js`, `process-scrub.js`) has a verified non-pinning behaviour below 768px (§6.2, §7, each section's own mobile notes).
9. With JS disabled, all six sections' text content is present and readable, and no element has `opacity: 0` as a resting state.
10. With `prefers-reduced-motion: reduce`, no pin is created anywhere on the page (verify `ScrollTrigger.getAll().length` reflects zero pinned triggers for this page's own modules).
11. `PLACEHOLDER-CONTENT.md` still lists every `data-placeholder="true"` element and every `EVIDENCE NEEDED` marker on this page; the relocation in §8 does not silently drop a row.
12. No new hex colour, no reintroduced `--bg-blue`/`--bg-cream`/`--bg-grey`/`--accent-2`/`--gradient-*` token anywhere in the diff.

---

## 14. Non-goals

- Do not implement movement 3's final chrome-render visual in this pass — ship the flat-colour interim (§6.2) and treat the real asset as a follow-on, tracked separately from this spec.
- Do not edit `docs/specs/02-home.md` or `docs/specs/08-motion-modules.md` in this pass — flagged (§1.4, §1.5), not silently rewritten.
- Do not implement `docs/specs/11-…md` Part A (gradient tokens) under any circumstance — void (§1.9).
- Do not resolve the `CLAUDE.md`/`PLACEHOLDER-CONTENT.md` publication-mode conflict (§1.6) as part of this work.
- Do not add a new typeface, a new spacing/radius/colour token, or edit `tokens.css`/`base.css`.
- Do not touch `services.html`, `work.html`, `insights.html`, `about.html`, or `contact.html` — this spec is `index.html` only.
- Do not write any production code against this spec yet, per `CLAUDE.md` "Model policy" — this document is the precondition, not the implementation.
