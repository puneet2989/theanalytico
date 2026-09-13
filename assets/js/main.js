/**
 * assets/js/main.js — entry point. Owner: motion-engineer.
 *
 * Global rules (spec 08 section 0, repeated here per spec):
 * 1. One effect per file. No module imports another module.
 * 2. Every module is an ES module with a single named export.
 * 3. ScrollTrigger is registered exactly once, here.
 * 4. Lenis is created exactly once, in lenis-scroll.js, and passed to every
 *    other module from here.
 * 5. There is exactly one RAF loop in the project: gsap.ticker. The sync
 *    from Lenis to gsap.ticker happens inside lenis-scroll.js, called from
 *    this file first, before any ScrollTrigger-based module. Nothing in
 *    this file calls requestAnimationFrame or adds a second ticker sync.
 * 6. Every module returns a cleanup function (or, for lenis-scroll, an
 *    object containing one). Every cleanup is stored here.
 *
 * VENDOR LOADING OVERRIDE (per task instruction, supersedes spec 08 line 24):
 * GSAP, ScrollTrigger and Lenis are self-hosted UMD builds loaded as classic
 * deferred scripts by index.html. They are available as window.gsap,
 * window.ScrollTrigger and window.Lenis. They are read from the window
 * object below, never imported. Only local modules under
 * assets/js/modules/ are imported as ES modules.
 *
 * CALLING CONVENTION: every module init below is invoked with a single
 * object argument { gsap, ScrollTrigger, lenis, reduced, isMobile }, per
 * this file's task contract.
 */

import { initLenisScroll } from './modules/lenis-scroll.js';
import { initHeaderPill } from './modules/header-pill.js';
import { initContactForm } from './modules/contact-form.js';
import { initHeroHeadline } from './modules/hero-headline.js';
import { initHeroTilt } from './modules/hero-tilt.js';
import { initHeadingMask } from './modules/heading-mask.js';
import { initSectionCurtain } from './modules/section-curtain.js';
import { initFlowmapTrail } from './modules/flowmap-trail.js';
import { initServiceVideos } from './modules/service-videos.js';
import { initWorkHover } from './modules/work-hover.js';
import { initInsightHover } from './modules/insight-hover.js';
import { initPeekCarousel } from './modules/peek-carousel.js';
import { initTiltCards } from './modules/tilt-cards.js';
import { initKpiCounter } from './modules/kpi-counter.js';
import { initRevealStagger } from './modules/reveal-stagger.js';
import { initHeroMorph } from './modules/hero-morph.js';
import { initProcessDial } from './modules/process-dial.js';
import { initProcessPath } from './modules/process-path.js';
import { initTestimonialMarquee } from './modules/testimonial-marquee.js';
import { initTestimonialDissolve } from './modules/testimonial-dissolve.js';
import { initShowcaseHero } from './modules/showcase-hero.js';

// First action: flip the CSS gate so no-JS fallbacks switch off.
document.documentElement.dataset.js = 'true';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

gsap.registerPlugin(ScrollTrigger);

// Mobile's URL bar hides/shows while the user scrolls, changing
// window.innerHeight and firing a resize mid-scrub. Every ScrollTrigger
// with invalidateOnRefresh: true (hero-morph.js's pin included) would
// otherwise recompute its end distance on that resize and jump the scrub
// position. This is the one config call ScrollTrigger provides for
// exactly that case, set once here rather than per module (13 Sep 2026).
ScrollTrigger.config({ ignoreMobileResize: true });

const reducedMQL = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileMQL = window.matchMedia('(max-width: 768px)');
const reduced = reducedMQL.matches;
const isMobile = mobileMQL.matches;

const cleanups = [];

function storeCleanup(result) {
  if (typeof result === 'function') {
    cleanups.push(result);
  } else if (result && typeof result.cleanup === 'function') {
    cleanups.push(result.cleanup);
  }
}

function safeInit(name, fn) {
  try {
    const result = fn();
    storeCleanup(result);
    return result;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[main.js] module failed to initialise:', name, err);
    return null;
  }
}

// 1. lenis-scroll.js first, before any ScrollTrigger module. It owns
// creating the single Lenis instance and syncing it to gsap.ticker.
let lenis = null;
const lenisResult = safeInit('lenis-scroll', () =>
  initLenisScroll({ gsap, ScrollTrigger, lenis: null, reduced, isMobile })
);
if (lenisResult && typeof lenisResult === 'object') {
  lenis = lenisResult.lenis || null;
  if (typeof lenisResult.cleanup === 'function') {
    cleanups.push(lenisResult.cleanup);
  }
}

// 2. header-pill.js second. Must not wait for other modules.
safeInit('header-pill', () =>
  initHeaderPill({ gsap, ScrollTrigger, lenis, reduced, isMobile })
);

// 3. contact-form.js unconditionally, before the reduced-motion/mobile
// gating that every other module applies internally.
safeInit('contact-form', () =>
  initContactForm({ gsap, ScrollTrigger, lenis, reduced, isMobile })
);

// 4. Every other module, in no particular order relative to each other,
// EXCEPT that hero-morph must be in this list rather than after it: it is
// the one module whose pin reserves extra page height (its pin-spacer),
// and every ScrollTrigger created before that spacer exists in the DOM
// measures a page ~1.75 viewport-heights shorter than the page's real,
// final layout. GSAP does not appear to correct this on a later refresh()
// for triggers already created against the shorter layout — confirmed by
// hand for this exact class of bug (see hero-morph.js's own history) —
// so the fix is ordering, not a refresh() call: nothing that creates a
// ScrollTrigger of its own may run before hero-morph does. hero-headline
// specifically moved below hero-morph on 12 Sep 2026 (DESIGN-DIRECTION-v2.md,
// "hero, rebuilt"): its trigger element, the h1, now lives inside the
// pinned stage itself rather than in normal flow after it, so it needs the
// same correctly-measured geometry, not just the pin-spacer's extra height.
const remainingModules = [
  ['hero-tilt', initHeroTilt],
  ['hero-morph', initHeroMorph],
  ['hero-headline', initHeroHeadline],
  ['heading-mask', initHeadingMask],
  ['section-curtain', initSectionCurtain],
  ['flowmap-trail', initFlowmapTrail],
  ['service-videos', initServiceVideos],
  ['work-hover', initWorkHover],
  ['insight-hover', initInsightHover],
  ['peek-carousel', initPeekCarousel],
  ['tilt-cards', initTiltCards],
  ['process-dial', initProcessDial],
  ['process-path', initProcessPath],
  ['showcase-hero', initShowcaseHero],
  ['kpi-counter', initKpiCounter],
  ['reveal-stagger', initRevealStagger],
];

for (const [name, initFn] of remainingModules) {
  safeInit(name, () => initFn({ gsap, ScrollTrigger, lenis, reduced, isMobile }));
}

// 5. testimonial-marquee.js and testimonial-dissolve.js run last, after
// hero-morph above, for the pin-spacer reason in the comment on 4: both
// create their own ScrollTrigger (the marquee's pause-on-scroll-out state,
// the dissolve crossfade per figure), so both used to measure the
// testimonials section's scroll position ~1.75 viewport-heights too early
// and freeze the marquee mid-drift — cut off mid-word at both edges — the
// entire time the section was actually on screen. Their own relative
// order is unchanged: the marquee clones slide DOM to make the loop
// seamless, and cloneNode does not copy a canvas bitmap, so the marquee
// must still run before the dissolve module builds a real canvas for
// every figure, originals and clones alike.
safeInit('testimonial-marquee', () =>
  initTestimonialMarquee({ gsap, ScrollTrigger, lenis, reduced, isMobile })
);
safeInit('testimonial-dissolve', () =>
  initTestimonialDissolve({ gsap, ScrollTrigger, lenis, reduced, isMobile })
);

// Refresh ScrollTrigger once fonts settle, so trigger positions account
// for the final layout metrics.
document.fonts.ready.then(() => {
  ScrollTrigger.refresh();
});

// If the user's reduced-motion preference flips on mid-session, tear down
// every running module rather than leaving live tweens/triggers active.
reducedMQL.addEventListener('change', (event) => {
  if (event.matches) {
    while (cleanups.length) {
      const cleanup = cleanups.pop();
      try {
        cleanup();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[main.js] cleanup failed during reduced-motion change', err);
      }
    }
  }
});
