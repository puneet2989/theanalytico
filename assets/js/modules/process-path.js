/**
 * process-path.js
 * NEW effect (not previously in the inventory numbered list): a connecting
 * route line drawn between the numbered step cards of a `.process__list` as
 * the section scrolls, reinforcing the sequence — waypoints joined in order,
 * line "travels" from step 1 through to the last step, scrubbed to scroll
 * progress through the list.
 *
 * This is layered on TOP of process-dial.js's step cards without touching
 * that module: process-dial.js owns `[data-dial]`, `[data-dial-arc]`,
 * `[data-dial-arc-path]`, `[data-dial-num]`, and the `data-dial-active`
 * state on the card. This module never reads or writes any of those and
 * never touches `transform` on the card itself — only the SVG/path it
 * creates itself. tilt-cards.js also runs on the same `[data-tilt-card]`
 * cards (rest tilt + rotate-straight-on-enter); this module does not
 * animate the cards either, so the three modules do not fight over the
 * same properties.
 *
 * MARKUP STILL NEEDED (not done by this module — a separate step):
 * add `data-process-path` to the two `<ol class="process__list">` elements:
 *   - about.html   → `<ol class="process__list" data-process-path>` under #how-we-work
 *   - contact.html → `<ol class="process__list" data-placeholder="true" data-process-path>`
 *                     under #next (keep the existing data-placeholder attribute, just add
 *                     this one alongside it)
 * Without that attribute this module finds nothing and no-ops.
 *
 * Hook contract (this module owns and creates all of the following):
 * - [data-process-path]       existing `<ol class="process__list">`, the only element this
 *                              module queries the page for. Everything else below is created
 *                              at runtime by this module, so a no-JS visitor never sees a
 *                              dangling empty SVG — they just see the plain card list.
 * - [data-tilt-card]          already present on every `<li class="card">` step in the list
 *                              (owned by tilt-cards.js / process-dial.js). This module reuses
 *                              it read-only, as the set of waypoints the line passes through
 *                              (the centre of each card's bounding box, not any element inside
 *                              the card), so no new attribute is required on the cards
 *                              themselves and no class selector is used to find them.
 *
 * New elements/attributes for the css-stylist to target:
 * - [data-process-path-svg]   the `<svg>` this module inserts, wrapped in a plain `<li>` (see
 *                              "Valid DOM" below) as the first item of the `<ol>`. Needs to
 *                              render behind the cards and fill the list's content box, so the
 *                              stylist gives `[data-process-path]` (the ol) `position: relative`
 *                              and gives `[data-process-path-svg]` `position: absolute; inset: 0;
 *                              width: 100%; height: 100%; pointer-events: none; z-index: 0;`
 *                              (or similar), plus `overflow: visible` if the route line should be
 *                              allowed to bow outside the grid gutters. Cards need a stacking
 *                              context above it (e.g. `position: relative; z-index: 1` on
 *                              `.card`), already handled in components.css.
 * - [data-process-path-line]  the `<path>` traced in. Stroke colour, width, and dash cap
 *                              (round recommended for a "hand-drawn route" feel) are entirely
 *                              the stylist's call; this module only ever sets
 *                              stroke-dasharray/stroke-dashoffset inline via GSAP, so a
 *                              stylesheet stroke colour/width will not be fought over.
 *
 * Valid DOM: `<ol>` only permits `<li>`, `<script>`, `<template>` as children, so the injected
 * `<svg>` is wrapped in a bare `<li aria-hidden="true">` rather than inserted as a direct child
 * of the `<ol>`. That wrapper `<li>` is given inline `display: contents` (set here, not in CSS)
 * so it generates no box of its own — the absolutely-positioned `[data-process-path-svg]` still
 * resolves its containing block to the nearest *positioned* ancestor, which remains
 * `[data-process-path]` (the ol) itself, exactly as before. This also means the wrapper `<li>`
 * never becomes a grid item in `.process__list`'s grid (an ordinary boxed `<li>` would have
 * consumed a grid cell and shifted every real step card over by one track). No CSS follow-up
 * is required for this change.
 *
 * Column-count gate: `.process__list` is a CSS grid that is single-column only below the
 * 768px breakpoint (components.css: 2 columns at >=768px, 4 columns at >=1024px). A route line
 * drawn between raw card-centre waypoints only reads as one continuous path when the cards sit
 * in a single visual column — across multiple columns/rows the straight card-to-card segments
 * cut diagonally through the grid gutters and render as disconnected floating stubs. So this
 * module measures the *actual current layout* (comparing each card's `getBoundingClientRect().top`
 * — cards sharing a row report the same top) rather than assuming a breakpoint, and skips
 * drawing/animating the line entirely whenever the list is not currently a single column. This
 * is re-checked on every resize, since the column count changes across breakpoints and the line
 * must attach/detach live as the viewport crosses 768px/1024px.
 *
 * Reduced motion: when the line is present (single-column layout), it is shown fully drawn and
 * static (no animated stroke-dashoffset tween, no ScrollTrigger) — the same choice process-dial.js
 * makes for its arc. The reduced branch still attaches the same debounced resize handler as the
 * animated branch, re-running layout (and the column-count check) on resize/orientation change,
 * so a reduced-motion user never sees a stale or diagonal path after a layout shift.
 *
 * Global motion rules (CLAUDE.md / repeated per project convention):
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js; received as an argument here.
 * 4. Lenis is created once elsewhere; never created here.
 * 5. The only RAF loop in the project is gsap.ticker; never call requestAnimationFrame here.
 * 6. Returns a cleanup function.
 * 7. Bails to a static, fully-readable state when `reduced` is true (see above).
 * 8. Runs on mobile too — mobile is naturally single-column, which is exactly the layout this
 *    module requires, so there is no separate mobile gate to declare.
 * 9. Animates only `stroke-dashoffset` on the path. Never width, height, top, or left.
 * 10. will-change is set only while the scroll-linked tween/scrub is live, cleared on
 *     leave/cleanup.
 * 11. Start state (line undrawn) is set from JS at init, never CSS. With JS disabled, no
 *     SVG element exists at all — the list renders as the plain, unmodified card list.
 * 12. The only existing-page element queried is `[data-process-path]`; the only other
 *     element read (not queried into existence) is the already-present `[data-tilt-card]`.
 *     No class selector is used anywhere in this file.
 * 13. If no `[data-process-path]` elements exist, returns a no-op cleanup immediately.
 * 14. Never logs to the console.
 *
 * VENDOR LOADING OVERRIDE: GSAP and ScrollTrigger are self-hosted UMD builds loaded as
 * classic scripts, exposed as window.gsap / window.ScrollTrigger. They are not imported as
 * ES modules here; main.js passes the already-registered globals in.
 */

const NOOP = () => {};
const SVG_NS = 'http://www.w3.org/2000/svg';

export function initProcessPath({ gsap, ScrollTrigger, reduced }) {
  const lists = document.querySelectorAll('[data-process-path]');
  if (!lists.length) return NOOP;

  const teardowns = [];

  lists.forEach((list) => {
    const cards = Array.from(list.querySelectorAll('[data-tilt-card]'));
    if (cards.length < 2) return;

    let wrapperLi = null;
    let svg = null;
    let path = null;
    let pathLength = 0;
    let st = null;

    // Cards sharing a row report the same top; if any two cards share a
    // top, the list is currently laid out in more than one column.
    function isSingleColumn() {
      const tops = cards.map((card) => Math.round(card.getBoundingClientRect().top));
      const seen = new Set();
      for (const t of tops) {
        if (seen.has(t)) return false;
        seen.add(t);
      }
      return true;
    }

    // Waypoint = centre of each step card's bounding box, in list-local coordinates.
    function computePoints() {
      const listRect = list.getBoundingClientRect();
      return cards.map((card) => {
        const r = card.getBoundingClientRect();
        return {
          x: r.left - listRect.left + r.width / 2,
          y: r.top - listRect.top + r.height / 2,
        };
      });
    }

    function layout() {
      if (!svg) return;
      const listRect = list.getBoundingClientRect();
      const w = Math.max(1, Math.round(listRect.width));
      const h = Math.max(1, Math.round(listRect.height));
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const points = computePoints();
      const d = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
        .join(' ');
      path.setAttribute('d', d);

      try {
        pathLength = path.getTotalLength();
      } catch (err) {
        pathLength = 0;
      }
    }

    function buildSvg() {
      wrapperLi = document.createElement('li');
      wrapperLi.setAttribute('aria-hidden', 'true');
      // No box of its own, so it never becomes a grid item in
      // .process__list's grid and never shifts the real step cards.
      wrapperLi.style.display = 'contents';

      svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('data-process-path-svg', '');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');

      path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('data-process-path-line', '');
      path.setAttribute('fill', 'none');
      svg.appendChild(path);
      wrapperLi.appendChild(svg);

      list.insertBefore(wrapperLi, list.firstChild);
    }

    function destroySvg() {
      if (st) {
        st.kill();
        st = null;
      }
      if (path) {
        gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset,willChange' });
      }
      if (wrapperLi && wrapperLi.parentNode) {
        wrapperLi.parentNode.removeChild(wrapperLi);
      }
      wrapperLi = null;
      svg = null;
      path = null;
      pathLength = 0;
    }

    function activateReduced() {
      buildSvg();
      layout();
      if (pathLength) {
        gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: 0 });
      }
    }

    function activateAnimated() {
      buildSvg();
      layout();
      if (pathLength) {
        gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      }

      st = ScrollTrigger.create({
        trigger: list,
        start: 'top 80%',
        end: 'bottom 70%',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: layout,
        onEnter: () => gsap.set(path, { willChange: 'stroke-dashoffset' }),
        onEnterBack: () => gsap.set(path, { willChange: 'stroke-dashoffset' }),
        onLeave: () => gsap.set(path, { willChange: 'auto' }),
        onLeaveBack: () => gsap.set(path, { willChange: 'auto' }),
        onUpdate: (self) => {
          if (!pathLength) return;
          gsap.set(path, { strokeDashoffset: pathLength * (1 - self.progress) });
        },
      });
    }

    // Builds/tears down the connector to match the current column-count
    // gate (B2) and re-lays it out on layout shifts (B4). Safe to call
    // repeatedly: it is idempotent whether or not the SVG currently exists.
    function sync() {
      const singleColumn = isSingleColumn();

      if (!singleColumn) {
        if (svg) destroySvg();
        return;
      }

      if (!svg) {
        if (reduced) activateReduced();
        else activateAnimated();
        return;
      }

      layout();
      if (reduced) {
        if (pathLength) {
          gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: 0 });
        }
      } else if (st) {
        gsap.set(path, { strokeDashoffset: pathLength * (1 - st.progress) });
        st.refresh();
      }
    }

    sync();

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sync, 150);
    };
    window.addEventListener('resize', onResize);

    teardowns.push(() => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      destroySvg();
    });
  });

  if (!teardowns.length) return NOOP;

  return function cleanup() {
    teardowns.forEach((fn) => fn());
    teardowns.length = 0;
  };
}
