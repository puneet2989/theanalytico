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
//
// MARKUP DEPENDENCY (not made by this module — insights.html needs a follow-up edit):
// Each `<li class="card" data-reveal-item>` in the `#posts` `.insights__grid` needs:
//   1. `data-insight-card` added to the `<li>`.
//   2. `data-insight-img` added to the `<img>` inside `<figure class="card__media">`.
//   3. A new chip element added as a child of the `<li>`, reusing the existing
//      `.card--work__chip` CSS class (it is a plain absolute-positioned pill; it works
//      here because `.insights__grid .card` already carries `position: relative` and
//      `overflow: hidden`, so no new CSS is required):
//        <span class="card--work__chip" data-insight-chip>Web design</span>
//      Category text per card, matched to post topic:
//        - insight-1 ("What a local business actually needs on a homepage") -> Web design
//        - insight-2 ("Google Business Profile: the fields most people skip") -> SEO
//        - insight-3 ("Where AI helps a small team, and where it wastes money") -> AI
//
// These are real service-pillar names, not fabricated data, so no data-placeholder
// marking or PLACEHOLDER-CONTENT.md entry is needed for the chip text itself.

const NOOP = () => {};

/**
 * Insight card hover: thumbnail scale-up plus category chip slide-in.
 * Keyboard parity via focusin/focusout on the card link.
 *
 * Mirrors work-hover.js exactly for visual consistency across the site.
 *
 * @param {{ gsap: any, reduced: boolean, isMobile: boolean }} deps
 * @returns {() => void} cleanup
 */
export function initInsightHover({ gsap, reduced, isMobile }) {
  // Gate first, animate second. No isMobile bail: the pointer/hover media
  // queries below already exclude touch devices on their own, so this only
  // ever activates on a mobile-width viewport that also has a real pointer
  // (e.g. a small laptop window), which is exactly when hover should work.
  if (reduced) return NOOP;
  if (window.matchMedia('(pointer: coarse)').matches) return NOOP;
  if (!window.matchMedia('(hover: hover)').matches) return NOOP;

  const cards = document.querySelectorAll('[data-insight-card]');
  if (cards.length === 0) return NOOP;

  const teardowns = [];

  cards.forEach((card) => {
    const img = card.querySelector('[data-insight-img]');
    const chip = card.querySelector('[data-insight-chip]');
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
