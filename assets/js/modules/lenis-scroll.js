/**
 * lenis-scroll.js — inventory item 13, spec 08 section 13.
 *
 * Global rules repeated per spec 08 section 0:
 * 1. One effect per file. No module imports another module.
 * 2. Every module is a single named export. No default export.
 * 3. ScrollTrigger is registered exactly once, in main.js. Modules receive it as an argument.
 * 4. Lenis is created exactly once, here, and its instance is passed to main.js.
 * 5. There is exactly one RAF loop in the project: gsap.ticker. Never call requestAnimationFrame in a module.
 * 6. Every module returns a cleanup function. main.js stores it.
 * 7. Bail out to a no-op when prefers-reduced-motion: reduce matches.
 * 8. Bail out to a no-op when matchMedia('(max-width: 768px)') matches, unless mobile is explicitly enabled.
 * 9. Never animate width, height, top, or left. Not applicable here — no CSS property is tweened.
 * 10. will-change is set on animation start and removed on complete. Not applicable — no tween here.
 * 11. Reveal start states come from JS, never CSS. Not applicable — no reveal here.
 * 12. Query elements with data-* attributes only, never a class selector.
 * 13. If a hook element is absent, return a no-op cleanup immediately. Do not throw.
 * 14. Never log to the console in shipped code.
 *
 * VENDOR LOADING OVERRIDE (supersedes spec 08 line 24 for this file):
 * Lenis 1.3.11 is a self-hosted UMD build at assets/js/vendor/lenis.min.js, loaded as a
 * classic deferred <script>, exposing the global `window.Lenis`. GSAP and ScrollTrigger are
 * likewise already-registered globals (`window.gsap`, `window.ScrollTrigger`) by the time any
 * module runs. No import/export statements are used for any of them — only this module's own
 * `init` function is a named export, per the ES-module wrapper main.js loads modules through.
 *
 * TICKER OWNERSHIP: this module is the single place that calls `gsap.ticker.add` to drive
 * `lenis.raf`. main.js does not add a second ticker callback or any requestAnimationFrame loop
 * for scrolling — it only owns gsap.ticker's overall existence (created once, globally, by the
 * gsap script itself) and calls ScrollTrigger.refresh(). There is exactly one RAF loop in the
 * project (gsap.ticker), and exactly one callback on it that drives Lenis, added right here.
 */
export function initLenisScroll({ gsap, ScrollTrigger, reduced, isMobile }) {
  const NOOP = () => {};

  // Desktop only. On reduced motion or mobile, do not create an instance at all —
  // native scrolling applies, and scroll-margin-top (CSS) handles the anchor offset.
  if (reduced || isMobile) {
    return { lenis: null, cleanup: NOOP };
  }

  const lenis = new window.Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 1,
    wheelMultiplier: 1,
    autoRaf: false
  });

  // Drive Lenis from gsap.ticker — the project's single RAF loop. main.js never calls
  // lenis.raf itself; this is the only tick callback registered for Lenis.
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Lenis on the window scroller needs ScrollTrigger to re-measure on every Lenis scroll
  // event. No ScrollTrigger.scrollerProxy is used — Lenis on window doesn't need one, and
  // a proxy is the most common source of broken triggers per spec 08.
  const onLenisScroll = () => ScrollTrigger.update();
  lenis.on('scroll', onLenisScroll);

  ScrollTrigger.refresh();

  // Anchor links: intercept in-page clicks so smooth scroll and the header offset both apply.
  const anchorLinks = Array.from(document.querySelectorAll('[data-anchor-link]'));
  const anchorHandlers = [];

  anchorLinks.forEach((link) => {
    const handler = (event) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#') || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      lenis.scrollTo(target, {
        offset: -88,
        duration: 1.0,
        onComplete: () => {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });

      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', href);
      }
    };

    link.addEventListener('click', handler);
    anchorHandlers.push({ link, handler });
  });

  function cleanup() {
    gsap.ticker.remove(tick);
    lenis.off('scroll', onLenisScroll);
    lenis.destroy();
    anchorHandlers.forEach(({ link, handler }) => {
      link.removeEventListener('click', handler);
    });
    gsap.ticker.lagSmoothing(500, 33);
  }

  return { lenis, cleanup };
}
