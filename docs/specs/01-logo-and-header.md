# Spec 01 — Logo, Wordmark, and Two-State Header

Owner agents:
- `html-builder` (Haiku 4.5) — the SVG files and the header markup.
- `css-stylist` (Sonnet 5) — the header styles in `components.css`.
- `motion-engineer` (Sonnet 5) — `assets/js/modules/header-pill.js`.

Phase: 2 for markup and CSS. Phase 3 for motion.

## 1. Files

`html-builder` may create or edit only these:

- `assets/logo/monogram.svg`
- `assets/logo/wordmark.svg`
- `assets/logo/lockup.svg`
- `assets/img/favicon.svg`
- `assets/img/favicon-32.png`
- `assets/img/favicon-180.png`
- `assets/img/og-default.png`
- `site.webmanifest`
- the `<header>` block inside each of the six page HTML files

`css-stylist` may create or edit only:

- `assets/css/components.css`

`motion-engineer` may create or edit only:

- `assets/js/modules/header-pill.js`

Nothing else is in scope for this spec.

## 2. Monogram geometry brief

The monogram is a `tA` ligature. It is inline SVG. It is never an `<img>`.

Hard requirements:

1. Stroke-based construction. Use `stroke` with `fill="none"` on every path.
2. `stroke="currentColor"` on every path. No hardcoded hex inside the SVG.
3. `stroke-width="2"` in a 32-unit coordinate system.
4. `stroke-linecap="round"` and `stroke-linejoin="round"` on every path.
5. `viewBox="0 0 32 32"`. No `width` attribute. No `height` attribute. Size comes from CSS.
6. Single connected form. The lowercase `t` and the uppercase `A` share one continuous outline. There is exactly one `<path>` element for the connected form. A second `<path>` is permitted only for the `A` crossbar.
7. Geometric, derived from Space Grotesk letterforms: flat terminals, near-constant stroke width, no calligraphic modulation, no serifs.
8. `aria-hidden="true"` on the `<svg>` when it sits beside visible wordmark text.
9. `role="img"` plus a `<title>TheAnalytico</title>` child when the monogram appears alone, which is the pinned header state and the favicon.

Construction geometry, in the 32-unit box:

- Optical margin: 3 units on all four sides. Drawn glyph occupies x 3 to 29, y 3 to 29.
- The `t` stem is a vertical line from (9, 4) to (9, 22), then a 4-unit radius quarter turn to the right, ending at (13, 26).
- The `t` crossbar is a horizontal line from (4.5, 11) to (14, 11). It is part of the single connected path via a move-free continuation is not possible, so the crossbar may be the second path; if so it is the only extra path and the `A` crossbar merges into the main path instead. Choose one arrangement, then keep it: total path count must be exactly 2.
- The connection point is (13, 26). From there the stroke rises directly into the left diagonal of the `A`.
- The `A` left diagonal runs from (13, 26) to (20, 8).
- The `A` apex is at (20, 8), joined with `stroke-linejoin="round"`.
- The `A` right diagonal runs from (20, 8) to (27, 26).
- The `A` crossbar is a horizontal line at y 20, from x 16 to x 24.
- The `A` is taller than the `t` x-height and shorter than the `t` ascender, so the pair reads as one word, not two letters.

Optical check before commit: at 24px rendered size the crossbars must not visually merge with the diagonals. If they do, reduce `stroke-width` to `1.75` and note it in the commit summary.

Do not add a circle, square, or badge container around the monogram.
Do not add a gradient.
Do not add a drop shadow.
Do not add any illustration.

## 3. Wordmark lockup

Two lines, stacked, lowercase, sitting to the right of the monogram.

Line 1 text: `the`
Line 2 text: `analytico`

Rules:

1. The wordmark is real text in the header, not an SVG path, so it stays selectable and translatable. `assets/logo/wordmark.svg` exists for the OG image and the manifest only.
2. Font family `var(--font-heading)`.
3. Font weight `var(--fw-medium)`.
4. Letter-spacing `var(--ls-heading)`.
5. Line-height `var(--lh-tight)`.
6. Font size `var(--fs-small)` for line 1 and `var(--fs-h4)` for line 2.
7. Line 1 colour `var(--ink-soft)`. Line 2 colour `var(--ink)`.
8. Both lines are lowercase in the source text. Do not use `text-transform`.
9. Left edges of `the` and `analytico` align flush.
10. Gap between the monogram and the wordmark block is `var(--s-3)`.
11. The whole lockup is one `<a href="/">`.
12. The link has `aria-label="TheAnalytico home"`.
13. The two lines sit inside a single `<span data-logo-wordmark>` so JS animates one element.
14. Monogram height in the `top` state is 40px, set via CSS `height` on the SVG, not an animated property.
15. Monogram height in the `pinned` state is 28px.

Markup shape for the lockup:

```html
<a class="logo" href="/" aria-label="TheAnalytico home" data-logo>
  <svg class="logo__mark" viewBox="0 0 32 32" fill="none" aria-hidden="true" data-logo-mark>
    <!-- exactly two paths, see section 2 -->
  </svg>
  <span class="logo__words" data-logo-wordmark>
    <span class="logo__line1">the</span>
    <span class="logo__line2">analytico</span>
  </span>
</a>
```

## 4. Favicon and OG image set

Required deliverables. All six must exist.

| File | Size | Contents | Notes |
|---|---|---|---|
| `assets/img/favicon.svg` | vector | monogram only | `stroke="#1a1a1a"` is permitted here because SVG files are outside the CSS token rule |
| `assets/img/favicon-32.png` | 32×32 | monogram only | transparent background |
| `assets/img/favicon-180.png` | 180×180 | monogram only, 24-unit inset | solid `#e8f2fa` background, Apple touch icon |
| `assets/img/og-default.png` | 1200×630 | lockup centred, tagline below | background `#e8f2fa`, text `#1a1a1a` |
| `assets/logo/wordmark.svg` | vector | two-line wordmark as paths | used only inside `og-default.png` generation |
| `assets/logo/lockup.svg` | vector | monogram plus wordmark | used only inside `og-default.png` generation |

OG image text, exact:

Line 1: `theAnalytico`
Line 2: `Web design, SEO, paid ads and AI for local businesses`

Head markup for icons, on all six pages:

```html
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/favicon-180.png">
<link rel="manifest" href="/site.webmanifest">
```

`site.webmanifest` contents:

```json
{
  "name": "TheAnalytico",
  "short_name": "theAnalytico",
  "icons": [
    { "src": "/assets/img/favicon-180.png", "sizes": "180x180", "type": "image/png" }
  ],
  "theme_color": "#e8f2fa",
  "background_color": "#e8f2fa",
  "display": "browser"
}
```

## 5. Header states

Exactly two states. Driven by `window.scrollY` only.

| State | Condition | Shell width | Shell background | Monogram | Wordmark | Nav |
|---|---|---|---|---|---|---|
| `top` | `scrollY < 40` | full width, `max-width: var(--container-max)` | transparent | visible, 40px | visible | visible |
| `pinned` | `scrollY >= 40` | centred pill, `max-width: var(--header-pill-max)` | `var(--surface-70)` plus `backdrop-filter: blur(16px)` | visible, 28px | hidden | visible |

The threshold is the integer `40`. It is a pixel value of `window.scrollY`. Do not use a percentage. Do not use a ScrollTrigger start string for this.

The state is written as `data-header-state="top"` or `data-header-state="pinned"` on the `<header>` element.

Hysteresis: switch to `pinned` when `scrollY >= 40`. Switch back to `top` when `scrollY < 30`. The 10px dead band prevents flicker when a user rests the page at exactly 40. Both numbers are literal.

## 6. Header markup

One `<header>` per page, identical across all six pages.

```html
<a class="skip-link" href="#main">Skip to content</a>
<header class="header" data-header data-header-state="top">
  <div class="header__shell" data-header-shell>
    <!-- logo lockup from section 3 -->
    <nav class="header__nav" aria-label="Primary">
      <ul class="header__list">
        <li><a href="/" data-nav-link>Home</a></li>
        <li><a href="/services" data-nav-link>Services</a></li>
        <li><a href="/work" data-nav-link>Work</a></li>
        <li><a href="/insights" data-nav-link>Insights</a></li>
        <li><a href="/about" data-nav-link>About</a></li>
      </ul>
    </nav>
    <a class="btn btn--pill header__cta" href="/contact" data-header-cta>Contact Us</a>
    <button class="header__burger" type="button" aria-expanded="false" aria-controls="mobile-drawer" aria-label="Open menu" data-drawer-toggle>
      <span class="header__burger-bar"></span>
      <span class="header__burger-bar"></span>
    </button>
  </div>
</header>
<div class="drawer" id="mobile-drawer" hidden data-drawer>
  <nav class="drawer__nav" aria-label="Mobile">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/services">Services</a></li>
      <li><a href="/work">Work</a></li>
      <li><a href="/insights">Insights</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact Us</a></li>
    </ul>
  </nav>
</div>
```

Nav order is fixed: Home, Services, Work, Insights, About. Five links.
`Contact Us` is not in the `<ul>`. It is a separate pill button to the right of the nav.
Link hrefs are extensionless because `_redirects` strips `.html`. See spec 09.
The current page's link carries `aria-current="page"`.

## 7. Anti-flash inline script

A page loaded already scrolled must not paint the `top` state and then jump.

Put this one script in `<head>`, after the icon links, before the stylesheets. It is the only inline `<script>` permitted.

```html
<script>if(window.scrollY>=40){document.documentElement.dataset.headerBoot="pinned";}</script>
```

`components.css` reads `html[data-header-boot="pinned"] .header__shell` and applies the pinned resting styles with no transition.
`header-pill.js` clears `document.documentElement.dataset.headerBoot` on init after it sets the real state.

## 8. GSAP header timeline

Module: `assets/js/modules/header-pill.js`. See spec 08 section 4 for the module contract.

Exact timeline properties.

One reusable timeline, created once, paused, then played forward or reversed. Do not create a timeline per scroll event.

```
const tl = gsap.timeline({ paused: true, defaults: { duration: 0.45, ease: "power3.out" } });
```

Timeline tweens, all starting at position 0 so they run together:

| Target | Property | From | To |
|---|---|---|---|
| `[data-header-shell]` | `maxWidth` | `1280px` | `1120px` |
| `[data-header-shell]` | `borderRadius` | `0px` | `999px` |
| `[data-header-shell]` | `paddingTop` | `16px` | `10px` |
| `[data-header-shell]` | `paddingBottom` | `16px` | `10px` |
| `[data-header-shell]` | `backgroundColor` | `rgba(255,255,255,0)` | `rgba(255,255,255,0.7)` |
| `[data-header-shell]` | `boxShadow` | `0 0 0 rgba(26,26,26,0)` | `0 4px 24px rgba(26,26,26,0.08)` |
| `[data-logo-wordmark]` | `opacity` | `1` | `0` |
| `[data-logo-wordmark]` | `width` | `auto` measured px | `0px` |
| `[data-logo-wordmark]` | `xPercent` | `0` | `-8` |
| `[data-logo-mark]` | `scale` | `1` | `0.7` |

Duration: `0.45` seconds for every tween.
Easing: `power3.out` for every tween.
Stagger: none. All tweens are simultaneous.

`backdrop-filter: blur(16px)` is applied by CSS on `[data-header-state="pinned"]`, not by GSAP. GSAP cannot interpolate `backdrop-filter` reliably.

Play rule:
- On crossing to `pinned`, call `tl.play()`.
- On crossing to `top`, call `tl.reverse()`.
- Reverse uses the same 0.45s and the same `power3.out`. Do not use a different reverse ease.

`will-change` rule:
- Add `will-change: max-width, transform, opacity` to `[data-header-shell]` on timeline start.
- Remove `will-change` on `onComplete` and on `onReverseComplete`.

## 9. Documented max-width exception

State this in the module's file header comment, verbatim:

```
// DOCUMENTED EXCEPTION to CLAUDE.md motion rules.
// CLAUDE.md forbids animating width, height, top, and left.
// The header shell is the single documented exception, and only for max-width.
// Reason: the pill must physically reflow from full-bleed to 1120px centred.
// A transform:scaleX() would squash the nav text and the logo strokes.
// Scope of the exception: the maxWidth, paddingTop, paddingBottom, and borderRadius
// tweens on [data-header-shell], and the width tween on [data-logo-wordmark].
// No other element in the project may animate a layout property.
```

Mitigations, all required:

1. `[data-header-shell]` has `contain: layout paint` in CSS so reflow does not escape the header.
2. The header is `position: fixed`, so it is outside normal document flow and cannot shift page content.
3. The header reserves its own height with a fixed `min-height` in both states, so no vertical CLS occurs.
4. `[data-header-shell]` height must be identical in `top` and `pinned` after padding changes. Verify: 40px monogram plus 32px padding equals 28px monogram plus 20px padding is a 20px difference, so `min-height` is set to the larger value, `72px`, in both states, and the monogram is vertically centred. Confirm computed header height is unchanged between states.

`design-reviewer` rejects any layout-property animation not covered by the six tweens listed in section 9's scope line.

## 10. Mobile drawer

Active below the 768px breakpoint. The burger button is `display: none` at 768px and above.

Behaviour, one step per line:

1. Burger click sets `aria-expanded="true"` on `[data-drawer-toggle]`.
2. Burger click removes the `hidden` attribute from `[data-drawer]`.
3. Burger click adds `data-drawer-open="true"` to `<html>`.
4. `<html>[data-drawer-open="true"]` gets `overflow: hidden` in CSS to lock the background.
5. If Lenis is running, call `lenis.stop()` on open and `lenis.start()` on close. On mobile Lenis is not running, so guard the call with a null check.
6. The drawer animates in with `gsap.to` on `yPercent` from `-100` to `0`, duration `0.4`, ease `power3.out`.
7. Drawer links stagger in with `y: 16` to `y: 0` and `opacity: 0` to `opacity: 1`, duration `0.3`, stagger `0.05`, ease `power2.out`.
8. Focus moves to the first drawer link on open.
9. `Escape` closes the drawer.
10. A click on any drawer link closes the drawer.
11. Close reverses the drawer tween, then re-adds `hidden` on completion, then returns focus to the burger button.
12. Focus is trapped inside the drawer while open. Tab from the last link wraps to the first.
13. The drawer sits at `z-index: var(--z-drawer)`.
14. When `prefers-reduced-motion: reduce` matches, the drawer opens and closes with no tween. Set `hidden` and the `data` attributes only.
15. The drawer contains all six links including `Contact Us`. The header CTA pill is hidden below 768px.
16. Do not animate the drawer with `left` or `top`. Use `yPercent`.

## 11. Data hooks JS selects on

This is the complete list. `html-builder` must emit every one. `motion-engineer` must select on these and nothing else.

| Hook | Element | Selected by |
|---|---|---|
| `data-header` | `<header>` | `header-pill.js`, writes `data-header-state` |
| `data-header-state` | `<header>` | CSS, and read by `header-pill.js` |
| `data-header-shell` | inner shell div | `header-pill.js`, tween target |
| `data-logo` | logo `<a>` | reserved, no JS yet |
| `data-logo-mark` | monogram `<svg>` | `header-pill.js`, scale tween target |
| `data-logo-wordmark` | wordmark `<span>` | `header-pill.js`, opacity and width tween target |
| `data-nav-link` | each of five nav `<a>` | reserved for active-state logic |
| `data-header-cta` | Contact Us pill `<a>` | reserved, no JS yet |
| `data-drawer-toggle` | burger `<button>` | `header-pill.js` drawer sub-behaviour |
| `data-drawer` | drawer container | `header-pill.js` drawer sub-behaviour |
| `data-drawer-open` | `<html>` | written by `header-pill.js`, read by CSS |
| `data-header-boot` | `<html>` | written by inline script, read by CSS, cleared by `header-pill.js` |

Do not select header elements by class name in JS. Classes are for CSS only.

## 12. Accessibility requirements

1. One `<header>` per page.
2. `<nav aria-label="Primary">` for the desktop nav.
3. `<nav aria-label="Mobile">` for the drawer nav.
4. Skip link is the first focusable element in the document.
5. Skip link targets `#main`, and every page has `<main id="main">`.
6. Burger has `aria-expanded`, `aria-controls`, and `aria-label`.
7. Burger `aria-label` changes to `Close menu` when open.
8. Nav link colour contrast against `--bg-blue` and against `--surface-70` is at least 4.5:1. `--ink` on `--bg-blue` passes.
9. Every nav link hit area is at least 44px tall on mobile.
10. The state change is decorative. No `aria-live` announcement on scroll.

## 13. Acceptance criteria

1. `assets/logo/monogram.svg` exists and contains exactly two `<path>` elements.
2. Every path in `monogram.svg` has `stroke="currentColor"` and `fill="none"`.
3. `monogram.svg` has `viewBox="0 0 32 32"` and no `width` or `height` attribute.
4. No hex colour appears in `assets/logo/monogram.svg`.
5. The monogram renders as one connected `tA` form with no visible gap between the `t` exit and the `A` left diagonal.
6. The header contains the literal text `the` and `analytico` on two separate lines in the `top` state.
7. All six icon and OG files listed in section 4 exist at the exact paths given.
8. `site.webmanifest` exists at the repo root and parses as JSON.
9. All six pages contain the four icon `<link>` tags from section 4.
10. All six pages contain the two font preload tags from spec 00 section 13.
11. The header nav contains exactly five `<li>` items in the order Home, Services, Work, Insights, About.
12. `Contact Us` is a pill `<a>` outside the `<ul>`, positioned to the right of the nav.
13. At `scrollY = 0` the header has `data-header-state="top"`.
14. At `scrollY = 39` the header still has `data-header-state="top"`.
15. At `scrollY = 40` the header has `data-header-state="pinned"`.
16. Scrolling back to `scrollY = 35` keeps `pinned`. Scrolling to `scrollY = 29` returns to `top`.
17. In `pinned` state the wordmark computed `opacity` is `0` and computed `width` is `0px`.
18. In `pinned` state the shell computed `max-width` is `1120px`.
19. In `pinned` state the shell has `backdrop-filter: blur(16px)`.
20. The transition duration measured from state change to settle is 450ms ±30ms.
21. The GSAP timeline is constructed exactly once. Log a counter in dev and assert it equals 1 after ten scroll toggles.
22. Computed header offsetHeight is identical in `top` and `pinned`, within 1px.
23. CLS contributed by the header state change is 0.000.
24. `will-change` is absent from the shell's computed style when no timeline is running.
25. The file header comment in `header-pill.js` contains the documented exception block from section 9, verbatim.
26. Below 768px the burger is visible and the desktop nav and CTA pill are hidden.
27. At 768px and above the burger is hidden and the desktop nav is visible.
28. Opening the drawer sets `aria-expanded="true"` and moves focus to the first drawer link.
29. `Escape` closes the drawer and returns focus to the burger.
30. Tab from the last drawer link moves to the first drawer link.
31. With `prefers-reduced-motion: reduce`, the drawer opens instantly and no GSAP tween runs.
32. With JS disabled, the header renders in the `top` state, all five nav links and the CTA are visible and clickable, and the wordmark is visible.
33. With JS disabled, the drawer is not reachable, and the nav `<ul>` is still visible at mobile widths. Achieve this with a CSS fallback: `html:not([data-js]) .header__nav { display: flex; }` and `main.js` sets `data-js` on `<html>` at boot.
34. No inline `on*` attribute appears in the header markup.
35. Exactly one inline `<script>` appears in `<head>`, and it is the anti-flash script from section 7.

## 14. Non-goals

Do not add a mega-menu.
Do not add a search field.
Do not add a language switcher.
Do not add a theme toggle.
Do not add social icons to the header.
Do not add a sticky sub-nav.
Do not animate `backdrop-filter` with GSAP.
Do not animate the header with a ScrollTrigger. Use a throttled scroll listener as specified in spec 08 section 4.
Do not change the nav link set or order.
Do not touch `tokens.css`.
Do not touch any page's `<main>` content.
