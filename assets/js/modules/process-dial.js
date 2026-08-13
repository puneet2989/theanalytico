/**
 * process-dial.js
 * Client-specified effect: "How it runs" process steps sit on a half-circle
 * dial. As the section scrolls, the dial turns and the active step's number
 * advances, then turns back on the way up. Not part of the reference site;
 * this is the client's own idea, described as "a half circle with numbers
 * changing, and when you scroll up and down the sections with number move
 * like on a dial."
 *
 * Global motion rules (CLAUDE.md / spec 08 section 0), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js; this module receives it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates its own instance.
 * 5. The only RAF loop in the project is gsap.ticker. Never call requestAnimationFrame here.
 * 6. This module returns a cleanup function.
 * 7. Bails out to a fixed, fully-readable state when `reduced` is true.
 * 8. Skips rotation (but still draws the arc and lets cards stack) when `isMobile` is true.
 * 9. Animates transform and stroke properties only. Never width, height, top, or left.
 * 10. will-change is set while the scroll-linked animation is live, cleared on leave/cleanup.
 * 11. Start state (arc undrawn, dial at its resting angle) is set from JS at init, never CSS.
 *     With JS disabled the arc renders as a plain, fully visible stroke and all four steps,
 *     numbers, headings and body text are readable regardless.
 * 12. Elements are queried with data-* attributes only, never a class selector.
 * 13. If [data-dial] is absent, returns a no-op cleanup immediately.
 * 14. Never logs to the console.
 *
 * VENDOR LOADING OVERRIDE: GSAP, ScrollTrigger and Lenis are self-hosted UMD builds loaded as
 * classic scripts in index.html, exposed as window.gsap / window.ScrollTrigger / window.Lenis.
 * They are not imported as ES modules here; main.js passes the already-registered globals in.
 *
 * Hook contract (index.html is the source of truth):
 * - [data-dial]           wraps the whole dial group (svg arc + the four step cards).
 * - [data-dial-arc]       the <svg> element.
 * - [data-dial-arc-path]  the half-circle <path> traced progressively as the dial turns.
 * - [data-dial-num]       four elements, one per step card, holding "01".."04".
 *
 * Active-step signal: this module sets `data-dial-active` on the step card (the
 * [data-tilt-card] ancestor of each [data-dial-num]) currently at the active position.
 * Appearance for that state belongs to the stylesheet; this module only owns the state.
 *
 * Note for the stylesheet author: [data-tilt-card] is still present on these same step
 * cards and tilt-cards.js still runs on them (rest tilt + rotate-straight-on-enter, once).
 * This module never touches transform on the card itself, only on the arc svg and the
 * [data-dial-num] elements, so the two modules do not fight over the same property.
 */

const NOOP = () => {};

const SWEEP_DEG = 48; // total rotation of the dial across the whole scroll range

export function initProcessDial({ gsap, ScrollTrigger, reduced, isMobile }) {
  const dials = document.querySelectorAll('[data-dial]');
  if (!dials.length) return NOOP;

  const cleanups = [];

  dials.forEach((dial) => {
    const arc = dial.querySelector('[data-dial-arc]');
    const path = dial.querySelector('[data-dial-arc-path]');
    const nums = Array.from(dial.querySelectorAll('[data-dial-num]'));

    if (!path || !nums.length) return;

    const cards = nums.map((num) => num.closest('[data-tilt-card]') || num.parentElement);

    let pathLength = 0;
    try {
      pathLength = path.getTotalLength();
    } catch (err) {
      pathLength = 0;
    }

    function setActive(index) {
      cards.forEach((card, i) => {
        if (!card) return;
        if (i === index) {
          card.setAttribute('data-dial-active', '');
        } else {
          card.removeAttribute('data-dial-active');
        }
      });
    }

    function clearActive() {
      cards.forEach((card) => {
        if (card) card.removeAttribute('data-dial-active');
      });
    }

    // Reduced motion: static, fully drawn, fully readable, step one active, no rotation.
    if (reduced) {
      if (pathLength) {
        gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: 0 });
      }
      gsap.set(arc, { rotate: 0, clearProps: 'transform' });
      gsap.set(nums, { rotate: 0, clearProps: 'transform' });
      setActive(0);

      cleanups.push(() => {
        gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' });
        clearActive();
      });
      return;
    }

    // Mobile: rotation is awkward on a narrow screen. Draw the arc fully and let the
    // cards stack as a plain list; no scroll-linked rotation, no active-step signalling.
    if (isMobile) {
      if (pathLength) {
        gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: 0 });
      }
      gsap.set(arc, { rotate: 0, clearProps: 'transform' });
      gsap.set(nums, { rotate: 0, clearProps: 'transform' });

      cleanups.push(() => {
        gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' });
      });
      return;
    }

    // Desktop, motion allowed: start state set from JS — arc undrawn, dial at its
    // resting (start) angle. With JS disabled none of this ever applies, so the
    // path renders as its plain, fully visible CSS stroke.
    const startRotate = -SWEEP_DEG / 2;
    if (pathLength) {
      gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
    }
    gsap.set(arc, { rotate: startRotate, transformOrigin: '50% 100%' });
    gsap.set(nums, { rotate: startRotate, transformOrigin: '50% 50%' });
    setActive(0);

    const stepCount = nums.length;

    const st = ScrollTrigger.create({
      trigger: dial,
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 0.6,
      invalidateOnRefresh: true,
      onEnter: () => {
        gsap.set([arc, ...nums], { willChange: 'transform' });
        gsap.set(path, { willChange: 'stroke-dashoffset' });
      },
      onEnterBack: () => {
        gsap.set([arc, ...nums], { willChange: 'transform' });
        gsap.set(path, { willChange: 'stroke-dashoffset' });
      },
      onLeave: () => {
        gsap.set([arc, ...nums], { willChange: 'auto' });
        gsap.set(path, { willChange: 'auto' });
      },
      onLeaveBack: () => {
        gsap.set([arc, ...nums], { willChange: 'auto' });
        gsap.set(path, { willChange: 'auto' });
      },
      onUpdate: (self) => {
        const progress = self.progress;
        const rotate = startRotate + progress * SWEEP_DEG;

        gsap.set(arc, { rotate });
        gsap.set(nums, { rotate });

        if (pathLength) {
          gsap.set(path, { strokeDashoffset: pathLength * (1 - progress) });
        }

        const index = Math.min(stepCount - 1, Math.floor(progress * stepCount));
        setActive(index);
      },
    });

    cleanups.push(() => {
      st.kill();
      gsap.set([arc, ...nums], { clearProps: 'transform,willChange' });
      gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset,willChange' });
      clearActive();
    });
  });

  if (!cleanups.length) return NOOP;

  return function cleanup() {
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
  };
}
