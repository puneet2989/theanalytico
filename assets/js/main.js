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

// 4. Hero modules run immediately too, same as 1-3 above: both are above
// the fold on every page that has a hero (hero-tilt's own hook,
// [data-hero-tilt], does not currently exist in any page's markup, so it
// no-ops immediately regardless — kept here anyway because it is a hero
// module, not a below-the-fold one, and costs nothing to call). Scheduling
// change, 14 Sep 2026 (Lighthouse TBT fix): everything below the fold used
// to run synchronously in this same block. See the deferred list below for
// what moved and why the pin-spacer ordering rule still holds across the
// split.
safeInit('hero-headline', () =>
  initHeroHeadline({ gsap, ScrollTrigger, lenis, reduced, isMobile })
);
safeInit('hero-tilt', () => initHeroTilt({ gsap, ScrollTrigger, lenis, reduced, isMobile }));

// 5. Everything else initialises only once the user actually scrolls, or
// once the main thread goes idle — whichever happens first — rather than
// synchronously on load. Most of these modules drive content below the
// fold (cards, KPI counters, the testimonial carousel, later services-pin
// panels); running all of it up front was the largest single contributor
// to Total Blocking Time, since GSAP/ScrollTrigger setup for a dozen+
// modules the user has not scrolled near yet was still competing with the
// hero's own paint for main-thread time.
//
// Ordering constraint carried over unchanged from the pre-split code: both
// hero-headline (immediate, above) and services-pin pin their section,
// reserving page height via a ScrollTrigger pin-spacer, and every
// ScrollTrigger created before a given spacer exists in the DOM measures a
// page shorter than its real, final layout — confirmed by hand, and a
// later refresh() does not correct triggers already created against the
// shorter layout. services-pin therefore still has to run before every
// module in this list, exactly as it did in the old single synchronous
// block; splitting the module list in two does not relax that rule, it
// just moves the entire ordered remainder from "on load" to "on first
// scroll or idle".
const deferredModules = [
  ['services-pin', initServicesPin],
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

let deferredModulesRan = false;

function runDeferredModules() {
  if (deferredModulesRan) return;
  deferredModulesRan = true;
  window.removeEventListener('scroll', onFirstScroll);

  for (const [name, initFn] of deferredModules) {
    safeInit(name, () => initFn({ gsap, ScrollTrigger, lenis, reduced, isMobile }));
  }

  // testimonial-marquee.js and testimonial-dissolve.js still run last of
  // all, after everything above, for the same pin-spacer reason: both
  // create their own ScrollTrigger (the marquee's pause-on-scroll-out
  // state, the dissolve crossfade per figure), so both used to measure the
  // testimonials section's scroll position too early and freeze the
  // marquee mid-drift — cut off mid-word at both edges — the entire time
  // the section was actually on screen. Their own relative order is also
  // unchanged: the marquee clones slide DOM to make the loop seamless, and
  // cloneNode does not copy a canvas bitmap, so the marquee must still run
  // before the dissolve module builds a real canvas for every figure,
  // originals and clones alike.
  safeInit('testimonial-marquee', () =>
    initTestimonialMarquee({ gsap, ScrollTrigger, lenis, reduced, isMobile })
  );
  safeInit('testimonial-dissolve', () =>
    initTestimonialDissolve({ gsap, ScrollTrigger, lenis, reduced, isMobile })
  );

  // The page just gained every deferred module's own pin-spacers and
  // triggers, changing total page height — refresh once more so the
  // immediate group's own triggers (created against the shorter, pre-defer
  // layout) pick up the final measurements too.
  ScrollTrigger.refresh();
}

function onFirstScroll() {
  runDeferredModules();
}

window.addEventListener('scroll', onFirstScroll, { passive: true, once: true });

if ('requestIdleCallback' in window) {
  requestIdleCallback(runDeferredModules, { timeout: 2000 });
} else {
  // Safari has no requestIdleCallback. A short timeout is the fallback,
  // not a second RAF loop — this fires once, same as the branch above.
  setTimeout(runDeferredModules, 200);
}

// Refresh ScrollTrigger once fonts settle, so trigger positions account
// for the final layout metrics. Independent of the deferred-module
// refresh above — this one covers the immediate group whenever fonts
// finish after it, the deferred group whenever fonts finish before it.
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
