/**
 * service-videos.js — Inventory item 7: service card real video loops.
 *
 * Global rules (spec 08 section 0), repeated here per module-header convention:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered exactly once, in main.js. Received as an argument.
 * 4. Lenis is created exactly once, in lenis-scroll.js.
 * 5. Exactly one RAF loop in the project: gsap.ticker. Never call requestAnimationFrame here.
 * 6. This module returns a cleanup function.
 * 7. Bails out with a no-op cleanup when reduced motion is requested — every
 *    poster stays visible, no video ever plays.
 * 8. Mobile plays too, but only one card's video decodes at a time.
 * 9. Never animate width, height, top, or left. Transform and opacity only.
 * 10. will-change is set while the settle tween plays, removed once it completes.
 * 11. N/A — nothing here is a reveal; these are decorative looping clips.
 * 12. Elements are queried by data-* attribute only, never by class.
 * 13. Absent hook elements produce a silent no-op return.
 * 14. No console logging in shipped code.
 *
 * VENDOR LOADING OVERRIDE: this project self-hosts GSAP, ScrollTrigger and Lenis
 * as classic UMD scripts (window.gsap / window.ScrollTrigger / window.Lenis).
 * This module does not import them; it receives them as init() arguments.
 */

const NOOP = () => {};

function setWillChange(figure) {
  figure.style.willChange = 'transform, opacity';
}

function clearWillChange(figure) {
  figure.style.willChange = '';
}

function ensurePreload(video) {
  if (video.preload !== 'auto') {
    video.preload = 'auto';
  }
}

function safePlay(video) {
  const result = video.play();
  if (result && typeof result.catch === 'function') {
    result.catch(() => {});
  }
}

function safePause(video) {
  video.pause();
}

export function initServiceVideos({ gsap, ScrollTrigger, reduced, isMobile }) {
  const figures = Array.prototype.slice.call(
    document.querySelectorAll('[data-service-media]')
  );
  if (figures.length === 0) return NOOP;

  const cards = [];
  figures.forEach((figure) => {
    const video = figure.querySelector('[data-service-video]');
    if (!video) return;
    cards.push({ figure, video, trigger: null, settleTween: null });
  });
  if (cards.length === 0) return NOOP;

  if (reduced) return NOOP;

  // Mobile: only one video plays at a time. Track whichever card is
  // currently the "active" one and pause the previous card when a new
  // one enters.
  let activeCard = null;

  function playCard(card) {
    ensurePreload(card.video);

    if (isMobile && activeCard && activeCard !== card) {
      safePause(activeCard.video);
    }
    activeCard = card;

    setWillChange(card.figure);
    if (card.settleTween) card.settleTween.kill();
    card.settleTween = gsap.fromTo(
      card.figure,
      { autoAlpha: 0.85, scale: 0.98 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => clearWillChange(card.figure)
      }
    );

    safePlay(card.video);
  }

  function pauseCard(card) {
    safePause(card.video);
    if (card.settleTween) {
      card.settleTween.kill();
      card.settleTween = null;
    }
    clearWillChange(card.figure);
    if (activeCard === card) activeCard = null;
  }

  cards.forEach((card) => {
    card.trigger = ScrollTrigger.create({
      trigger: card.figure,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => playCard(card),
      onEnterBack: () => playCard(card),
      onLeave: () => pauseCard(card),
      onLeaveBack: () => pauseCard(card)
    });
  });

  const onVisibilityChange = () => {
    if (document.hidden) {
      cards.forEach((card) => safePause(card.video));
    } else {
      cards.forEach((card) => {
        if (card.trigger.isActive) {
          ensurePreload(card.video);
          safePlay(card.video);
        }
      });
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  return function cleanup() {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    cards.forEach((card) => {
      if (card.trigger) card.trigger.kill();
      if (card.settleTween) card.settleTween.kill();
      safePause(card.video);
      try {
        card.video.currentTime = 0;
      } catch (err) {
        // Some browsers throw if metadata never loaded; nothing to clean.
      }
      clearWillChange(card.figure);
      gsap.set(card.figure, { clearProps: 'all' });
    });
  };
}
