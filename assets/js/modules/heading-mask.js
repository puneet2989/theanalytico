/**
 * heading-mask.js — Inventory item 3: Headings, clip-path mask rise, word-by-word stagger.
 * Spec: docs/specs/08-motion-modules.md section 3.
 *
 * Spec 08 section 0 global rules repeated here:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js; this module only receives it.
 * 4. Lenis is created once in lenis-scroll.js; this module does not touch it.
 * 5. The only RAF loop in the project is gsap.ticker. This module never calls requestAnimationFrame.
 * 6. This module returns a cleanup function.
 * 7. Bails out to a no-op cleanup when prefers-reduced-motion: reduce matches.
 * 8. Bails out to a no-op cleanup when matchMedia('(max-width: 768px)') matches — this module
 *    does not declare mobile support.
 * 9. Never animates width, height, top, or left. Only transform, opacity, and (via overflow:
 *    hidden, per spec section 3) the clip-mask substitute.
 * 10. will-change is set on tween start and removed on complete/cleanup.
 * 11. Reveal start state is set from JS only. With JS disabled, headings are visible and final.
 * 12. Elements are queried by data-* attribute only, never by class.
 * 13. If the hook element is absent, this module returns a no-op cleanup. It never throws.
 * 14. No console logging in shipped code.
 *
 * VENDOR LOADING OVERRIDE (per task, overrides spec 08 line 24): GSAP, ScrollTrigger, and Lenis
 * are self-hosted UMD builds loaded as classic scripts (window.gsap, window.ScrollTrigger,
 * window.Lenis). They are not imported here — main.js passes them in as arguments.
 *
 * Correction per spec 08 section 0.2: this module covers every non-hero heading — every
 * [data-mask-heading] element — and explicitly skips any element also carrying
 * [data-hero-headline], which belongs to hero-headline.js.
 *
 * GSAP SplitText is a paid plugin and is not available. Word splitting below is plain JS,
 * splitting on the space character only, matching spec 08 section 3's word-splitting rules
 * (identical to section 1 steps 1–5).
 */

const NOOP = () => {};

export function initHeadingMask({ gsap, ScrollTrigger, reduced, isMobile }) {
  // Gate first, animate second.
  if (reduced) return NOOP;
  if (isMobile) return NOOP;

  const headings = Array.from(
    document.querySelectorAll('[data-mask-heading]')
  ).filter((el) => !el.hasAttribute('data-hero-headline'));

  if (headings.length === 0) return NOOP;

  const scrollTriggers = [];
  const restoreFns = [];

  headings.forEach((heading) => {
    const originalHTML = heading.innerHTML;
    const originalText = heading.textContent;
    const hadAriaLabel = heading.hasAttribute('aria-label');
    const originalAriaLabel = heading.getAttribute('aria-label');

    // Split on the space character only. Rebuild with explicit text-node spaces so
    // inter-word whitespace survives in the DOM (and in the accessible tree) even
    // though aria-label below also pins the announced name to the original string.
    const words = originalText.split(' ');
    const wordInners = [];

    heading.textContent = '';

    words.forEach((word, i) => {
      if (word !== '') {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.overflow = 'hidden';

        const innerSpan = document.createElement('span');
        innerSpan.className = 'word__inner';
        innerSpan.style.display = 'inline-block';
        innerSpan.textContent = word;

        wordSpan.appendChild(innerSpan);
        heading.appendChild(wordSpan);
        wordInners.push(innerSpan);
      }

      if (i < words.length - 1) {
        heading.appendChild(document.createTextNode(' '));
      }
    });

    // Splitting fragments the text nodes; pin the accessible name back to the original string.
    heading.setAttribute('aria-label', originalText);

    if (wordInners.length === 0) {
      // Nothing to animate (e.g. an all-whitespace heading). Just restore on cleanup.
      restoreFns.push(() => {
        heading.innerHTML = originalHTML;
        if (hadAriaLabel) {
          heading.setAttribute('aria-label', originalAriaLabel);
        } else {
          heading.removeAttribute('aria-label');
        }
      });
      return;
    }

    gsap.set(wordInners, { yPercent: 110, opacity: 0 });

    const tween = gsap.to(wordInners, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.06,
      paused: true,
      onStart: () => {
        wordInners.forEach((el) => {
          el.style.willChange = 'transform, opacity';
        });
      },
      onComplete: () => {
        wordInners.forEach((el) => {
          el.style.willChange = '';
        });
      },
    });

    const trigger = ScrollTrigger.create({
      trigger: heading,
      start: 'top 85%',
      toggleActions: 'play none none none',
      once: true,
      animation: tween,
    });

    scrollTriggers.push(trigger);

    restoreFns.push(() => {
      tween.kill();
      wordInners.forEach((el) => {
        el.style.willChange = '';
      });
      gsap.set(wordInners, { clearProps: 'all' });
      heading.innerHTML = originalHTML;
      if (hadAriaLabel) {
        heading.setAttribute('aria-label', originalAriaLabel);
      } else {
        heading.removeAttribute('aria-label');
      }
    });
  });

  return function cleanup() {
    scrollTriggers.forEach((trigger) => trigger.kill());
    restoreFns.forEach((fn) => fn());
  };
}
