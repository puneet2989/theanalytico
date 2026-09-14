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
import { initServicesPin } from './modules/services-pin.js';
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
// with invalidateOnRefresh: true (hero-headline.js's pin included) would
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
// EXCEPT that hero-headline and services-pin must be first, in that
// order: both pin (services-pin.js added 15 Sep 2026, on desktop/motion-
// allowed only), reserving page height via a ScrollTrigger pin-spacer, and
// every ScrollTrigger created before a given spacer exists in the DOM
// measures a page shorter than its real, final layout. GSAP does not
// appear to correct this on a later refresh() for triggers already
// created against the shorter layout — confirmed by hand for this exact
// class of bug — so the fix is ordering, not a refresh() call: nothing
// that creates a ScrollTrigger of its own may run before both pins do.
// services-pin.js sits below the hero in the page, so it must still come
// after hero-headline even though the reasoning for each is the same.
const remainingModules = [
  ['hero-headline', initHeroHeadline],
  ['services-pin', initServicesPin],
  ['hero-tilt', initHeroTilt],
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
// hero-headline above, for the pin-spacer reason in the comment on 4: both
// create their own ScrollTrigger (the marquee's pause-on-scroll-out state,
// the dissolve crossfade per figure), so both used to measure the
// testimonials section's scroll position too early and freeze the marquee
// mid-drift — cut off mid-word at both edges — the entire time the
// section was actually on screen. Their own relative
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
