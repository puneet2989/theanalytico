/**
 * reveal-stagger.js
 * Inventory item 12 — Insights grid and other card groups: staggered fade-up.
 *
 * Global rules (spec 08 section 0), repeated here per module-header convention:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export. No default export.
 * 3. ScrollTrigger is registered exactly once, in main.js. Received as an argument here.
 * 4. Lenis is created exactly once, in lenis-scroll.js. Received as an argument here.
 * 5. Exactly one RAF loop in the project: gsap.ticker. Never call requestAnimationFrame here.
 * 6. This module returns a cleanup function.
 * 7. Bail out with a no-op cleanup when prefers-reduced-motion: reduce matches.
 * 8. Bail out with a no-op cleanup when matchMedia('(max-width: 768px)') matches.
 * 9. Never animate width, height, top, or left. Transform and opacity only.
 * 10. will-change on animation start, removed on complete and in cleanup.
 * 11. Reveal start state is set from JS, never CSS. Content is visible with JS disabled.
 * 12. Query elements with data-* attributes only, never class selectors.
 * 13. If no hook elements exist, return a no-op cleanup immediately. Do not throw.
 * 14. Never log to the console in shipped code.
 *
 * Vendor loading note: GSAP, ScrollTrigger and Lenis are self-hosted UMD builds loaded as
 * classic scripts on window. This module receives them as arguments; it does not import them.
 */

const NOOP = () => {};

export function initRevealStagger({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  if (reduced) return NOOP;
  if (isMobile) return NOOP;

  const groups = Array.from(document.querySelectorAll('[data-reveal-group]'));
  const standaloneItems = Array.from(
    document.querySelectorAll('[data-reveal-item]')
  ).filter((item) => !item.closest('[data-reveal-group]'));

  if (groups.length === 0 && standaloneItems.length === 0) return NOOP;

  const triggers = [];
  const allTargets = [];

  const buildTimelineForTargets = (targets, triggerEl) => {
    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top 85%',
      toggleActions: 'play none none none',
      once: true,
      onEnter: () => {
        gsap.set(targets, { willChange: 'transform, opacity' });
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.08,
          onComplete: () => {
            gsap.set(targets, { willChange: 'auto' });
          },
        });
      },
    });
    triggers.push(st);
  };

  groups.forEach((group) => {
    const items = Array.from(group.querySelectorAll('[data-reveal-item]')).filter(
      (item) => item.closest('form') === null
    );
    if (items.length === 0) return;

    gsap.set(items, { y: 20, opacity: 0 });
    allTargets.push(...items);
    buildTimelineForTargets(items, group);
  });

  standaloneItems.forEach((item) => {
    if (item.closest('form') !== null) return;

    gsap.set(item, { y: 20, opacity: 0 });
    allTargets.push(item);
    buildTimelineForTargets(item, item);
  });

  if (allTargets.length === 0) return NOOP;

  return function cleanup() {
    triggers.forEach((st) => st.kill());
    triggers.length = 0;
    gsap.set(allTargets, { clearProps: 'all' });
  };
}
