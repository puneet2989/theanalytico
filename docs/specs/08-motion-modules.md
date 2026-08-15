# Spec 08 — Motion modules (as-built, Phase 6 revision)

Rewritten 15 Aug 2026 against the shipped code. **The files in `assets/js/modules/` are the source of truth.** Where this document and a module disagree, the module wins and this document is the bug.

Audience: `html-builder` agents writing `services.html`, `work.html`, `insights.html`, `about.html`, `contact.html`; and `motion-engineer` if a new hook is required.

## 1. Hard rule for Phase 6

**No JavaScript file is edited in Phase 6.** Every module below already runs on every page that loads `/assets/js/main.js`. A page gets an effect by including the module's `data-*` hooks in its markup. A page skips an effect by omitting the hooks — every module returns a no-op when its hook is absent.

If a page needs an effect that no existing hook provides, the spec for that page says so explicitly under "New hooks required". There are currently **zero** new hooks required for the five Phase 6 pages.

## 2. Loading contract, identical on every page

Every page ends `<body>` with exactly these four tags, in this order, copied byte-for-byte from `index.html` lines 427–430:

```html
<script src="/assets/js/vendor/gsap.min.js" defer></script>
<script src="/assets/js/vendor/gsap-ScrollTrigger.min.js" defer></script>
<script src="/assets/js/vendor/lenis.min.js" defer></script>
<script src="/assets/js/main.js" type="module" defer></script>
```

`contact.html` adds one more, and only `contact.html`:

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></script>
```

`main.js` imports all 19 modules unconditionally and calls each with `{ gsap, ScrollTrigger, lenis, reduced, isMobile }`. It sets `document.documentElement.dataset.js = 'true'` first. It never branches on page URL.

`<html>` must carry `data-header-boot="top"` and `<head>` must carry the one-line anti-flash script from `index.html` line 28. Both are required on every page.

## 3. Module inventory — as built

`reduced` = `prefers-reduced-motion: reduce`. `isMobile` = `matchMedia('(max-width: 768px)')`.

| # | File | Export | Required hooks | On `reduced` | On mobile | Phase 6 reuse |
|---|---|---|---|---|---|---|
| 1 | `lenis-scroll.js` | `initLenisScroll` | `[data-anchor-link]` (optional) | bails | **bails** | Yes — global, plus optional anchor links |
| 2 | `header-pill.js` | `initHeaderPill` | `[data-header]`, `[data-header-shell]`, `[data-logo-wordmark]`, `[data-drawer-toggle]`, `[data-drawer]` | runs, no tween | runs | **Mandatory on all 5 pages** |
| 3 | `contact-form.js` | `initContactForm` | `[data-contact-form]` | runs (ungated) | runs | `contact.html` only |
| 4 | `hero-headline.js` | `initHeroHeadline` | `[data-hero-headline]` | bails | runs | **No — home only** |
| 5 | `hero-arrow.js` | `initHeroArrow` | `[data-hero-arrow]`, `[data-hero-arrow-path]`, `[data-hero-arrow-head]` | draws static | runs | **No — home only** |
| 6 | `hero-tilt.js` | `initHeroTilt` | `[data-hero-tilt]` | bails | runs | Yes — optional, on one large image per page |
| 7 | `hero-unfold.js` | `initHeroUnfold` | all five of `[data-hero-media]`, `[data-hero-video]`, `[data-hero-unfold-stage]`, `[data-hero-unfold-canvas]`, `[data-hero-unfold-fallback]` | bails | runs | **No — home only** |
| 8 | `heading-mask.js` | `initHeadingMask` | `[data-mask-heading]` | bails | **runs** | **Yes — every `h2` on every page** |
| 9 | `section-curtain.js` | `initSectionCurtain` | `[data-curtain]` | bails | **runs** | **Yes — every section after the first** |
| 10 | `flowmap-trail.js` | `initFlowmapTrail` | `[data-flowmap]` | bails | **bails** (also bails on `pointer: coarse`, and if WebGL is unavailable) | **Yes — one empty div per page** |
| 11 | `service-videos.js` | `initServiceVideos` | `[data-service-media]` wrapping `[data-service-video]` | bails | runs, one video at a time | Yes — `services.html` only |
| 12 | `work-hover.js` | `initWorkHover` | `[data-work-card]` containing `[data-work-img]` **and** `[data-work-chip]` | bails | runs only where `hover: hover` and `pointer: fine` | Yes — `work.html` |
| 13 | `peek-carousel.js` | `initPeekCarousel` | `[data-carousel]` **without** `[data-marquee]`, plus `[data-carousel-slide]`, `[data-carousel-prev]`, `[data-carousel-next]` | reduced-safe jump | runs | **No — do not use in Phase 6** |
| 14 | `testimonial-marquee.js` | `initTestimonialMarquee` | `[data-marquee]` (same element as `[data-carousel]`), `[data-carousel-slide]`, `[data-carousel-prev]`, `[data-carousel-next]` | bails to CSS scroll-snap | runs, 30 px/s | **No — home only in this pass** |
| 15 | `testimonial-dissolve.js` | `initTestimonialDissolve` | `[data-dissolve]` containing exactly two `[data-dissolve-frame]` | static first frame | static first frame | **No — home only in this pass** |
| 16 | `tilt-cards.js` | `initTiltCards` | `[data-tilt-card]` | bails | **runs** | Yes — any card list of 2–4 items |
| 17 | `process-dial.js` | `initProcessDial` | `[data-dial]` wrapping `[data-dial-arc]`, `[data-dial-arc-path]`, `[data-dial-num]` ×N | static, step 1 active | **no rotation**; arc draws once, each card lights on enter | **No — home only in this pass** |
| 18 | `kpi-counter.js` | `initKpiCounter` | `[data-counter]` + `data-counter-to` | writes final value immediately | **runs** | Yes — `work.html` only |
| 19 | `reveal-stagger.js` | `initRevealStagger` | `[data-reveal-group]` containing `[data-reveal-item]`, or a bare `[data-reveal-item]` | bails | **runs** | **Yes — every card grid on every page** |

Only `flowmap-trail.js` and `lenis-scroll.js` are fully desktop-only. `process-dial.js` is the one module that changes behaviour rather than switching off on mobile.

## 4. Per-module hook contracts for Phase 6

Only the eight modules an `html-builder` may trigger in Phase 6 are detailed. Everything else is out of scope.

### 4.1 `header-pill.js` — mandatory chrome

Copy `index.html` lines 60–101 verbatim: skip link, flowmap div, `<header>`, and drawer. Change exactly two things per page:

1. Move `aria-current="page"` onto the current page's `<a data-nav-link>` in `.header__list`. Remove it from Home. `contact.html` puts it on `.header__cta` instead, and adds it to the footer `Contact Us` link.
2. Nothing else. Not the logo, not the burger, not the drawer, not the class names.

The module sets `data-header-state="top" | "pinned"` on `[data-header]` at `scrollY` 40. `components.css` styles both states. Do not add state attributes by hand beyond the authored `data-header-state="top"`.

Drawer: `<div class="drawer" id="mobile-drawer" hidden data-drawer>` must keep the `hidden` attribute in source. The module removes it.

### 4.2 `flowmap-trail.js` — mandatory chrome

One line, immediately after the skip link, before `<header>`:

```html
<div data-flowmap aria-hidden="true"></div>
```

Empty. No class. No inline style. It is a page-wide `position: fixed; inset: 0` layer, already styled in `components.css` line 479. It is not hero-scoped. Omitting it is a defect; duplicating it is a defect.

### 4.3 `heading-mask.js` — every section heading

Put `data-mask-heading` on **every** section `<h2>`. Do not put it on an `<h1>`, an `<h3>`, or on any element also carrying `data-hero-headline`.

- Trigger: `top 85%` of the viewport, once, never reverses.
- Words rise `yPercent 110 → 0` with `opacity 0 → 1`, duration `0.8s`, ease `power3.out`, stagger `0.06s`.
- The module splits on the space character only and pins `aria-label` to the original string.

Consequence for markup: a heading carrying `data-mask-heading` must contain **plain text only**. No `<br>`, no `<span>`, no `<em>`, no inline image. Child elements are destroyed by the split. Headings with markup inside must not carry the hook.

Every `<h2>` gets an `id`, and its `<section>` gets `aria-labelledby` pointing at that id. Pattern: `index.html` line 123 and line 126.

### 4.4 `section-curtain.js` — section rhythm

Put `data-curtain` on every `<section>` **except the first section of the page**. The first section has nothing to slide over.

- Scrubbed `yPercent 4 → 0`, `scrub: 0.6`, from `top bottom` to `top 60%`.
- Runs on mobile.
- Pairs with the CSS overlap in `base.css` (`.section` negative top margin plus `--radius-section`). Sections must alternate `--blue` → `--cream` → `--grey` → `--blue` in source order for the overlap to read.

### 4.5 `reveal-stagger.js` — card grids

Put `data-reveal-group` on the `<ul>`/`<ol>` and `data-reveal-item` on each `<li>`.

- Trigger: group's `top 85%`, once.
- `y 20 → 0`, `opacity 0 → 1`, duration `0.6s`, ease `power2.out`, stagger `0.08s`.
- Items inside a `<form>` are skipped by the module. Do not use these hooks inside the contact form.
- A bare `[data-reveal-item]` with no group ancestor animates on its own trigger. Use this for a single standalone block.
- Never put both `data-reveal-item` and `data-tilt-card` on the same element. Both write `opacity` and `y` and will fight.

### 4.6 `tilt-cards.js` — process/step lists

Put `data-tilt-card` on each `<li>`. The module groups by `parentElement`, so all siblings in one list animate as one group.

- Rest state set from JS: `rotate ±3deg` alternating by index, `y 24`, `opacity 0`.
- Trigger: parent list's `top 80%`, once. To `rotate 0, y 0, opacity 1`, duration `0.7s`, ease `power3.out`, stagger `0.09s`.
- Do not combine with `data-reveal-item` (see 4.5).
- `[data-dial-active]` styling exists in `components.css`, but only `process-dial.js` sets that attribute. Without `[data-dial]` on an ancestor, no card is ever marked active. That is correct and expected on Phase 6 pages.

### 4.7 `work-hover.js` — work cards

Each card needs all three hooks:

```html
<li class="card card--work" data-work-card>
  <a class="card--work__media" href="…">
    <img … data-work-img>
    <span class="card--work__chip" data-work-chip>Sector label</span>
  </a>
  …
</li>
```

- Chip start state is set from JS to `xPercent -110, opacity 0`. With JS off it stays visible; that is intended.
- Enter (pointer or keyboard focus): image `scale 1.06` over `0.5s` `power2.out`; chip `xPercent 0, opacity 1` over `0.45s` `power3.out`.
- Leave: image `scale 1` over `0.35s`; chip back out over `0.35s`.
- A card missing either `data-work-img` or `data-work-chip` is silently skipped.

### 4.8 `service-videos.js` — service media panels

```html
<figure class="card__media card__media--video" data-service-media>
  <video data-service-video muted loop playsinline preload="none" poster="…" width="480" height="300" aria-hidden="true">
    <source src="….webm" type="video/webm">
    <source src="….mp4" type="video/mp4">
  </video>
</figure>
```

- All of `muted`, `loop`, `playsinline`, `preload="none"`, `poster`, `width`, `height`, `aria-hidden="true"` are required. Autoplay without `muted` is blocked by browsers; missing `width`/`height` causes CLS.
- The module flips `preload` to `auto` and plays on `top bottom` → `bottom top`, pauses off-screen and on `visibilitychange`.
- Only the four existing clips may be used: `svc-web`, `svc-seo`, `svc-ads`, `svc-ai`, each with `.webm`, `.mp4`, and `-poster.webp` in `/assets/video/`. Do not invent a fifth.

### 4.9 `kpi-counter.js` — number bands

```html
<span data-counter data-counter-to="3" data-counter-prefix="" data-counter-suffix="" data-counter-decimals="0">3</span>
```

- The authored text content must already be the **final formatted value**. The module never writes `0` before its trigger fires.
- Trigger: element's `top 90%`, once. Duration `1.6s`, linear, `0.12s` delay per index within the nearest `<ul>`/`<ol>`.
- Under `reduced` the final value is written immediately.
- Every fabricated number carries the placeholder marking from CLAUDE.md.

### 4.10 `lenis-scroll.js` — anchor links

Add `data-anchor-link` to an `<a>` **only** when its `href` starts with `#` and the target exists on the same page. Desktop only; on mobile and under `reduced`, Lenis never initialises and the browser's native anchor jump handles it. Never add it to a cross-page link such as `/services#seo`.

## 5. Modules deliberately not reused in Phase 6

| Module | Why not |
|---|---|
| `hero-headline.js`, `hero-arrow.js`, `hero-unfold.js` | Home hero identity. Repeating them dilutes the home page and triples the WebGL/video cost. Inner pages use a plain `h1` with no hook. |
| `testimonial-marquee.js` + `testimonial-dissolve.js` | A single `[data-marquee]` element is queried with `document.querySelector` — the first match on the page wins. Safe today because only `index.html` has one. Adding a second testimonial rail on another page is fine (one per page), but the placeholder-testimonial policy makes duplicating fabricated quotes across pages a worse liability. Deferred until real quotes exist. |
| `peek-carousel.js` | Superseded by the marquee. It early-returns on any element carrying `[data-marquee]`. Do not author a second carousel. |
| `process-dial.js` | Home-only client-specified effect. `services.html` and `about.html` use `tilt-cards.js` for their step lists instead. |

## 6. Acceptance criteria for every Phase 6 page

1. The page loads exactly the four vendor/entry scripts from section 2, in that order, with `defer`, and `main.js` with `type="module"`.
2. `<html>` carries `lang="en"` and `data-header-boot="top"`.
3. The `<head>` anti-flash script from `index.html` line 28 is present, unmodified.
4. Exactly one `<div data-flowmap aria-hidden="true"></div>` exists, immediately after the skip link.
5. The `<header>` and drawer blocks are byte-identical to `index.html` lines 64–101 except for the position of `aria-current="page"`.
6. The `<footer>` block is byte-identical to `index.html` lines 397–425.
7. Every section `<h2>` carries `data-mask-heading` and contains plain text only.
8. Every `<section>` except the first carries `data-curtain`.
9. Every card grid uses `data-reveal-group` on the list and `data-reveal-item` on each item.
10. No element carries both `data-reveal-item` and `data-tilt-card`.
11. No `on*` attribute appears anywhere in the file.
12. No inline `<style>` block appears anywhere in the file.
13. With JavaScript disabled the page renders complete, readable content with no hidden or zero-opacity blocks.
14. No `.js` file under `assets/js/` is created or edited.

## 7. Non-goals

- Do not edit `assets/js/main.js`.
- Do not edit any file in `assets/js/modules/`.
- Do not add a new `data-*` hook that no module queries.
- Do not add a second `[data-flowmap]`, `[data-marquee]`, `[data-dial]`, `[data-hero-headline]`, or `[data-contact-form]` to the site.
- Do not add GSAP, Lenis, or any other library beyond the four scripts in section 2 plus Turnstile on `contact.html`.
