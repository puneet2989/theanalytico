/**
 * hero-headline.js
 * Inventory item 1 (CLAUDE.md) — spec 08 section 1.
 *
 * Global rules (spec 08 section 0), repeated here:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export. No default export.
 * 3. ScrollTrigger is registered once, in main.js. Received as an argument.
 * 4. Lenis is created once, in lenis-scroll.js.
 * 5. The only RAF loop is gsap.ticker. Never call requestAnimationFrame here.
 * 6. Every module returns a cleanup function.
 * 7. Bail out with a no-op cleanup when prefers-reduced-motion: reduce matches.
 * 8. Mobile-enabled: a cheap transform/opacity word stagger with no scrub, so it now
 *    runs on matchMedia('(max-width: 768px)') too instead of bailing.
 * 9. Never animate width, height, top, or left.
 * 10. will-change is set on animation start and removed on complete.
 * 11. Reveal start state is set from JS, never CSS. No-JS users see finished content.
 * 12. Query elements with data-* attributes only. Never a class selector.
 * 13. If the hook element is absent, return a no-op cleanup immediately.
 * 14. Never log to the console in shipped code.
 *
 * Correction to specs 02-07 (spec 08 section 0.2): the hero h1, its two inline
 * chips, and the hand-drawn doodle are owned by this module, not heading-mask.js.
 *
 * Data hooks (index.html, source of truth):
 * - [data-hero-headline] — the hero <h1>, present on index.html only.
 * - [data-hero-chip]     — the two inline <img> chips inside the h1.
 * - [data-hero-doodle]   — the inline <svg> doodle.
 * - [data-hero-doodle] path — the single doodle path, pathLength="1".
 */

const NOOP = () => {};

export function initHeroHeadline({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  if (reduced) return NOOP;

  const heading = document.querySelector('[data-hero-headline]');
  if (!heading) return NOOP;

  const originalText = heading.textContent;
  const originalChildren = Array.from(heading.childNodes);

  const chips = Array.from(heading.querySelectorAll('[data-hero-chip]'));
  const doodle = heading.querySelector('[data-hero-doodle]');
  const doodlePath = doodle ? doodle.querySelector('path') : null;

  // Walk the heading's direct child nodes in document order, splitting text
  // nodes on the space character and treating chip/doodle elements as their
  // own units, so accessible reading order is preserved exactly.
  const fragment = document.createDocumentFragment();
  const wordInners = [];
  const chipWords = [];

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
        // Re-insert the space that separated this part from the next,
        // except after the final part, to preserve the sentence exactly.
        if (i < parts.length - 1) {
          fragment.appendChild(document.createTextNode(' '));
        }
      });
    } else if (node === doodle) {
      // Doodle stays in place, not part of the word stagger.
      fragment.appendChild(node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-hero-chip')) {
      const word = document.createElement('span');
      word.className = 'word';
      word.style.overflow = 'hidden';
      word.style.display = 'inline-block';
      word.appendChild(node);
      fragment.appendChild(word);
      chipWords.push(word);
    } else {
      fragment.appendChild(node);
    }
  });

  heading.textContent = '';
  heading.appendChild(fragment);

  if (wordInners.length === 0 && chipWords.length === 0) {
    // Nothing to animate; restore and bail cleanly.
    heading.textContent = originalText;
    return NOOP;
  }

  const animatedTargets = [...wordInners, ...chipWords];
  gsap.set(animatedTargets, { willChange: 'transform, opacity' });
  if (chips.length > 0) gsap.set(chips, { willChange: 'transform' });
  if (doodlePath) {
    gsap.set(doodlePath, { strokeDasharray: 1, strokeDashoffset: 1, willChange: 'stroke-dashoffset' });
  }

  const clearWillChange = () => {
    gsap.set(animatedTargets, { willChange: 'auto' });
    if (chips.length > 0) gsap.set(chips, { willChange: 'auto' });
    if (doodlePath) gsap.set(doodlePath, { willChange: 'auto' });
  };

  const tl = gsap.timeline({
    delay: 0.15,
    onComplete: clearWillChange,
  });

  tl.fromTo(
    animatedTargets,
    { yPercent: 110, opacity: 0 },
    { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06 }
  );

  if (chips.length > 0) {
    tl.fromTo(
      chips,
      { scale: 0.8, rotate: -4 },
      { scale: 1, rotate: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
      '-=0.4'
    );
  }

  if (doodlePath) {
    tl.to(
      doodlePath,
      { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' },
      '+=0.1'
    );
  }

  return function cleanup() {
    tl.kill();
    clearWillChange();
    gsap.set([...animatedTargets, ...chips, ...(doodlePath ? [doodlePath] : [])], { clearProps: 'all' });
    // Re-insert the original nodes (text, chips, doodle) in their original
    // order, rather than reconstructing via textContent, which would drop
    // the chip <img> and doodle <svg> elements.
    heading.textContent = '';
    originalChildren.forEach((node) => heading.appendChild(node));
  };
}
