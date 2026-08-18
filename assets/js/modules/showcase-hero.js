/**
 * showcase-hero.js
 * Full-bleed video section, work.html's #showcase — a mid-page section
 * (not the page hero, that's #intro).
 *
 * Parallax: the section pins in place (video keeps looping, position stays
 * fixed) for exactly its own height of scroll (`end: 'bottom top'`), with
 * `pinSpacing: false` — no spacer reserves that height in the document, so
 * #projects (right after it in the DOM, no extra markup or data hook
 * needed) immediately occupies the reclaimed space and scrolls up through
 * it at normal 1:1 scroll speed while the video sits still underneath.
 * Both elements get `position: relative` from the shared `.section` class
 * already, so #projects — later in the DOM, same z-index:auto — paints
 * above the fixed video with no explicit z-index needed.
 *
 * (An earlier version drove #projects with a hand-rolled scroll-synced
 * transform on top of the pin. Unnecessary: pinSpacing: false already
 * produces this exact overlap as a side effect of how pin/spacer sizing
 * works, and is the standard recipe for this effect — no extra tween to
 * get out of sync with the pin's own scroll math.)
 *
 * Global rules (spec 08 section 0), repeated here:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export. No default export.
 * 3. ScrollTrigger is registered once, in main.js. Received as an argument.
 * 6. Returns a cleanup function.
 * 7. Bail out with a no-op cleanup when prefers-reduced-motion: reduce
 *    matches. The section's HTML is already the fully visible, finished
 *    state (reveal start state is set from JS below, never from CSS), so
 *    bailing here leaves correct, readable content on screen.
 * 9. Never animate width, height, top, or left.
 * 12. Query elements with data-* attributes only. Never a class selector.
 * 13. If the hook element is absent, return a no-op cleanup immediately.
 * 14. Never log to the console in shipped code.
 *
 * Mobile: the entrance animation is cheap (transform/opacity) and runs on
 * mobile too. The background video does not: it is skipped on
 * matchMedia('(max-width: 768px)') to avoid the fetch/decode cost on a
 * mobile connection. The CSS gradient in .showcase-hero__bg and the
 * <video poster> stay as the mobile background.
 *
 * Video loads via fetch-to-Blob, not a plain network src. Not required for
 * a non-seeking autoplay loop the way it was for the old pinned-scrub
 * video, but kept for consistency with the rest of the site's video
 * handling and to sidestep partial-load edge cases on Cloudflare's static
 * asset hosting.
 */

const NOOP = () => {};

export function initShowcaseHero({ gsap, ScrollTrigger, reduced, isMobile }) {
  const section = document.querySelector('[data-showcase-hero]');
  if (!section) return NOOP;

  if (reduced) return NOOP;

  const EASE = 'power3.out';
  const fadeUps = section.querySelectorAll('[data-showcase-hero-fade-up]');
  const words = section.querySelectorAll('[data-showcase-hero-word]');

  gsap.set([...fadeUps, ...words], { willChange: 'transform, opacity' });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      toggleActions: 'play none none none',
      once: true,
    },
    onComplete: () => gsap.set([...fadeUps, ...words], { willChange: 'auto' }),
  });

  if (fadeUps.length > 0) {
    tl.from(fadeUps, {
      opacity: 0,
      y: 32,
      duration: 0.6,
      ease: EASE,
      stagger: 0.1,
    }, 0);
  }

  if (words.length > 0) {
    tl.from(words, {
      yPercent: 110,
      duration: 0.7,
      ease: EASE,
      stagger: 0.14,
    }, 0.25);
  }

  // Pin: desktop only. ScrollTrigger's pin flips the section to
  // position: fixed for the pin's duration — reliable on desktop, but a
  // common source of jank/scroll-jump bugs on mobile Safari, so it is
  // skipped there in favour of the section just scrolling normally.
  let pinTrigger = null;
  if (!isMobile) {
    pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
  }

  let objectUrl = null;
  let abortController = null;

  if (!isMobile) {
    const video = section.querySelector('[data-showcase-hero-video]');
    const source = video ? video.querySelector('source') : null;

    if (video && source && source.src) {
      abortController = new AbortController();
      fetch(source.src, { signal: abortController.signal })
        .then((res) => (res.ok ? res.blob() : Promise.reject()))
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob);
          video.src = objectUrl;
          video.play().catch(() => {});
        })
        .catch(() => {
          // Leaves the CSS gradient placeholder (and poster) visible.
        });
    }
  }

  return function cleanup() {
    tl.scrollTrigger?.kill();
    tl.kill();
    if (pinTrigger) pinTrigger.kill();
    gsap.set([...fadeUps, ...words], { clearProps: 'all' });
    if (abortController) abortController.abort();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  };
}
