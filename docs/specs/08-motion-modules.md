# Spec 08 — Motion modules

Owner agent: `motion-engineer` (Sonnet 5). One agent per module. Phase 3, parallel.
Haiku must not write any file in this spec. GSAP timelines are out of Haiku scope per `AGENTS.md`.

## 0. Global rules

These apply to every module. Repeat them in every module's file header comment.

1. One effect per file. No module imports another module.
2. Every module is an ES module with a single named export. No default export.
3. `ScrollTrigger` is registered exactly once, in `assets/js/main.js`. Modules receive it as an argument.
4. Lenis is created exactly once, in `assets/js/modules/lenis-scroll.js`, and its instance is passed to `main.js`.
5. There is exactly one RAF loop in the project, and it is `gsap.ticker`. Never call `requestAnimationFrame` in a module.
6. Every module returns a cleanup function. `main.js` stores them.
7. Every module bails out and returns a no-op cleanup when `prefers-reduced-motion: reduce` matches.
8. Every module bails out and returns a no-op cleanup when `matchMedia('(max-width: 768px)')` matches, unless its section below says mobile enabled.
9. Never animate `width`, `height`, `top`, or `left`. The only exception is `header-pill.js`, documented in spec 01 section 9.
10. Add `will-change` on animation start. Remove `will-change` on complete, on reverse complete, and in cleanup.
11. Set every reveal start state from JS, never from CSS. With JS disabled, content is visible and final.
12. Query elements with `data-*` attributes only. Never with a class selector.
13. If a module's hook element is absent from the page, return a no-op cleanup immediately. Do not throw.
14. Never log to the console in shipped code.
15. GSAP and ScrollTrigger are loaded as ES modules from `assets/js/vendor/`. Self-hosted. No CDN.

Bail-out helper, duplicated in each module rather than shared, to keep modules independent:

```js
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = window.matchMedia('(max-width: 768px)').matches;
const NOOP = () => {};
```

## 0.1 `main.js` contract

File: `assets/js/main.js`. Owner: `motion-engineer`.

1. Import GSAP and ScrollTrigger from `assets/js/vendor/`.
2. Call `gsap.registerPlugin(ScrollTrigger)` exactly once.
3. Set `document.documentElement.dataset.js = 'true'` as the first statement, so CSS no-JS fallbacks switch off.
4. Import every module listed in sections 1 to 14.
5. Initialise `lenis-scroll.js` first, before any ScrollTrigger module, so `ScrollTrigger.scrollerProxy` is configured before triggers are created.
6. Initialise `header-pill.js` second. It must not wait for other modules.
7. Initialise `contact-form.js` unconditionally, before the reduced-motion check.
8. Initialise every other module after the two checks above.
9. Collect every returned cleanup function into an array.
10. Call `ScrollTrigger.refresh()` once, after all modules are initialised, inside a `requestAnimationFrame` is forbidden; use `ScrollTrigger.refresh()` directly after init and again on the `load` event.
11. Add one `load` listener that calls `ScrollTrigger.refresh()`.
12. Do not add a `resize` listener. ScrollTrigger handles resize internally.
13. Wrap each module init in try and catch, so one failing module does not stop the rest.

## 0.2 Inventory to module map

Exactly one module per inventory item. No item spans two modules. No module covers two items.

| # | Effect inventory item (CLAUDE.md) | Module file | Spec section |
|---|---|---|---|
| 1 | Hero: oversized headline with inline image chips and a hand-drawn accent doodle | `assets/js/modules/hero-headline.js` | 1 |
| 2 | Hero visual: scroll-scrubbed tilt that straightens as it enters | `assets/js/modules/hero-tilt.js` | 2 |
| 3 | Headings: clip-path mask rise, word-by-word stagger | `assets/js/modules/heading-mask.js` | 3 |
| 4 | Header: full bar to floating pill | `assets/js/modules/header-pill.js` | 4 |
| 5 | Section curtain: rounded next-section slide over previous | `assets/js/modules/section-curtain.js` | 5 |
| 6 | Cursor: soft gradient blob, lerped follow, desktop only | `assets/js/modules/cursor-blob.js` | 6 |
| 7 | Service cards: self-running inner loops | `assets/js/modules/service-loops.js` | 7 |
| 8 | Work cards: image scale on hover, label chip slide-in | `assets/js/modules/work-hover.js` | 8 |
| 9 | Peek carousel, drag plus arrow controls | `assets/js/modules/peek-carousel.js` | 9 |
| 10 | Process/capability cards: tilted at rest, rotate straight on enter | `assets/js/modules/tilt-cards.js` | 10 |
| 11 | KPI counters: count up on enter | `assets/js/modules/kpi-counter.js` | 11 |
| 12 | Insights grid: staggered fade-up | `assets/js/modules/reveal-stagger.js` | 12 |
| 13 | Lenis smooth scroll, desktop only | `assets/js/modules/lenis-scroll.js` | 13 |
| — | Not an inventory item. Required by spec 07. | `assets/js/modules/contact-form.js` | 14 |

Fourteen module files. `main.js` makes fifteen files total.

### Correction to earlier specs

Specs 02 to 07 refer to `heading-mask.js` driving the hero headline and the hero doodle. That is superseded here.

- The hero `h1`, its two inline chips, and the hand-drawn doodle are owned by `hero-headline.js`.
- Every other heading on every page, meaning every `h2` and the non-hero `h1` on pages 03 to 07, is owned by `heading-mask.js`.
- `heading-mask.js` must skip any element carrying `data-hero-headline`.

This map wins on any conflict with specs 02 to 07.

## 1. `hero-headline.js`

File: `assets/js/modules/hero-headline.js`
Inventory item: 1

Export signature:
```js
export function initHeroHeadline(gsap, ScrollTrigger) { /* returns cleanup */ }
```

Data hooks:
- `[data-hero-headline]` — the hero `<h1>`. Exactly one per page. Present on `index.html` only.
- `[data-hero-chip]` — the two inline `<img>` chips inside the `h1`.
- `[data-hero-doodle]` — the inline `<svg>` doodle.
- `[data-hero-doodle] path` — the single doodle path, `pathLength="1"`.

Word splitting:
1. Read `element.textContent` once and store it for cleanup restoration.
2. Split on the space character only. Do not split on characters.
3. Wrap each word in `<span class="word"><span class="word__inner">…</span></span>`.
4. The outer `.word` gets `overflow: hidden` and `display: inline-block` set from JS.
5. The inner `.word__inner` gets `display: inline-block` set from JS.
6. Preserve the two `[data-hero-chip]` images in document order. Treat each chip as its own word unit; do not wrap it in a `.word__inner` text span, but do wrap it in a `.word` for the same mask treatment.
7. Preserve the `[data-hero-doodle]` svg in place. It is not part of the word stagger.
8. Do not split with GSAP SplitText. It is a paid plugin.

Trigger:
- No ScrollTrigger. The hero is above the fold. Run on init.
- Delay: `0.15` seconds, to let the fonts settle.

Timeline:

| Step | Target | Property | From | To | Duration | Ease | Stagger |
|---|---|---|---|---|---|---|---|
| 1 | `.word__inner` and chip `.word` children | `yPercent` | `110` | `0` | `0.8` | `power3.out` | `0.06` |
| 1 | same | `opacity` | `0` | `1` | `0.8` | `power3.out` | `0.06` |
| 2 | `[data-hero-chip]` | `scale` | `0.8` | `1` | `0.5` | `power2.out` | `0.08` |
| 2 | `[data-hero-chip]` | `rotate` | `-4` | `0` | `0.5` | `power2.out` | `0.08` |
| 3 | `[data-hero-doodle] path` | `strokeDashoffset` | `1` | `0` | `0.6` | `power2.out` | none |

Step 2 starts at position `-=0.4` relative to step 1.
Step 3 starts at position `+=0.1` after step 2.

Doodle setup:
1. Set `strokeDasharray: 1` and `strokeDashoffset: 1` from JS via `gsap.set`.
2. Never set these in CSS. With JS disabled the doodle must be fully drawn.

Gating: desktop only. Bail out on `REDUCED`. Bail out on `MOBILE`.
On bail-out, do nothing at all. The headline is already visible because CSS never hid it.

Cleanup:
1. Kill the timeline.
2. Restore the original `textContent` and re-insert the chips and the doodle from stored references.
3. Remove `will-change` from every animated element.
4. Clear `gsap.set` inline styles with `gsap.set(targets, { clearProps: 'all' })`.

## 2. `hero-tilt.js`

File: `assets/js/modules/hero-tilt.js`
Inventory item: 2

Export signature:
```js
export function initHeroTilt(gsap, ScrollTrigger) { /* returns cleanup */ }
```

Data hooks:
- `[data-hero-tilt]` — the hero visual `<img>` on `index.html`, and each of the three case study `<img>` elements on `work.html`.
- The module loops over all matches. It does not assume one element.

Trigger, per element:
- `trigger`: the element itself
- `start`: `top 90%`
- `end`: `top 40%`
- `scrub`: `1`
- `invalidateOnRefresh`: `true`

Tween, from state to end state:

| Property | From | To |
|---|---|---|
| `rotate` | `-6` | `0` |
| `scale` | `0.94` | `1` |
| `yPercent` | `6` | `0` |

Duration: not applicable. `scrub: 1` drives progress from scroll position.
Ease: `none`. A scrubbed tween must be linear, or it fights the scroll.

Do not set a `duration` on a scrubbed tween. It is ignored and misleads the next reader.

`transformOrigin`: `50% 100%`, set from JS.

Gating: desktop only. Bail out on `REDUCED`. Bail out on `MOBILE`.

Cleanup:
1. Kill every ScrollTrigger this module created. Store them in an array at creation.
2. Call `gsap.set(elements, { clearProps: 'all' })`.
3. Remove `will-change`.

## 3. `heading-mask.js`

File: `assets/js/modules/heading-mask.js`
Inventory item: 3

Export signature:
```js
export function initHeadingMask(gsap, ScrollTrigger) { /* returns cleanup */ }
```

Data hooks:
- `[data-mask-heading]` — every `h1` and `h2` that should animate. `html-builder` adds this attribute to every section `<h2>` on all six pages, and to the `<h1>` on `services.html`, `work.html`, `insights.html`, `about.html`, and `contact.html`.
- The module must skip any element that also carries `[data-hero-headline]`.

Word splitting: identical rules to section 1, steps 1 to 5. No chips or doodles are involved.

Trigger, per heading:
- `trigger`: the heading element
- `start`: `top 85%`
- `end`: not set. This is a one-shot reveal.
- `toggleActions`: `play none none none`
- `once`: `true`
- `scrub`: not used. A scrubbed heading reveal reads as jittery.

Tween:

| Target | Property | From | To | Duration | Ease | Stagger |
|---|---|---|---|---|---|---|
| `.word__inner` | `yPercent` | `110` | `0` | `0.8` | `power3.out` | `0.06` |
| `.word__inner` | `opacity` | `0` | `1` | `0.8` | `power3.out` | `0.06` |

The clip-path mask is achieved with `overflow: hidden` on the outer `.word` span, set from JS. Do not use an actual `clip-path` property. `overflow: hidden` on an inline-block is cheaper and does not create a containing block for fixed children.

Gating: desktop only. Bail out on `REDUCED`. Bail out on `MOBILE`.

Cleanup:
1. Kill every ScrollTrigger created.
2. Restore original `textContent` on every heading from stored values.
3. `gsap.set(targets, { clearProps: 'all' })`.
4. Remove `will-change`.

Accessibility: splitting a heading into spans must not change its accessible name. Verify the computed accessible name matches the original string after splitting. Do not add `aria-hidden` to the word spans.

## 4. `header-pill.js`

File: `assets/js/modules/header-pill.js`
Inventory item: 4

Export signature:
```js
export function initHeaderPill(gsap) { /* returns cleanup */ }
```

Note: this module does not receive `ScrollTrigger`. It uses a throttled scroll listener, because the trigger is an absolute `scrollY` value of 40, not a position relative to an element.

Data hooks: the full list is in spec 01 section 11. Repeat here for the tween targets:
- `[data-header]` — state attribute written here
- `[data-header-shell]` — tween target
- `[data-logo-mark]` — scale tween target
- `[data-logo-wordmark]` — opacity and width tween target
- `[data-drawer-toggle]`, `[data-drawer]` — drawer sub-behaviour

Trigger:
- Switch to `pinned` when `window.scrollY >= 40`.
- Switch to `top` when `window.scrollY < 30`.
- Between 30 and 39 inclusive, hold the current state. This is the hysteresis dead band.
- Read `scrollY` inside a `scroll` listener registered with `{ passive: true }`.
- Throttle with a boolean latch plus `gsap.ticker.add`, not with `requestAnimationFrame` and not with `setTimeout`.
- Never create a second RAF loop.
- Run the state check once on init, before the first scroll event, so a page loaded mid-scroll is correct.

Timeline: the exact ten tweens, all at position 0, all `duration: 0.45`, all `ease: power3.out`, are specified in spec 01 section 8. Do not restate them differently. Implement exactly that table.

Scrub: none. This is a discrete state change, not a scrubbed tween.
Stagger: none.

Play rule:
- `tl.play()` on entering `pinned`.
- `tl.reverse()` on entering `top`.
- Create the timeline once, at init, paused.
- Do not create a timeline inside the scroll handler.

Boot flag: clear `document.documentElement.dataset.headerBoot` after the first state is applied.

Drawer sub-behaviour: the sixteen rules in spec 01 section 10. Implement all sixteen.

Gating: this module is mobile enabled and always runs.
- It does not bail out on `MOBILE`. The drawer is a mobile feature.
- On `REDUCED`, skip the GSAP timeline entirely and apply the pinned and top styles by toggling `data-header-state` only. CSS then handles the appearance with no transition. The drawer opens and closes with no tween.

Cleanup:
1. Remove the `scroll` listener.
2. Remove the `gsap.ticker` callback.
3. Kill the timeline.
4. Remove drawer listeners: burger click, `Escape` keydown, drawer link clicks, focus-trap keydown.
5. Remove `will-change` from the shell.
6. Reset `data-header-state` to `top`.
7. Remove `data-drawer-open` from `<html>`.

Documented exception: reproduce the block from spec 01 section 9 verbatim as the file header comment.

## 5. `section-curtain.js`

File: `assets/js/modules/section-curtain.js`
Inventory item: 5

Export signature:
```js
export function initSectionCurtain(gsap, ScrollTrigger) { /* returns cleanup */ }
```

Data hooks:
- `[data-curtain]` — every rhythm section. `html-builder` adds it to every `<section class="section">` on all six pages.
- The hero section does not carry `[data-curtain]`.
- The footer does not carry `[data-curtain]`.

Effect: the incoming section slides up over the one above it, with its 48px top radius visible during the movement.

Trigger, per section:
- `trigger`: the section element
- `start`: `top bottom`
- `end`: `top 60%`
- `scrub`: `0.6`
- `invalidateOnRefresh`: `true`

Tween:

| Property | From | To |
|---|---|---|
| `yPercent` | `4` | `0` |

Ease: `none`, because `scrub` is active.
Duration: not applicable under scrub.
Stagger: none. Each section has its own trigger.

Critical constraint: the visual overlap itself is CSS, using `margin-top: calc(var(--radius-section) * -1)` per spec 00 section 14. This module only adds the slide. Do not implement the overlap in JS. Do not animate `margin-top`.

Do not animate `border-radius` here. The radius is static CSS.

Stacking: each section needs `position: relative` and an ascending `z-index` so a later section paints over an earlier one. That is CSS, set by `css-stylist`, not by this module.

Gating: desktop only. Bail out on `REDUCED`. Bail out on `MOBILE`.
On mobile the sections still overlap visually via CSS. Only the slide is skipped.

Cleanup:
1. Kill every ScrollTrigger created.
2. `gsap.set(sections, { clearProps: 'transform' })`.
3. Remove `will-change`.

## 6. `cursor-blob.js`

File: `assets/js/modules/cursor-blob.js`
Inventory item: 6

Export signature:
```js
export function initCursorBlob(gsap) { /* returns cleanup */ }
```

This module does not receive `ScrollTrigger`.

Data hooks:
- `[data-cursor-blob]` — a single `<div>` appended to `<body>` by this module at init. `html-builder` does not create it. The blob is purely decorative and must not exist in the DOM for no-JS users.

Blob element:
1. Created with `document.createElement('div')`.
2. Given `data-cursor-blob` and `class="cursor-blob"`.
3. Appended as the last child of `<body>`.
4. `aria-hidden="true"`.
5. `pointer-events: none` from CSS, mandatory.
6. `position: fixed`, `z-index: var(--z-cursor)` from CSS.
7. Size 320px square, `border-radius: 50%`, `filter: blur(48px)`, from CSS.
8. Background is a radial gradient from `--accent-2` to transparent, from CSS.
9. Opacity 0.35, from CSS.
10. `.cursor-blob` styles live in `components.css`, written by `css-stylist`. This module writes no CSS.

Follow behaviour:
1. Store target x and y from `pointermove`.
2. Lerp current toward target with a factor of `0.08` per tick.
3. Apply with `gsap.set(blob, { x, y, xPercent: -50, yPercent: -50 })`.
4. Drive the lerp from `gsap.ticker.add`. Never from `requestAnimationFrame`.
5. Register `pointermove` with `{ passive: true }`.
6. Hide the blob on `pointerleave` of the document with a `0.3` second opacity tween to `0`.
7. Show it again on `pointerenter` with a `0.3` second opacity tween to `0.35`.

Duration: none for the follow, it is continuous. `0.3` seconds for the show and hide tweens.
Ease: `power2.out` for show and hide.
Stagger: none.
Scrub: none.

Gating: desktop only, and pointer must be fine.
- Bail out on `REDUCED`.
- Bail out on `MOBILE`.
- Bail out when `matchMedia('(hover: hover) and (pointer: fine)')` does not match.
- On any bail-out, do not create the blob element at all.

Cleanup:
1. Remove the `gsap.ticker` callback.
2. Remove the `pointermove`, `pointerleave`, and `pointerenter` listeners.
3. Remove the blob element from the DOM.

## 7. `service-loops.js`

File: `assets/js/modules/service-loops.js`
Inventory item: 7

Export signature:
```js
export function initServiceLoops(gsap, ScrollTrigger) { /* returns cleanup */ }
```

Data hooks:
- `[data-service-loop]` — the decorative block inside each service card. The attribute value names the loop type.
- Three permitted values, and only three: `mockup-slide`, `cycle`, `icon-fan`.
- Every `[data-service-loop]` element has `aria-hidden="true"` and contains no text. Assert this at init; if text is found, bail out for that element.

Inner elements, created by `html-builder` as empty decorative divs:
- `mockup-slide` contains three `[data-loop-item]` bars.
- `cycle` contains three `[data-loop-item]` chips.
- `icon-fan` contains five `[data-loop-item]` shapes.

### 7.1 `mockup-slide`

A stack of bars sliding upward on a loop, suggesting a page scrolling.

| Target | Property | From | To | Duration | Ease | Stagger | Repeat |
|---|---|---|---|---|---|---|---|
| `[data-loop-item]` | `yPercent` | `0` | `-100` | `2.4` | `none` | `0` | `-1` |

`repeat: -1` for infinite. `repeatDelay: 0`.
Use a single timeline with `yoyo: false`. The loop must wrap seamlessly, so duplicate the first bar at the end of the stack and reset with `modifiers`.

### 7.2 `cycle`

Three chips fading through in sequence.

| Target | Property | From | To | Duration | Ease | Stagger | Repeat |
|---|---|---|---|---|---|---|---|
| `[data-loop-item]` | `opacity` | `0` | `1` | `0.5` | `power2.inOut` | `1.2` | `-1` |
| `[data-loop-item]` | `y` | `8` | `0` | `0.5` | `power2.inOut` | `1.2` | `-1` |

Each chip fades out again after `0.7` seconds held. Use a timeline per chip inside one parent timeline with `repeat: -1`.

### 7.3 `icon-fan`

Five shapes fanning out from a stack and returning.

| Target | Property | From | To | Duration | Ease | Stagger | Repeat |
|---|---|---|---|---|---|---|---|
| `[data-loop-item]` | `rotate` | `0` | `-24` to `24` spread | `0.9` | `power2.inOut` | `0.06` | `-1` |
| `[data-loop-item]` | `x` | `0` | `-40` to `40` spread | `0.9` | `power2.inOut` | `0.06` | `-1` |

`yoyo: true` and `repeatDelay: 1.2`, so the fan opens, holds, and closes.
`transformOrigin: '50% 100%'`.

### 7.4 Gating and visibility pausing

Gating: desktop only. Bail out on `REDUCED`. Bail out on `MOBILE`.

Off-screen pausing is mandatory. An infinite loop running off-screen burns battery.

1. Create one ScrollTrigger per card with `trigger` as the card, `start: 'top bottom'`, `end: 'bottom top'`.
2. `onEnter` and `onEnterBack` call `timeline.play()`.
3. `onLeave` and `onLeaveBack` call `timeline.pause()`.
4. `scrub`: not used.
5. Additionally pause every timeline on `document` `visibilitychange` when `document.hidden` is true, and resume when it is false.

Cleanup:
1. Kill every timeline.
2. Kill every ScrollTrigger created.
3. Remove the `visibilitychange` listener.
4. `gsap.set(items, { clearProps: 'all' })`.
5. Remove `will-change` from every item.

## 8. `work-hover.js`

File: `assets/js/modules/work-hover.js`
Inventory item: 8

Export signature:
```js
export function initWorkHover(gsap) { /* returns cleanup */ }
```

This module does not receive `ScrollTrigger`.

Data hooks:
- `[data-work-card]` — each work card `<li>` on `index.html`.
- `[data-work-img]` — the `<img>` inside the card media link.
- `[data-work-chip]` — the label chip inside the card media link.

Trigger: `pointerenter` and `pointerleave` on `[data-work-card]`.
Also `focusin` and `focusout` on the card, so keyboard users get the same feedback. This is mandatory, not optional.

Enter tween:

| Target | Property | From | To | Duration | Ease |
|---|---|---|---|---|---|
| `[data-work-img]` | `scale` | `1` | `1.06` | `0.5` | `power2.out` |
| `[data-work-chip]` | `xPercent` | `-110` | `0` | `0.45` | `power3.out` |
| `[data-work-chip]` | `opacity` | `0` | `1` | `0.45` | `power3.out` |

Chip stagger: `0` relative to the image tween. Both start together.
Scrub: none.

Leave tween: reverse the same properties with `duration: 0.35` and `ease: power2.out`.

Chip start state:
1. Set `xPercent: -110` and `opacity: 0` from JS at init, not from CSS.
2. With JS disabled the chip is visible and in place. That is correct and intended.

Overflow: the card media link needs `overflow: hidden` so the scaled image is clipped. That is CSS, written by `css-stylist`.

Gating: desktop only, and hover must be available.
- Bail out on `REDUCED`.
- Bail out on `MOBILE`.
- Bail out when `matchMedia('(hover: hover)')` does not match.
- On bail-out, do not set the chip start state, so the chip stays visible.

Cleanup:
1. Remove every pointer and focus listener.
2. Kill every tween.
3. `gsap.set([imgs, chips], { clearProps: 'all' })`.
4. Remove `will-change`.

## 9. `peek-carousel.js`

File: `assets/js/modules/peek-carousel.js`
Inventory item: 9

Export signature:
```js
export function initPeekCarousel(gsap) { /* returns cleanup */ }
```

This module does not receive `ScrollTrigger`.

Data hooks:
- `[data-carousel]` — the track container
- `[data-carousel-slide]` — each slide, three on `index.html`
- `[data-carousel-prev]` — previous `<button>`
- `[data-carousel-next]` — next `<button>`

Layout: CSS gives the track `display: flex`, the slides `flex: 0 0 min(78vw, 520px)`, and the gap `var(--s-5)`. The next slide peeks at the right edge. `css-stylist` owns that.

Index model:
1. Track a current index integer, starting at `0`.
2. Slide count is read from the DOM at init.
3. Clamp the index between `0` and `count - 1`. Do not wrap. Wrapping in a testimonial carousel confuses the disabled-button state.

Move tween:

| Target | Property | To | Duration | Ease |
|---|---|---|---|---|
| `[data-carousel]` inner track | `x` | `-(index * (slideWidth + gap))` px | `0.6` | `power2.out` |

Scrub: none.
Stagger: none.

Measure `slideWidth` and `gap` with `getBoundingClientRect` at init and on `resize`. A `resize` listener is permitted here because layout measurement genuinely requires it. Debounce it at 150ms with a `setTimeout` latch. This is the single permitted `setTimeout` in the motion layer.

Drag behaviour:
1. `pointerdown` on the track records the start x and sets `dragging = true`.
2. `pointermove` while dragging applies `gsap.set(track, { x: startX + delta })`.
3. `pointerup` computes the nearest index from the current x and tweens to it with `duration: 0.4`, `ease: power2.out`.
4. A drag shorter than 40px snaps back to the current index.
5. A drag of 40px or more advances one index in the drag direction.
6. Use `setPointerCapture` on `pointerdown` and `releasePointerCapture` on `pointerup`.
7. Do not use GSAP Draggable. It is a paid plugin.
8. Set `touch-action: pan-y` on the track in CSS so vertical page scroll still works on touch.
9. Suppress the click on a slide link if the pointer moved more than 8px, so a drag does not follow a link.

Arrow behaviour:
1. `[data-carousel-prev]` decrements the index.
2. `[data-carousel-next]` increments the index.
3. Set `aria-disabled="true"` on the prev button when index is `0`.
4. Set `aria-disabled="true"` on the next button when index is `count - 1`.
5. Do not use the `disabled` attribute. A disabled button drops out of the tab order mid-interaction.
6. A click on an `aria-disabled` button does nothing.

Keyboard behaviour:
1. `ArrowLeft` and `ArrowRight` on a focused slide or on the region move the index.
2. Focus follows the active slide. Set `tabindex="-1"` on slides and call `focus()` on the newly active slide after the tween completes.

Accessibility:
1. The container has `role="region"`, `aria-label="Client testimonials"`, and `aria-roledescription="carousel"`.
2. Inactive slides get `aria-hidden="true"` is forbidden. All three testimonials must remain in the accessibility tree, because they are the section's content.
3. No autoplay. A quote that moves while being read is hostile.

Gating: mobile enabled. This module runs at every viewport width.
- It does not bail out on `MOBILE`.
- It does bail out on `REDUCED` for the tweens only: on `REDUCED`, jump the index with `gsap.set` instead of `gsap.to`, keep the arrows and the keyboard working, and disable drag momentum. The carousel remains fully functional.

Cleanup:
1. Remove pointer, click, keydown, and resize listeners.
2. Clear the debounce timeout.
3. Kill every tween.
4. `gsap.set(track, { clearProps: 'all' })`.
5. Remove `will-change`.

## 10. `tilt-cards.js`

File: `assets/js/modules/tilt-cards.js`
Inventory item: 10

Export signature:
```js
export function initTiltCards(gsap, ScrollTrigger) { /* returns cleanup */ }
```

Data hooks:
- `[data-tilt-card]` — each process card on `index.html`, each approach card on `work.html`, each "how we work" step on `about.html`.

Rest state and enter state:

| Property | From, the rest tilt | To, straight |
|---|---|---|
| `rotate` | alternating `-3` and `3` by index | `0` |
| `y` | `24` | `0` |
| `opacity` | `0` | `1` |

Index rule: even index gets `-3`, odd index gets `3`. Set the rest state from JS at init.

Trigger, per group not per card:
- `trigger`: the parent `<ol>` or `<ul>` containing the cards
- `start`: `top 80%`
- `toggleActions`: `play none none none`
- `once`: `true`
- `scrub`: not used

Tween:
- Duration: `0.7`
- Ease: `power3.out`
- Stagger: `0.09`

Gating: desktop only. Bail out on `REDUCED`. Bail out on `MOBILE`.
On bail-out, do not set the rest tilt, so cards render straight and visible.

Cleanup:
1. Kill every ScrollTrigger created.
2. `gsap.set(cards, { clearProps: 'all' })`.
3. Remove `will-change`.

## 11. `kpi-counter.js`

File: `assets/js/modules/kpi-counter.js`
Inventory item: 11

Export signature:
```js
export function initKpiCounter(gsap, ScrollTrigger) { /* returns cleanup */ }
```

Data hooks:
- `[data-counter]` — the `<span>` holding the number
- `data-counter-to` — the target value, a string parsed as a float
- `data-counter-prefix` — optional string, e.g. `+`
- `data-counter-suffix` — optional string, e.g. `%` or `s`
- `data-counter-decimals` — integer, `0` or `1`

Start state:
1. The element's inner text in the HTML is already the final value. That is mandatory for no-JS users.
2. On init, JS overwrites the text with the start value.
3. Start value is `0`.

Trigger, per counter:
- `trigger`: the counter element
- `start`: `top 90%`
- `toggleActions`: `play none none none`
- `once`: `true`
- `scrub`: not used

Tween:
- Animate a proxy object's `value` property from `0` to `data-counter-to`.
- Duration: `1.6`
- Ease: `none`. A count-up with an ease looks broken at the tail.
- Stagger: `0.12` across the counters within one group.
- `onUpdate` writes `prefix + value.toFixed(decimals) + suffix` into the element's `textContent`.

Layout safety:
1. `font-variant-numeric: tabular-nums` on the value, from CSS.
2. A `min-width` in `ch` units on the counter span, from CSS, sized to the final string length.
3. Both are required so the count-up produces zero layout shift.

Gating: mobile enabled. This module runs at every viewport width, because a static zero on mobile would be a factual error.
- It does not bail out on `MOBILE`.
- On `REDUCED`, do not animate. Write the final value immediately with `gsap.set` semantics and return a no-op cleanup. Never leave a reduced-motion user looking at `0`.

Placeholder note: three of the four counters on `index.html` carry `data-placeholder="true"`. This module ignores that attribute. Marking is a content concern, not a motion concern.

Cleanup:
1. Kill every ScrollTrigger created.
2. Kill every tween.
3. Write the final value into every counter, so cleanup never leaves a partial number on screen.

## 12. `reveal-stagger.js`

File: `assets/js/modules/reveal-stagger.js`
Inventory item: 12

Export signature:
```js
export function initRevealStagger(gsap, ScrollTrigger) { /* returns cleanup */ }
```

Data hooks:
- `[data-reveal-group]` — a container whose direct children animate in sequence
- `[data-reveal-item]` — an individual element that animates on its own

Both hooks are supported. A `[data-reveal-group]` animates its `[data-reveal-item]` descendants. A standalone `[data-reveal-item]` with no group ancestor animates alone.

Used on: the insights grid on `index.html` and `insights.html`, the combination cards and FAQ items on `services.html`, the principles and sector blocks on `about.html`, the next-steps cards and FAQ items on `contact.html`.

Start state, set from JS:

| Property | From | To |
|---|---|---|
| `y` | `20` | `0` |
| `opacity` | `0` | `1` |

Trigger, per group:
- `trigger`: the group element
- `start`: `top 85%`
- `toggleActions`: `play none none none`
- `once`: `true`
- `scrub`: not used

Tween:
- Duration: `0.6`
- Ease: `power2.out`
- Stagger: `0.08`

Gating: desktop only. Bail out on `REDUCED`. Bail out on `MOBILE`.
On bail-out, do not set the start state, so all items render visible.

Form fields exclusion, mandatory: this module must skip any `[data-reveal-item]` inside a `<form>`. A field that slides in under the pointer is hostile. Filter matches with `element.closest('form') === null`.

Cleanup:
1. Kill every ScrollTrigger created.
2. `gsap.set(items, { clearProps: 'all' })`.
3. Remove `will-change`.

## 13. `lenis-scroll.js`

File: `assets/js/modules/lenis-scroll.js`
Inventory item: 13

Export signature:
```js
export function initLenisScroll(gsap, ScrollTrigger) { /* returns { lenis, cleanup } */ }
```

This module is the one exception to the single-named-export return shape. It returns an object, because `main.js` and the anchor-link behaviour need the instance.

Data hooks:
- `[data-anchor-link]` — every in-page anchor `<a href="#...">`. Present in the services anchor nav and the work jump links.

Lenis is self-hosted at `assets/js/vendor/lenis.min.js`. No CDN.

Instance options:
```js
new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
  touchMultiplier: 1,
  wheelMultiplier: 1,
  autoRaf: false
})
```

`autoRaf: false` is mandatory. Lenis must not start its own RAF loop.

Ticker wiring, exactly this and nothing else:
1. `gsap.ticker.add((time) => lenis.raf(time * 1000));`
2. `gsap.ticker.lagSmoothing(0);`
3. `lenis.on('scroll', ScrollTrigger.update);`
4. Never call `requestAnimationFrame` in this module.
5. Never call `lenis.start()` inside a RAF loop.

ScrollTrigger integration:
1. Do not use `ScrollTrigger.scrollerProxy`. Lenis on the window scroller does not need it, and a proxy is the most common source of broken triggers.
2. Call `ScrollTrigger.refresh()` once after the instance is created.

Anchor links:
1. Attach a `click` listener to every `[data-anchor-link]`.
2. `preventDefault()` on click.
3. Call `lenis.scrollTo(targetElement, { offset: -88, duration: 1.0 })`.
4. The `-88` offset clears the fixed header. It is a literal.
5. After the scroll settles, move focus to the target section with `setAttribute('tabindex', '-1')` then `focus({ preventScroll: true })`, so keyboard users land where the page moved. This is mandatory.
6. Update `location.hash` with `history.pushState`, so the URL still reflects position.
7. If Lenis is not running because the module bailed out, do not attach these listeners. Native anchor behaviour then applies.

Anchor offset without Lenis: `css-stylist` adds `scroll-margin-top: 88px` to every `<section>` with an `id`, so native anchor jumps also clear the header. That covers mobile and reduced-motion users.

Trigger, scrub, duration, stagger: not applicable. This module is infrastructure, not a reveal.

Gating: desktop only.
- Bail out on `REDUCED`. Smooth scroll hijacks input and is a known trigger for motion sickness.
- Bail out on `MOBILE`. `smoothTouch` is off and native mobile scrolling is better.
- On bail-out, return `{ lenis: null, cleanup: NOOP }`.
- `main.js` must handle a `null` lenis without throwing. Every `lenis.stop()` call site needs a null check.

Cleanup:
1. Remove the `gsap.ticker` callback.
2. Call `lenis.off('scroll', ScrollTrigger.update)`.
3. Call `lenis.destroy()`.
4. Remove every anchor click listener.
5. Reset `gsap.ticker.lagSmoothing()` to its default.

## 14. `contact-form.js`

File: `assets/js/modules/contact-form.js`
Not an inventory item. Required by spec 07.

Export signature:
```js
export function initContactForm() { /* returns cleanup */ }
```

This module receives neither `gsap` nor `ScrollTrigger`. It contains no animation.

Data hooks:
- `[data-contact-form]` — the `<form>`
- `[data-form-submit]` — the submit `<button>`
- `[data-form-status]` — the status `<p>`
- `[data-turnstile-slot]` — the Turnstile mount point

Behaviour:
1. Bail out with a no-op cleanup if `[data-contact-form]` is absent. It is present on `contact.html` only.
2. Attach a `submit` listener.
3. `preventDefault()` on submit.
4. Validate client-side per spec 07 section 5.2.
5. On a validation failure, write nothing to `[data-form-status]`, show field errors, and move focus to the first invalid control.
6. On validation success, set the button to `disabled`, write the submitting message, and `fetch('/api/contact', { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })`.
7. Send `FormData` directly. Do not set `Content-Type` manually; the browser sets the multipart boundary. The function must therefore also accept `multipart/form-data`. Amend spec 07 section 9.2 accordingly: accept `application/x-www-form-urlencoded`, `application/json`, and `multipart/form-data`.
8. Include the `Accept: application/json` header so the function returns JSON rather than a 303 redirect.
9. On a 200 with `ok: true`, write the success message, reset the form, and re-enable the button.
10. On a non-200, map the `error` code to the matching status string from spec 07 section 5.2 and re-enable the button.
11. On a network failure, write the server error message and re-enable the button.
12. Read `location.search` at init. If it contains `sent=1`, write the success message. If it contains `error=1`, write the server error message. This covers the no-JS 303 redirect path for users whose JS loads on the next page view.
13. Reset the Turnstile widget with `window.turnstile.reset()` after every submission, successful or not. Guard the call with a check that `window.turnstile` exists.

Gating: none. This module always runs.
- It does not bail out on `REDUCED`.
- It does not bail out on `MOBILE`.
- `main.js` initialises it before the gating checks.

Cleanup:
1. Remove the `submit` listener.
2. Remove every `blur` listener.
3. Re-enable the submit button.

## 15. Acceptance criteria

1. Exactly fifteen files exist: `assets/js/main.js` plus the fourteen modules named in section 0.2.
2. Every module file uses a named `export function`. Zero `export default` statements exist across the JS layer.
3. `grep -rn "registerPlugin" assets/js/` returns exactly one match, in `main.js`.
4. `grep -rn "requestAnimationFrame" assets/js/` returns zero matches.
5. `grep -rn "new Lenis" assets/js/` returns exactly one match, in `lenis-scroll.js`.
6. `grep -rn "gsap.ticker.add" assets/js/` returns exactly three matches: `lenis-scroll.js`, `cursor-blob.js`, `header-pill.js`.
7. `grep -rn "setTimeout" assets/js/modules/` returns exactly one match, the resize debounce in `peek-carousel.js`.
8. `grep -rn "console\." assets/js/` returns zero matches.
9. `grep -rln "prefers-reduced-motion" assets/js/modules/` lists thirteen files. Only `contact-form.js` omits it.
10. No module imports another module. `grep -rn "from './" assets/js/modules/` returns zero matches.
11. `grep -rnE "\.(to|from|fromTo|set)\([^)]*(width|height|top|left):" assets/js/modules/` matches only `header-pill.js`.
12. `header-pill.js` contains the documented exception comment block from spec 01 section 9, verbatim.
13. Every module returns a function, or in the case of `lenis-scroll.js` an object containing a `cleanup` function.
14. Calling every cleanup function leaves zero GSAP tweens active. Assert `gsap.globalTimeline.getChildren().length === 0`.
15. Calling every cleanup function leaves zero ScrollTriggers. Assert `ScrollTrigger.getAll().length === 0`.
16. `grep -rn "will-change" assets/js/modules/` shows every setter paired with a remover in the same file.
17. `grep -rn "opacity: 0" assets/css/` returns zero matches on content selectors.
18. With JS disabled, every page renders with all content visible: no element has computed `opacity: 0` and no element has a computed `transform` that moves it off-screen.
19. With JS disabled, every KPI counter shows its final value.
20. With JS disabled, the hero doodle is fully drawn, with no dash offset.
21. With JS disabled, every work card chip is visible.
22. With `prefers-reduced-motion: reduce`, `kpi-counter.js` shows final values, not zeros.
23. With `prefers-reduced-motion: reduce`, `peek-carousel.js` arrows and keyboard controls still change slides.
24. With `prefers-reduced-motion: reduce`, the mobile drawer still opens and closes.
25. With `prefers-reduced-motion: reduce`, `contact-form.js` still validates and submits.
26. With `prefers-reduced-motion: reduce`, zero GSAP tweens run from the remaining eleven modules.
27. At a 375px viewport width, only `header-pill.js`, `peek-carousel.js`, `kpi-counter.js`, and `contact-form.js` are active.
28. `lenis-scroll.js` returns `{ lenis: null, cleanup }` on mobile, and `main.js` does not throw.
29. Every `[data-service-loop]` timeline pauses when its card leaves the viewport.
30. Every `[data-service-loop]` timeline pauses when `document.hidden` becomes true.
31. `work-hover.js` responds to `focusin` as well as `pointerenter`.
32. `peek-carousel.js` does not set `aria-hidden` on any slide.
33. `peek-carousel.js` uses `aria-disabled`, never the `disabled` attribute.
34. `peek-carousel.js` has no autoplay timer.
35. `reveal-stagger.js` skips every `[data-reveal-item]` inside a `<form>`.
36. `heading-mask.js` skips every element carrying `data-hero-headline`.
37. Splitting a heading into word spans does not change its computed accessible name.
38. Every scrubbed tween uses `ease: 'none'`. `grep` the three scrub sites: `hero-tilt.js`, `section-curtain.js`.
39. No scrubbed tween declares a `duration`.
40. Anchor links move focus to the target section after scrolling.
41. Every `<section>` with an `id` has `scroll-margin-top: 88px` in CSS.
42. A failing module init does not prevent the remaining modules from initialising.
43. Total JS transferred, GSAP and Lenis included, is under 90KB gzipped.
44. Lighthouse Performance is 95 or above on mobile with all modules present.
45. Total Blocking Time is under 200ms on a throttled mobile profile.

## 16. Non-goals

Do not use any paid GSAP plugin. SplitText, Draggable, ScrollSmoother, MorphSVG, and DrawSVG are all out of scope.
Do not add ScrollSmoother. Lenis owns smooth scroll.
Do not add a second smooth-scroll library.
Do not add an intersection-observer reveal system alongside ScrollTrigger.
Do not add a scroll-progress bar.
Do not add page transition animation. This is a multi-page static site with no router.
Do not add a preloader or splash screen. It delays LCP.
Do not add parallax on background images.
Do not add a magnetic-button effect.
Do not add text-scramble or typewriter effects.
Do not add autoplay on the carousel.
Do not add sound.
Do not animate anything in the footer.
Do not animate the form fields.
Do not write CSS from any motion module. All styling is `css-stylist`'s.
Do not edit any `.html` file.
Do not edit any `.css` file.
