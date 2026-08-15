/**
 * tilt-cards.js
 * Inventory item 10 — process / capability cards: tilted at rest, rotate straight on enter.
 * Spec 08 section 10.
 *
 * Global motion rules (repeated per project convention):
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js; this module receives it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates its own instance.
 * 5. There is exactly one RAF loop in the project: gsap.ticker. Never call requestAnimationFrame here.
 * 6. This module returns a cleanup function.
 * 7. Bails out and returns a no-op cleanup when `reduced` is true.
 * 8. Mobile-enabled: a cheap, once-only transform/opacity reveal, so it now runs when
 *    `isMobile` is true too instead of bailing.
 * 9. Never animate width, height, top, or left.
 * 10. will-change is set on animation start and removed on complete and in cleanup.
 * 11. Rest tilt state is set from JS at init, never from CSS. With JS disabled, cards render upright per components.css.
 * 12. Elements are queried with data-* attributes only, never with a class selector.
 * 13. If no [data-tilt-card] elements exist on the page, return a no-op cleanup immediately.
 *
 * VENDOR LOADING OVERRIDE: this project self-hosts GSAP, ScrollTrigger, and Lenis as classic
 * UMD scripts (window.gsap, window.ScrollTrigger, window.Lenis). They are not imported as ES
 * modules here; main.js passes the already-registered globals into this module's init function.
 */

const NOOP = () => {};

export function initTiltCards({ gsap, ScrollTrigger, reduced, isMobile }) {
  if (reduced) return NOOP;

  const cards = document.querySelectorAll('[data-tilt-card]');
  if (!cards.length) return NOOP;

  // Group cards by their parent list element, since the trigger is per group, not per card.
  const groups = new Map();
  cards.forEach((card) => {
    const parent = card.parentElement;
    if (!parent) return;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(card);
  });

  const triggers = [];
  const allCards = [];

  groups.forEach((groupCards, parent) => {
    groupCards.forEach((card, index) => {
      allCards.push(card);
      const restRotate = index % 2 === 0 ? -3 : 3;
      gsap.set(card, {
        rotate: restRotate,
        y: 24,
        opacity: 0,
      });
    });

    const tween = gsap.to(groupCards, {
      rotate: 0,
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.09,
      paused: true,
      onStart: () => {
        gsap.set(groupCards, { willChange: 'transform, opacity' });
      },
      onComplete: () => {
        gsap.set(groupCards, { willChange: 'auto' });
      },
    });

    const st = ScrollTrigger.create({
      trigger: parent,
      start: 'top 80%',
      once: true,
      toggleActions: 'play none none none',
      onEnter: () => tween.play(),
    });

    triggers.push(st);
  });

  return function cleanup() {
    triggers.forEach((st) => st.kill());
    triggers.length = 0;
    gsap.set(allCards, { clearProps: 'all' });
  };
}
