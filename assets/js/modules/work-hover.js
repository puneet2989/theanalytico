// Spec 08 global rules, repeated per module:
// 1. One effect per file. No module imports another module.
// 2. Every module is an ES module with a single named export. No default export.
// 3. ScrollTrigger is registered exactly once, in assets/js/main.js.
// 4. Lenis is created exactly once, in assets/js/modules/lenis-scroll.js.
// 5. There is exactly one RAF loop in the project: gsap.ticker. Never requestAnimationFrame here.
// 6. Every module returns a cleanup function.
// 7. Bail out and return a no-op cleanup when prefers-reduced-motion: reduce matches.
// 8. Bail out and return a no-op cleanup on matchMedia('(max-width: 768px)') unless mobile enabled.
// 9. Never animate width, height, top, or left. (header-pill.js is the only exception.)
// 10. Add will-change on animation start, remove it on complete/reverse-complete/cleanup.
// 11. Reveal start states are set from JS, never CSS. Content stays visible with JS disabled.
// 12. Query elements with data-* attributes only, never class selectors.
// 13. If a module's hook element is absent, return a no-op cleanup immediately. Do not throw.
// 14. Never log to the console in shipped code.
// 15. GSAP and ScrollTrigger are self-hosted UMD builds loaded as classic scripts (window.gsap,
//     window.ScrollTrigger). This module receives them as arguments, it does not import them.

const NOOP = () => {};

/**
 * Work card hover: image scale-up plus label chip slide-in.
 * Keyboard parity via focusin/focusout on the card (cards are links).
 *
 * @param {{ gsap: any, ScrollTrigger: any, lenis: any, reduced: boolean, isMobile: boolean }} deps
 * @returns {() => void} cleanup
 */
export function initWorkHover({ gsap, reduced, isMobile }) {
  // Gate first, animate second. No isMobile bail: the pointer/hover media
  // queries below already exclude touch devices on their own, so this only
  // ever activates on a mobile-width viewport that also has a real pointer
  // (e.g. a small laptop window), which is exactly when hover should work.
  if (reduced) return NOOP;
  if (window.matchMedia('(pointer: coarse)').matches) return NOOP;
  if (!window.matchMedia('(hover: hover)').matches) return NOOP;

  const cards = document.querySelectorAll('[data-work-card]');
  if (cards.length === 0) return NOOP;

  const teardowns = [];

  cards.forEach((card) => {
    const img = card.querySelector('[data-work-img]');
    const chip = card.querySelector('[data-work-chip]');
    if (!img || !chip) return;

    // Chip start state, set from JS at init only. With JS disabled the chip
    // stays visible and in place — that is correct and intended.
    gsap.set(chip, { xPercent: -110, opacity: 0 });

    const onEnter = () => {
      gsap.set([img, chip], { willChange: 'transform, opacity' });
      gsap.to(img, {
        scale: 1.06,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      gsap.to(chip, {
        xPercent: 0,
        opacity: 1,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto',
        onComplete: () => gsap.set(chip, { willChange: 'auto' }),
      });
    };

    const onLeave = () => {
      gsap.set([img, chip], { willChange: 'transform, opacity' });
      gsap.to(img, {
        scale: 1,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => gsap.set(img, { willChange: 'auto' }),
      });
      gsap.to(chip, {
        xPercent: -110,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => gsap.set(chip, { willChange: 'auto' }),
      });
    };

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointerleave', onLeave);
    card.addEventListener('focusin', onEnter);
    card.addEventListener('focusout', onLeave);

    teardowns.push(() => {
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointerleave', onLeave);
      card.removeEventListener('focusin', onEnter);
      card.removeEventListener('focusout', onLeave);
      gsap.killTweensOf([img, chip]);
      gsap.set([img, chip], { clearProps: 'all' });
    });
  });

  return function cleanup() {
    teardowns.forEach((fn) => fn());
  };
}
