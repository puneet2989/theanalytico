/**
 * hero-tilt.js
 * Inventory item 2: Hero visual, scroll-scrubbed tilt that straightens as it enters.
 *
 * Global motion rules (CLAUDE.md / spec 08 section 0), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker. Never call requestAnimationFrame here.
 * 6. This module returns a cleanup function.
 * 7. Bails out and returns a no-op cleanup when prefers-reduced-motion: reduce matches.
 * 8. Bails out and returns a no-op cleanup when matchMedia('(max-width: 768px)') matches.
 * 9. Never animate width, height, top, or left. Transform only.
 * 10. Sets will-change on animation start, removes it on complete/reverse-complete/cleanup.
 * 11. Any reveal start state is set from JS, never CSS; with JS disabled the image is visible and correct.
 * 12. Queries elements with data-* attributes only, never a class selector.
 * 13. If the hook element is absent, returns a no-op cleanup immediately. Does not throw.
 * 14. Never logs to the console.
 *
 * VENDOR LOADING OVERRIDE (project instruction, overrides spec 08 line 24 / section 0 item 15):
 * GSAP, ScrollTrigger and Lenis are self-hosted UMD builds loaded as classic scripts in the page,
 * exposed as window.gsap / window.ScrollTrigger / window.Lenis. They are NOT imported as ES modules
 * here. main.js passes them in as arguments.
 */

const NOOP = () => {};

export function initHeroTilt({ gsap, ScrollTrigger, reduced, isMobile }) {
  // Gate first, animate second.
  if (reduced) return NOOP;
  if (isMobile) return NOOP;

  const elements = document.querySelectorAll('[data-hero-tilt]');
  if (elements.length === 0) return NOOP;

  const triggers = [];

  elements.forEach((el) => {
    // Start state, set from JS, not CSS. With JS disabled the image is visible and correctly
    // positioned because no CSS ever applies the tilt.
    gsap.set(el, {
      rotate: -6,
      scale: 0.94,
      yPercent: 6,
      transformOrigin: '50% 100%',
    });

    const tween = gsap.to(el, {
      rotate: 0,
      scale: 1,
      yPercent: 0,
      ease: 'none',
      onStart() {
        el.style.willChange = 'transform';
      },
      onComplete() {
        el.style.willChange = '';
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        end: 'top 40%',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  return function cleanup() {
    triggers.forEach((st) => st.kill());
    gsap.set(elements, { clearProps: 'all' });
    elements.forEach((el) => {
      el.style.willChange = '';
    });
  };
}
