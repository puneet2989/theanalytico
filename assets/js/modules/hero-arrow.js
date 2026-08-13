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
  const headElement = document.querySelector('[data-hero-arrow-head]');

  if (!arrowElement || !pathElement) return NOOP;

  // Head path is optional: older single-path markup still works.
  const paths = headElement ? [pathElement, headElement] : [pathElement];
  const lengths = paths.map((path) => path.getTotalLength());

  // Set initial dash state: arrow hidden, ready to draw
  paths.forEach((path, i) => {
    gsap.set(path, { strokeDasharray: lengths[i], strokeDashoffset: lengths[i] });
  });

  if (reduced) {
    // Reduced-motion users must see the finished arrow immediately
    paths.forEach((path) => gsap.set(path, { strokeDashoffset: 0 }));
    return function cleanup() {
      paths.forEach((path) => gsap.set(path, { clearProps: 'all' }));
    };
  }

  // Draw the curve first, then the arrowhead follows on its heels.
  const timeline = gsap.timeline({
    delay: 0.55,
    onStart() {
      paths.forEach((path) => {
        path.style.willChange = 'stroke-dashoffset';
      });
    },
    onComplete() {
      paths.forEach((path) => {
        path.style.willChange = '';
      });
    },
  });

  timeline.to(pathElement, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' });
  if (headElement) {
    timeline.to(headElement, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, '-=0.15');
  }

  return function cleanup() {
    timeline.kill();
    paths.forEach((path) => gsap.set(path, { clearProps: 'all' }));
  };
}
