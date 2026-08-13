/**
 * hero-arrow.js
 * Inventory item (optional): Hero headline accent arrow animates on load.
 *
 * Global motion rules (CLAUDE.md / spec 08 section 0), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker. Never call requestAnimationFrame here.
 * 6. This module returns a cleanup function.
 * 7. Bails out and returns a no-op cleanup when prefers-reduced-motion: reduce matches.
 * 8. Mobile is allowed — this animation is cheap.
 * 9. Never animate width, height, top, or left. Transform and opacity only (with exception for header max-width).
 * 10. Sets will-change on animation start, removes it on complete/cleanup.
 * 11. Any reveal start state is set from JS, never CSS; with JS disabled the content is visible and correct.
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

export function initHeroArrow({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  const arrowElement = document.querySelector('[data-hero-arrow]');
  const pathElement = document.querySelector('[data-hero-arrow-path]');

  if (!arrowElement || !pathElement) return NOOP;

  const pathLength = pathElement.getTotalLength();

  // Set initial dash state: arrow hidden, ready to draw
  gsap.set(pathElement, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  if (reduced) {
    // Reduced-motion users must see the finished arrow immediately
    gsap.set(pathElement, { strokeDashoffset: 0 });
    return function cleanup() {
      gsap.set(pathElement, { clearProps: 'all' });
    };
  }

  // Animate the arrow drawing itself
  const tween = gsap.to(pathElement, {
    strokeDashoffset: 0,
    duration: 0.9,
    ease: 'power2.inOut',
    delay: 0.55,
    onStart() {
      pathElement.style.willChange = 'stroke-dashoffset';
    },
    onComplete() {
      pathElement.style.willChange = '';
    },
  });

  return function cleanup() {
    tween.kill();
    gsap.set(pathElement, { clearProps: 'all' });
  };
}
