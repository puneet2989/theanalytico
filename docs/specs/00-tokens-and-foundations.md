# Spec 00 — Tokens and Foundations

Owner agent: `css-stylist` (Sonnet 5).
Phase: 1. Blocking. Nothing else starts until this is merged.

## 1. Files

Create or edit only these files:

- `assets/css/tokens.css`
- `assets/css/base.css`
- `assets/fonts/space-grotesk-500.woff2`
- `assets/fonts/space-grotesk-600.woff2`
- `assets/fonts/inter-400.woff2`
- `assets/fonts/inter-500.woff2`

Do not create `.html` files in this phase.
Do not create `assets/css/components.css` in this phase.
Do not create `assets/css/pages.css` in this phase.
Do not create any `.js` file in this phase.

## 2. Rules for `tokens.css`

`tokens.css` contains custom property declarations only.
The only selectors permitted in `tokens.css` are `:root` and `@font-face`.
No element selectors. No class selectors. No layout rules. No resets.
Every value below is copied literally. Do not round, convert, or "improve" a number.
No hex colour may appear in any file other than `tokens.css`.

## 3. Colour tokens

Write these inside `:root` in `assets/css/tokens.css`.

```css
--ink:        #1a1a1a;
--ink-soft:   #6b6b6b;
--ink-black:  #0a0a0a;
--surface:    #ffffff;
--bg-blue:    #e8f2fa;
--bg-cream:   #f9f0ea;
--bg-grey:    #f3f3f3;
--line:       #e3e3e3;
--accent:     #e5804b;
--accent-2:   #9999ff;
```

Derived colour tokens. Write these too.

```css
--ink-05: rgba(26, 26, 26, 0.05);
--ink-08: rgba(26, 26, 26, 0.08);
--ink-12: rgba(26, 26, 26, 0.12);
--ink-60: rgba(26, 26, 26, 0.60);
--surface-70: rgba(255, 255, 255, 0.70);
--surface-85: rgba(255, 255, 255, 0.85);
--accent-12: rgba(229, 128, 75, 0.12);
--accent-2-12: rgba(153, 153, 255, 0.12);
--focus-ring: #1a1a1a;
```

Usage map. Follow it exactly.

| Token | Used for |
|---|---|
| `--ink` | body text, button fill, logo fill |
| `--ink-soft` | secondary text, captions, meta lines |
| `--ink-black` | all `h1`–`h6` |
| `--surface` | card backgrounds |
| `--bg-blue` | section background, rhythm position 1 |
| `--bg-cream` | section background, rhythm position 2 |
| `--bg-grey` | section background, rhythm position 3 |
| `--line` | 1px borders and dividers |
| `--accent` | doodles, underline marks, chip highlights |
| `--accent-2` | secondary chip highlights only |
| `--surface-70` | header pill background under `backdrop-filter` |
| `--focus-ring` | `:focus-visible` outline colour |

There is no dark mode. Do not add a `prefers-color-scheme` block.

## 4. Fluid type scale

Use `clamp()` only.
Do not write a `font-size` inside any media query anywhere in the project.
Viewport basis for every clamp below is 360px minimum to 1280px maximum.

```css
--fs-display: clamp(3.25rem, 1.4rem + 8.2vw, 8.5rem);
--fs-h1:      clamp(2.5rem, 1.35rem + 5.1vw, 5.5rem);
--fs-h2:      clamp(2rem, 1.3rem + 3.1vw, 3.75rem);
--fs-h3:      clamp(1.5rem, 1.15rem + 1.55vw, 2.5rem);
--fs-h4:      clamp(1.25rem, 1.1rem + 0.67vw, 1.625rem);
--fs-lead:    clamp(1.125rem, 1.02rem + 0.45vw, 1.375rem);
--fs-body:    clamp(1rem, 0.96rem + 0.18vw, 1.125rem);
--fs-small:   clamp(0.875rem, 0.85rem + 0.11vw, 0.9375rem);
--fs-micro:   clamp(0.75rem, 0.73rem + 0.09vw, 0.8125rem);
```

Line-height tokens.

```css
--lh-display: 0.92;
--lh-heading: 1.04;
--lh-sub:     1.2;
--lh-body:    1.6;
--lh-tight:   1.05;
```

Letter-spacing tokens.

```css
--ls-display: -0.04em;
--ls-heading: -0.03em;
--ls-body:    -0.005em;
--ls-caps:    0.08em;
```

Font-weight tokens.

```css
--fw-body:     400;
--fw-medium:   500;
--fw-heading:  600;
```

Weight 700 is forbidden. Weight 800 is forbidden. Weight 900 is forbidden.
Do not use `font-weight: bold` anywhere.
Every `h1`–`h6` uses `--ls-heading` or `--ls-display`.

Type role map.

| Role | Size token | Weight token | Line-height token | Tracking token |
|---|---|---|---|---|
| Hero headline | `--fs-display` | `--fw-medium` | `--lh-display` | `--ls-display` |
| Page `h1` | `--fs-h1` | `--fw-heading` | `--lh-heading` | `--ls-heading` |
| Section `h2` | `--fs-h2` | `--fw-heading` | `--lh-heading` | `--ls-heading` |
| Card `h3` | `--fs-h3` | `--fw-medium` | `--lh-sub` | `--ls-heading` |
| Card `h4` | `--fs-h4` | `--fw-medium` | `--lh-sub` | `--ls-heading` |
| Lead paragraph | `--fs-lead` | `--fw-body` | `--lh-body` | `--ls-body` |
| Body paragraph | `--fs-body` | `--fw-body` | `--lh-body` | `--ls-body` |
| Caption, meta | `--fs-small` | `--fw-body` | `--lh-body` | `--ls-body` |
| Eyebrow label | `--fs-micro` | `--fw-medium` | `--lh-tight` | `--ls-caps` |

## 5. Spacing scale

Exactly ten steps. Do not add an eleventh.

```css
--s-1: 4px;
--s-2: 8px;
--s-3: 12px;
--s-4: 16px;
--s-5: 24px;
--s-6: 32px;
--s-7: 48px;
--s-8: 64px;
--s-9: 96px;
--s-10: 128px;
```

Fluid section padding tokens, built from the scale.

```css
--section-pad-y: clamp(64px, 4vw + 40px, 128px);
--section-pad-x: clamp(20px, 3vw, 48px);
--gap-card: var(--s-5);
--gap-grid: var(--s-6);
```

Any spacing value in any CSS file must be a `--s-*` token, a `--section-pad-*` token, a `--gap-*` token, `0`, or `100%`.
Do not write a raw `px` margin. Do not write a raw `px` padding.
Exception: `1px` borders are allowed as a raw value.

## 6. Radii

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 32px;
--radius-section: 48px;
--radius-pill: 999px;
```

`--radius-section: 48px` is applied to the top-left and top-right corners of every rhythm section.
`--radius-pill` is used for buttons, chips, and the pinned header shell.

## 7. Shadows

```css
--shadow-xs: 0 1px 2px rgba(26, 26, 26, 0.04);
--shadow-sm: 0 2px 8px rgba(26, 26, 26, 0.06);
--shadow-md: 0 8px 24px rgba(26, 26, 26, 0.08);
--shadow-lg: 0 16px 48px rgba(26, 26, 26, 0.10);
--shadow-pill: 0 4px 24px rgba(26, 26, 26, 0.08);
```

Shadows are the only place outside `tokens.css` colour block where an `rgba()` literal appears, and it appears here inside `tokens.css`. It does not appear elsewhere.

## 8. Easings

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-soft: cubic-bezier(0.33, 1, 0.68, 1);
```

GSAP easing names, for reference by `motion-engineer`. These are JS strings, not CSS tokens. Do not put them in `tokens.css`.

- Header state change: `power3.out`
- Heading mask rise: `power3.out`
- Card reveal: `power2.out`
- Counter tween: `none`
- Carousel snap: `power2.out`
- Tilt straighten: `none` when `scrub` is active

## 9. Durations

```css
--dur-instant: 120ms;
--dur-fast: 200ms;
--dur-base: 320ms;
--dur-header: 450ms;
--dur-slow: 600ms;
--dur-reveal: 800ms;
```

`--dur-header: 450ms` matches the 0.45s GSAP header timeline. Keep both numbers in sync.

## 10. Z-index layers

```css
--z-below: -1;
--z-base: 0;
--z-raised: 10;
--z-sticky: 100;
--z-header: 200;
--z-drawer: 300;
--z-cursor: 400;
```

The cursor blob sits above everything. It always carries `pointer-events: none`.

## 11. Container widths

```css
--container-max: 1280px;
--container-narrow: 760px;
--container-text: 66ch;
--header-pill-max: 1120px;
```

`--header-pill-max: 1120px` is the pinned header shell max-width from `CLAUDE.md`.

## 12. Breakpoints

Four breakpoints. Min-width only. Mobile-first.

| Name | Value | Purpose |
|---|---|---|
| `sm` | 640px | two-column card grids |
| `md` | 768px | motion gate boundary, nav switch |
| `lg` | 1024px | three-column grids, desktop hero |
| `xl` | 1280px | container ceiling reached |

CSS custom properties cannot be used inside a media query condition. Therefore write the literal pixel value in the `@media` rule and add the comment `/* md 768 */` style marker after it.

Motion gate boundary. All JS motion is disabled when `matchMedia('(max-width: 768px)')` matches, unless spec 08 marks that module mobile-enabled.

## 13. Font loading plan

Two families. Both self-hosted. Both Latin subset only.

- Space Grotesk: headings, wordmark, monogram-adjacent text. Weights 500 and 600.
- Inter: body, nav, buttons, captions. Weights 400 and 500.

Four `woff2` files total. No `woff`. No `ttf`. No variable font. No Google Fonts URL. No `@import`.

Files, exact paths:

- `assets/fonts/space-grotesk-500.woff2`
- `assets/fonts/space-grotesk-600.woff2`
- `assets/fonts/inter-400.woff2`
- `assets/fonts/inter-500.woff2`

Preload exactly two faces in every page `<head>`. Preload no more than two.

Preloaded face 1: `assets/fonts/inter-400.woff2` — body text, used above the fold on every page.
Preloaded face 2: `assets/fonts/space-grotesk-500.woff2` — hero headline and wordmark, used above the fold on every page.

Do not preload `inter-500.woff2`. Do not preload `space-grotesk-600.woff2`.

Preload markup, placed before the stylesheet links:

```html
<link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/space-grotesk-500.woff2" as="font" type="font/woff2" crossorigin>
```

`@font-face` blocks live in `assets/css/tokens.css`. Every block uses `font-display: swap`.
Every block declares `unicode-range` for the Latin subset:
`unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;`

Family tokens:

```css
--font-heading: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
--font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
```

Fallback metric matching. Do not add a `@font-face` size-adjust override face. Two families with `swap` and a system fallback is sufficient for the CLS budget.

## 14. Section background rhythm rule

Order repeats, top to bottom, on every page, starting after the hero.

1. `--bg-blue`
2. `--bg-cream`
3. `--bg-grey`
4. back to `--bg-blue`

Rules, all mandatory:

- Every rhythm section carries the class `.section` plus one of `.section--blue`, `.section--cream`, `.section--grey`.
- Every rhythm section has `border-top-left-radius: var(--radius-section)` and `border-top-right-radius: var(--radius-section)`.
- Every rhythm section has `border-bottom-left-radius: 0` and `border-bottom-right-radius: 0`.
- Every rhythm section overlaps the section above it by `margin-top: calc(var(--radius-section) * -1)`.
- Every rhythm section has `position: relative` so the overlap stacks correctly.
- Every rhythm section sets `padding-top: calc(var(--section-pad-y) + var(--radius-section))` to absorb the overlap.
- Two adjacent sections never share the same background token.
- The hero section is exempt from the radius and the overlap. The hero background is `--bg-blue`.
- The footer is exempt from the rhythm. Footer background is `--ink`, footer text is `--surface`.

Do not implement the overlap with `transform: translateY()`. It must be `margin-top`, because the visual overlap has to affect document flow.

## 15. Base layer rules for `base.css`

- Modern reset: `*, *::before, *::after { box-sizing: border-box; }`.
- `html { -webkit-text-size-adjust: 100%; }`.
- Do not set `scroll-behavior: smooth` in CSS. Lenis owns smooth scrolling. A CSS value here fights it.
- `body { font-family: var(--font-body); font-size: var(--fs-body); line-height: var(--lh-body); color: var(--ink); background: var(--bg-blue); }`
- `h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); color: var(--ink-black); font-weight: var(--fw-medium); }`
- `img, svg, video { display: block; max-width: 100%; }`
- Every `img` in markup carries explicit `width` and `height` attributes. Enforce in HTML specs, not here.
- `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 3px; }`
- Do not remove focus outlines.
- Add a `.visually-hidden` utility for screen-reader-only text.
- Add a `.skip-link` style; it becomes visible on `:focus`.
- Layout primitives: `.container` uses `max-width: var(--container-max)`, `margin-inline: auto`, `padding-inline: var(--section-pad-x)`.
- Layout primitive `.container--narrow` uses `max-width: var(--container-narrow)`.
- Add a global `@media (prefers-reduced-motion: reduce)` block setting `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important`, `transition-duration: 0.01ms !important` on `*`.

## 16. Reveal start-state rule

Reveal animations must not hide content in CSS.
`base.css` never sets `opacity: 0` on content.
`base.css` never sets a `clip-path` that hides content.
JS sets the start state at runtime. With JS disabled, all content is visible and final.
`motion-engineer` owns start states. See spec 08.

## 17. Acceptance criteria

1. `assets/css/tokens.css` exists and contains only `:root` and `@font-face` blocks.
2. `grep -c "#" assets/css/base.css` returns 0 hex colour literals.
3. `grep -rn "#[0-9a-fA-F]\{3,6\}" assets/css/ --include=*.css` matches lines in `tokens.css` only.
4. All ten spacing tokens `--s-1` through `--s-10` are declared with the exact px values in section 5.
5. `--radius-section` is declared and equals `48px`.
6. All nine `--fs-*` tokens are declared and every one uses `clamp(`.
7. `grep -n "font-size" assets/css/*.css` shows zero `font-size` declarations inside any `@media` block.
8. Exactly four `@font-face` blocks exist.
9. Every `@font-face` block declares `font-display: swap`.
10. Every `@font-face` block declares a `unicode-range`.
11. Exactly four `.woff2` files exist in `assets/fonts/` and no other font format is present.
12. No `font-weight` value above 600 appears in any CSS file.
13. `--z-cursor` is the highest z-index token and equals 400.
14. `--header-pill-max` equals `1120px`.
15. `scroll-behavior: smooth` appears in zero CSS files.
16. `opacity: 0` appears in zero content rules in `base.css`.
17. A `prefers-reduced-motion: reduce` block exists in `base.css`.
18. `.container` max-width resolves to `var(--container-max)`.
19. `:focus-visible` has a visible outline of at least 2px.
20. Three section modifier classes `.section--blue`, `.section--cream`, `.section--grey` exist, each setting only `background`.
21. `.section` sets both top radii to `var(--radius-section)` and both bottom radii to `0`.
22. `.section` sets `margin-top: calc(var(--radius-section) * -1)`.
23. No `transform` is used to create the section overlap.
24. No `@import` appears in any CSS file.
25. No `prefers-color-scheme` block exists.

## 18. Non-goals

Do not write component styles. Nav, cards, buttons, carousel, and footer belong to `components.css` in a later phase.
Do not write page-specific styles.
Do not write any HTML.
Do not write any JS.
Do not add a CSS framework.
Do not add a build step, a preprocessor, or a PostCSS config.
Do not add a dark theme.
Do not add utility classes beyond `.visually-hidden`, `.skip-link`, `.container`, `.container--narrow`.
