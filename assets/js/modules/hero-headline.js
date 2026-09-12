/**
 * hero-headline.js
 * Inventory item 2 (CLAUDE.md): kinetic headline, word-by-word clip-path
 * reveal. Timed to when the heading scrolls into view rather than a fixed
 * on-load delay — it sits immediately after the pinned hero-morph stage
 * (see hero-morph.js), so scrolling it into view naturally coincides with
 * the morph video resolving, per CLAUDE.md's "timed to the hero morph's
 * resolution rather than a fixed delay."
 *
 * Global motion rules (CLAUDE.md), repeated here:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export. No default export.
 * 3. ScrollTrigger is registered once, in main.js. Received as an argument.
 * 4. Lenis is created once, in lenis-scroll.js.
 * 5. The only RAF loop is gsap.ticker. Never call requestAnimationFrame here.
 * 6. Every module returns a cleanup function.
 * 7. Bail out with a no-op cleanup when prefers-reduced-motion: reduce matches.
 * 8. Mobile-enabled: a cheap transform/opacity word stagger, no scrub.
 * 9. Never animate width, height, top, or left.
 * 10. will-change is set on animation start and removed on complete.
 * 11. Reveal start state is set from JS, never CSS. No-JS users see finished content.
 * 12. Query elements with data-* attributes only. Never a class selector.
 * 13. If the hook element is absent, return a no-op cleanup immediately.
 * 14. Never log to the console in shipped code.
 *
 * Data hooks (index.html, source of truth):
 * - [data-hero-headline] — the hero <h1>, present on index.html only.
 */

const NOOP = () => {};

export function initHeroHeadline({ gsap, ScrollTrigger, reduced, isMobile }) {
  if (reduced) return NOOP;

  const heading = document.querySelector('[data-hero-headline]');
  if (!heading) return NOOP;

  const originalChildren = Array.from(heading.childNodes);

  // Walk the heading's direct child nodes in document order, splitting text
  // nodes on the space character, so accessible reading order is preserved
  // exactly and no-JS users see the original text node structure untouched.
  const fragment = document.createDocumentFragment();
  const wordInners = [];

  originalChildren.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(' ');
      parts.forEach((part, i) => {
        if (part.length > 0) {
          const word = document.createElement('span');
          word.className = 'word';
          word.style.overflow = 'hidden';
          word.style.display = 'inline-block';

          const inner = document.createElement('span');
          inner.className = 'word__inner';
          inner.style.display = 'inline-block';
          inner.textContent = part;

          word.appendChild(inner);
          fragment.appendChild(word);
          wordInners.push(inner);
        }
        if (i < parts.length - 1) {
          fragment.appendChild(document.createTextNode(' '));
        }
      });
    } else {
      fragment.appendChild(node);
    }
  });

  heading.textContent = '';
  heading.appendChild(fragment);

  if (wordInners.length === 0) {
    heading.textContent = originalChildren.map((n) => n.textContent || '').join('');
    return NOOP;
  }

  gsap.set(wordInners, { willChange: 'transform, opacity' });

  const clearWillChange = () => {
    gsap.set(wordInners, { willChange: 'auto' });
  };

  const tween = gsap.fromTo(
    wordInners,
    { yPercent: 110, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
      onComplete: clearWillChange,
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        toggleActions: 'play none none none',
        once: true,
      },
    }
  );

  return function cleanup() {
    if (tween.scrollTrigger) tween.scrollTrigger.kill();
    tween.kill();
    clearWillChange();
    gsap.set(wordInners, { clearProps: 'all' });
    heading.textContent = '';
    originalChildren.forEach((node) => heading.appendChild(node));
  };
}
