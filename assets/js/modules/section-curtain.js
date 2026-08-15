/**
 * section-curtain.js
 * Inventory item 5 — rounded next-section slide over previous.
 *
 * Global rules (spec 08 section 0), repeated here per convention:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js and passed in.
 * 4. Lenis is created once in lenis-scroll.js and passed in.
 * 5. gsap.ticker is the only RAF loop. Never call requestAnimationFrame here.
 * 6. Returns a cleanup function.
 * 7. Bails out with a no-op cleanup when prefers-reduced-motion: reduce.
 * 8. Mobile-enabled: a cheap scroll-scrubbed yPercent tween, no pinning, so it now
 *    runs on matchMedia(max-width: 768px) too instead of bailing.
 * 9. Never animate width, height, top, or left.
 * 10. will-change set on start, removed on complete/reverse-complete/cleanup.
 * 11. Reveal/slide start state is set from JS; with JS disabled the CSS overlap alone is fully readable.
 * 12. Query elements with data-* attributes only, never a class selector.
 * 13. No-op cleanup immediately if the data hook is absent.
 * 14. Never console.log in shipped code.
 * 15. GSAP/ScrollTrigger/Lenis are self-hosted UMD globals passed in as arguments — no imports here.
 */
export function initSectionCurtain({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  const noop = () => {};

  if (reduced) return noop;

  const sections = document.querySelectorAll('[data-curtain]');
  if (!sections.length) return noop;

  const triggers = [];

  sections.forEach((section) => {
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'top 60%',
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: () => {
        gsap.set(section, { willChange: 'transform' });
      },
      onLeave: () => {
        gsap.set(section, { willChange: 'auto' });
      },
      onLeaveBack: () => {
        gsap.set(section, { willChange: 'auto' });
      },
    });

    gsap.fromTo(
      section,
      { yPercent: 4 },
      {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: trigger,
      }
    );

    triggers.push(trigger);
  });

  return function cleanup() {
    triggers.forEach((trigger) => trigger.kill());
    gsap.set(sections, { clearProps: 'transform', willChange: 'auto' });
  };
}
