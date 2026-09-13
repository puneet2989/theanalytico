# Spec 11 — Homepage colour system and services section motion

Written against `docs/REVIEW-2026-09-12.md` P3-3 and P3-4. Spec only — no production code in this pass. The next pass implements this against the owners and phases below.

## 1. Context

Two related defects on `index.html`:

- **P3-3.** The service card gradients (`tokens.css:80-83`) are navy, green, maroon and purple — four hues that relate to neither `--accent` (terracotta) nor `--accent-2` (periwinkle), on a page that otherwise runs a near-black hero into the blue/cream/grey token palette. Three unrelated colour systems on one page. The hero-to-services handover is also an abrupt cut: solid `--ink-black` straight into `--bg-cream` with only the standard rounded-corner overlap, no colour transition.
- **P3-4.** The services section reveals all four pillars in a static grid (`reveal-stagger.js`, all at once). The brief wants one persistent visual with the copy swapping through the four pillars as scroll advances — the hero morph's narrative-progression pattern, applied to a second section.

Both are addressed together because the services section's persistent visual (Part B) is styled with the new gradient family (Part A) — building one without the other leaves either an unstyled panel or an unused palette.

## 2. Owners and phases

| Phase | Owner | Scope |
|---|---|---|
| A | `css-stylist` | `tokens.css` gradient tokens, hero-to-section handover CSS, new component styles for the services panel (both breakpoints) |
| B | `html-builder` | Restructure `index.html`'s `#services` markup per §5 |
| C | `motion-engineer` | New module `services-pin.js`; one small addition to `hero-morph.js` for the handover fade (§4.3) |
| D | `design-reviewer` | Re-measure contrast (§3.3), confirm no idle-loop, confirm mobile does not pin |

Phase A blocks B and C (the new class names and CSS custom properties are authored there). B and C can run in parallel once A lands, same as the existing project pattern (site-architect specs, css-stylist first, then html-builder/motion-engineer in parallel).

---

## Part A — Colour system (P3-3)

## 3. Service card gradients, rebuilt from the accent pair

### 3.1 Method

Every hue below is derived from `--accent` (`#e5804b`, HSL 21°/75%/60%) and `--accent-2` (`#9999ff`, HSL 240°/100%/80%) — either used pure, or blended with the other in RGB space at a fixed ratio. No hue is invented. This keeps the four cards visually distinct (needed — they represent four different services) while reading as one derived family instead of four unrelated brand-less colours.

| Card | Source | Ratio |
|---|---:|---|
| Web Design | `--accent-2` | pure |
| SEO | `--accent` | pure |
| Paid Advertising | `--accent` + `--accent-2` | 50/50 RGB mix (→ HSL 331°, a rose/magenta) |
| AI Services | `--accent` + `--accent-2` | 30/70 RGB mix toward `--accent-2` (→ HSL 273°, a violet) |

This keeps each card's rough original identity (blue → periwinkle-blue, maroon/magenta → rose, purple → violet) except SEO, which had no accent-derived green available — it takes pure `--accent` (a warm terracotta glow) instead of trying to force a green out of a two-hue palette that doesn't contain one.

### 3.2 Structure, unchanged

Keep the existing two-layer formula exactly: a radial "blob" (`60% 42% at 50% 46%`, matching the card's floating video panel position) fading via an alpha-0 stop of the base's own colour (not `rgba(0,0,0,0)` — interpolating toward transparent-black instead of transparent-base leaves a visible grey/black fringe at the blob's edge), over a two-stop `linear-gradient(180deg, ...)` base that is nearly flat (small lightness delta, not a dramatic light-to-dark ramp). Title, body and link continue to sit clear of the blob (top and bottom of the card), so only the base stops need to clear 4.5:1 for white text — the blob is decorative, never sat on by text.

### 3.3 New values, contrast re-measured

Computed via the WCAG relative-luminance formula, white (`#ffffff`) against each base stop. Both stops must individually pass; both do, with margin:

| Token | Blob | Base (top → bottom) | Contrast (white, top) | Contrast (white, bottom) |
|---|---|---|---|---|
| `--gradient-web` | `#3d3dff` | `#00004a` → `#000026` | 19.11:1 | 20.42:1 |
| `--gradient-seo` | `#ea8652` | `#421c08` → `#220e04` | 14.99:1 | 18.49:1 |
| `--gradient-paid` | `#bb819d` | `#301a25` → `#190d13` | 16.16:1 | 18.92:1 |
| `--gradient-ai` | `#a17cc1` | `#261832` → `#140c1a` | 16.69:1 | 19.12:1 |

Worst case (SEO's top stop, 14.99:1) still exceeds the original range's floor (12.2:1). Every card comfortably clears the 4.5:1 minimum.

```css
--gradient-web:  radial-gradient(60% 42% at 50% 46%, #3d3dff 0%, rgba(0, 0, 74, 0) 72%), linear-gradient(180deg, #00004a 0%, #000026 100%);
--gradient-seo:  radial-gradient(60% 42% at 50% 46%, #ea8652 0%, rgba(66, 28, 8, 0) 72%), linear-gradient(180deg, #421c08 0%, #220e04 100%);
--gradient-paid: radial-gradient(60% 42% at 50% 46%, #bb819d 0%, rgba(48, 26, 37, 0) 72%), linear-gradient(180deg, #301a25 0%, #190d13 100%);
--gradient-ai:   radial-gradient(60% 42% at 50% 46%, #a17cc1 0%, rgba(38, 24, 50, 0) 72%), linear-gradient(180deg, #261832 0%, #140c1a 100%);
```

Replace the block comment above these tokens (`tokens.css:72-79`) with the derivation table in §3.1 and the contrast table above, in place of the old per-card ratios.

`--surface-20/35/55` (translucent white surfaces for chrome sitting on the gradients) are untouched — they're alpha-only, so they still work against any of the four new base colours without re-measuring.

## 4. Hero-to-services handover

### 4.1 Current defect

`.hero` is `background: var(--ink-black)`, no radius. `.section--cream` (services) overlaps it with the standard rounded top (`--radius-section`, per `base.css:154-163`) and its own flat `--bg-cream`. The rounded-corner overlap is already a designed *shape* transition (every section boundary on the site gets one); what's missing is a designed *colour* transition — the boundary is a hard cut from near-black to pale cream with nothing graduated between them.

### 4.2 Design

Add a fade strip to the bottom of `.hero`, tinted `--accent-2` (the same hue `--gradient-web` now uses — the first card the user reaches immediately after the hero), so the hero visually hands its accent colour directly to the card that follows it rather than cutting straight to flat cream:

```css
.hero__handover {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  block-size: 22svh;
  background: linear-gradient(to bottom, transparent, var(--bg-cream));
  pointer-events: none;
  opacity: 0;
}
```

`.hero__handover` is a new empty div, last child of `.hero__morph` (so it paints above the canvas, below the caption text — captions must stay legible for the entire scrub, not just fade in blind at the end). Fixed `--bg-cream` target, not a generic token: this treatment is specific to `index.html`'s hero, which only ever precedes the cream services section. If a future page ever reused this hero pattern ahead of a different section colour, this value would need to change with it.

### 4.3 Why it's scroll-linked, not always-on

If this strip were visible for the entire pinned scrub (opacity fixed at 1), it would permanently wash out the bottom quarter of every stage's shape and caption, not just the handover moment. It must only appear as the pin approaches release. `hero-morph.js` already owns the one `ScrollTrigger` driving this section's `onUpdate`, so it sets this new element's opacity from the same `self.progress` value already computed there — no second trigger, no second RAF, nothing that violates rule 5 (one RAF loop) or rule 3 (`ScrollTrigger` registered once).

Add one query (`document.querySelector('[data-hero-handover]')`, optional — no-op if absent, per the module's existing rule 11) and one line in the existing `onUpdate`:

```js
if (handover) {
  const t = gsap.utils.clamp(0, 1, (self.progress - 0.85) / 0.15);
  gsap.set(handover, { opacity: t });
}
```

Opaque only in the last 15% of the scrub (progress 0.85 → 1.0), zero for the rest. Opacity only — complies with rule 9 (never animate width/height/top/left).

### 4.4 Reduced motion

Under `reduced`, `hero-morph.js` already jumps straight to the final stage with no animation. Set `handover`'s opacity to `1` in that same branch — the fade should already be fully visible at rest, matching the fact that the final frame is already showing statically.

---

## Part B — Services section: pin one visual, swap the copy (P3-4)

## 5. Current structure (for contrast — this is what's replaced on desktop)

`index.html`'s `#services`: `<ul class="services__grid" data-reveal-group>` containing four `<li class="card card--service" data-reveal-item>`, each a video (`[data-service-media]`/`[data-service-video]`, hover/enter-triggered per `service-videos.js`), a title, a body paragraph, and a link. All four reveal together via `reveal-stagger.js` the first time the grid crosses 85% of the viewport.

`service-videos.js` and its hooks are untouched and keep working exactly as documented — but only on `services.html`'s own grid. The homepage stops using them for this section; see §5.2.

## 5.1 New structure — one panel, four pillars

Replace the `<ul>` with a single pinned stage containing two persistent halves — a visual panel and a copy panel — each holding all four pillars' content, always in the DOM, positioned differently per breakpoint (§5.3–§5.4). No content is duplicated between breakpoints; only its layout (stacked vs. overlaid) changes.

```html
<div class="services-pin" data-services-pin-stage>
  <div class="services-pin__visual" data-services-pin-visual>
    <video class="services-pin__video" data-services-pin-video="0" muted loop playsinline preload="none" poster="/assets/video/svc-web-poster.webp" width="480" height="300" aria-hidden="true">
      <source src="/assets/video/svc-web.webm" type="video/webm">
      <source src="/assets/video/svc-web.mp4" type="video/mp4">
    </video>
    <!-- data-services-pin-video="1|2|3" for seo / ads / ai, same pattern -->
  </div>
  <div class="services-pin__copy" data-services-pin-copy>
    <article class="services-pin__pillar" data-services-pin-pillar="0">
      <p class="eyebrow">Web Design</p>
      <h3 class="services-pin__title">Web Design</h3>
      <p class="services-pin__body">Design and build from scratch. Responsive, fast, and shaped around the action you want a visitor to take.</p>
      <a class="services-pin__link" href="/services#web-design">Web Design details</a>
    </article>
    <!-- data-services-pin-pillar="1|2|3" for seo / ads / ai, same pattern, same copy as today's cards -->
  </div>
</div>
```

Four `<video>` elements and four `<article>` pillars, order matching the current card order (Web Design, SEO, Paid Advertising, AI Services) so `--gradient-web/seo/paid/ai` map onto them the same way the service cards do today.

## 5.2 Desktop behaviour (≥1024px, matches the services grid's existing breakpoint)

- `.services-pin` pins via `ScrollTrigger` (`pin: true, pinSpacing: true, scrub: true, start: 'top top', end: '+=' + 3 * viewportHeight`) — three full viewport-heights across four pillars, more dwell time per stage than the hero's 1.75, because this section is read (body copy), not just watched.
- `.services-pin__visual` and `.services-pin__copy` are two fixed-width columns, side by side (this is the "one visual persists" requirement — the panel's position and size never change, only its active content).
- All four `[data-services-pin-video]` are absolutely stacked (`inset: 0`), same for all four `[data-services-pin-pillar]`. Only the active stage's video and pillar are `opacity: 1`; the rest are `opacity: 0`.
- The active pillar's background is that pillar's `--gradient-*` token (§3.3), applied to `.services-pin__visual` itself (not the video — the video sits on top of it, same relationship `.card--service`'s background and its video panel have today).
- Stage index: `Math.min(3, Math.floor(progress * 4))`, same formula `hero-morph.js` already uses for its own four stages.
- Crossfade: opacity only, matching the hero morph caption crossfade — **with one correction**. `hero-morph.js`'s own `goToStage` only fades out the *previous* stage and fades in the *next* one; if a fast scroll skips two stages in a single `onUpdate` tick, the skipped stage's element is never told to fade out and can be left part-way through an old tween, stuck visible. `services-pin.js` must not repeat this: on every `onUpdate`, set every pillar/video *other* than the active one to `opacity: 0` directly (no tween needed on the outgoing ones), and only tween the incoming active one from 0 to 1. This is a one-line difference in the new module, not a fix to `hero-morph.js` itself (out of scope here — flagged separately, not part of this spec).
- Holds the final stage once `progress` reaches 1 (pin behaviour already does this — no idle loop, per the motion rule this task cites).
- `prefers-reduced-motion: reduce`: no pin, no tween. Show pillar 0 and video 0 at rest, statically — matching `hero-morph.js`'s own reduced-motion behaviour (jump to a fixed state, not "the last one" here, since there's no scrub to have advanced through; pillar 0 is the natural resting content).

## 5.3 Module ordering requirement

`services-pin.js`'s own `ScrollTrigger.create({ pin: true, ... })` must be registered inside `main.js`'s `remainingModules` array (same array `hero-morph` is already in, per the fix made under P2-3 this session). It reserves its own pin-spacer height, exactly the same class of concern that made `testimonial-marquee.js`/`testimonial-dissolve.js` permanently mismeasure their own scroll positions until they were moved to initialise *after* that array. `testimonial-marquee`/`testimonial-dissolve` already run after the whole array (that fix is already shipped), so no further reordering is needed there — but this is the acceptance check for wherever `services-pin` itself lands: nothing already fixed may regress, and nothing new may be added after it in `remainingModules` without the same staleness risk being considered.

## 5.4 Mobile behaviour (<1024px) — no pin

Per `showcase-hero.js`'s existing precedent (documented there: avoids pinning on mobile rather than fighting the mobile Safari `position: fixed` jank with a workaround), and because forcing a phone through a 3-viewport-height pinned scroll to read four paragraphs of body copy is a worse reading experience than the hero's quick 1.75-viewport shape morph — **this section does not pin on mobile**, unlike `hero-morph.js`.

- `services-pin.js` does not create its `ScrollTrigger` at all when `isMobile` is true — it returns a no-op cleanup after the DOM query guards, before ever touching `ScrollTrigger.create`.
- CSS reverts `.services-pin__visual`/`.services-pin__copy` to normal document flow (no absolute stacking): each of the four pillars becomes a full-width block, video first then its copy directly beneath, in source order, one after another — visually close to today's card list, just full-width instead of a grid, and without the hover-triggered video (mobile already autoplays inline per `service-videos.js`'s existing "runs, one video at a time" mobile behaviour; the same idea applies here — each video autoplays once scrolled near, muted/looped, no user gesture needed).
- Reveal: put `data-reveal-item` back on each of the four `<article>` pillars (grouped under one `data-reveal-group` on `.services-pin__copy`, or on a shared ancestor) so mobile keeps the same staggered fade-up entrance the grid gave it before this change. `reveal-stagger.js` needs no changes — it already handles this shape of markup.

## 5.5 No-JS baseline

With JS disabled, `document.documentElement.dataset.js` never becomes `'true'`, so this must render exactly like the mobile CSS above at every viewport width: four stacked, always-visible video+copy pairs, no pin, no crossfade, no hidden content. This is the same rule `hero-morph.js` follows via its `[data-hero-morph-fallback]` poster image — reveal animations set their *start* state from JS, never from CSS, so a no-JS visitor sees finished content, not a permanently-hidden opacity:0 pillar waiting for a tween that will never run.

---

## 6. Acceptance criteria

- `grep -c "gradient-web\|gradient-seo\|gradient-paid\|gradient-ai" tokens.css` still finds exactly one definition of each, now built from `--accent`/`--accent-2` per §3.1, no unrelated hue introduced.
- Re-measuring contrast (white against each of the 8 base-gradient stops in §3.3) returns 8 values, all ≥ 4.5:1. (Automatable: sample the two solid-colour stops, not the radial blob.)
- At the hero/services boundary, scrubbing the hero to 100% progress shows `.hero__handover` fully opaque and tinted toward `--bg-cream`; scrubbing to 0% shows it fully transparent. At no point during the scrub does the fade obscure caption legibility (spot-check stage 1–3 mid-scrub screenshots).
- On desktop (≥1024px), scrolling through `#services` pins the section, advances through exactly four stages tied to scroll progress, holds pillar 3 / video 3 once scroll reaches the end of the pinned range, and never auto-advances or loops while the viewport sits still.
- Fast/discontinuous scrolling through the pinned range (jump-scroll, not just a slow drag) never leaves two pillars or two videos simultaneously above `opacity: 0` — the all-others-to-0 correction in §5.2 is what this checks.
- On mobile (<1024px) and with JavaScript disabled at any width, `#services` never pins; all four pillars and their videos are visible in normal document flow without requiring scroll-triggered state.
- `services-pin.js`'s `ScrollTrigger.create` call sits inside `remainingModules` in `main.js`; `testimonial-marquee`/`testimonial-dissolve` still run after that array.

## 7. Non-goals

- Not re-litigating `service-videos.js` or its hooks — they keep working, unchanged, on `services.html`.
- Not a new Higgsfield/AI-generated visual for the services panel. This spec reuses the four existing per-service videos already in `assets/video/`. A bespoke morphing shape (matching the hero's own asset) is a larger, separate piece of work if wanted later.
- Not fixing the `goToStage` skipped-stage bug already present in `hero-morph.js` (found during the P2-3 fix this session, out of scope there too). `services-pin.js` avoids repeating it (§5.2) but this spec does not touch `hero-morph.js`'s own crossfade logic.
- Not touching `--surface-20/35/55` or any other translucent-white token — they remain valid against all four new gradient bases without modification.
