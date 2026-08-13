/**
 * testimonial-marquee.js
 * Inventory item 9 (revised): the testimonial row drifts continuously
 * right to left, seamless loop, instead of paging.
 *
 * Global motion rules (CLAUDE.md / spec 08 section 0), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker. Never call requestAnimationFrame here.
 * 6. Returns a cleanup function that fully reverses the DOM to its authored state.
 * 9. Never animate width, height, top, or left. Only the wrapper's transform is tweened.
 * 10. will-change set on the wrapper while the tween is live, cleared on cleanup.
 * 12. Queries elements with data-* attributes only, never a class selector.
 * 13. If [data-marquee] is absent, returns a no-op cleanup immediately.
 * 14. Never logs to the console.
 *
 * ORDERING CONTRACT: main.js calls this module before testimonial-dissolve.js.
 * Clones are created here while slides still contain plain <img> elements, so
 * cloneNode never copies a canvas bitmap (there is none yet). testimonial-
 * dissolve.js runs afterwards and builds a real canvas for every
 * [data-dissolve] figure it finds, originals and clones alike.
 *
 * OWNERSHIP: peek-carousel.js has one early-return guard so it never touches
 * an element that also carries [data-marquee]. This module has exclusive
 * ownership of that element's transform, drag/paging semantics are retired,
 * and the two [data-carousel-prev]/[data-carousel-next] buttons are
 * repurposed below as the WCAG 2.2.2 pause/resume control.
 *
 * SEAMLESS LOOP TECHNIQUE: the original slide set is moved into an owned
 * wrapper, then whole sets are cloned until the wrapper is at least one full
 * set wider than the container. The wrapper's x is tweened by `-period`
 * (period = distance from one set's start to the next set's start) with
 * repeat: -1 and a modifier that wraps x back into [-period, 0). Because
 * every cloned set is pixel-identical to the original, wrapping never
 * produces a visible seam, regardless of how many sets are laid out.
 */

const NOOP = () => {};

const SPEED_DESKTOP_PX_S = 50; // within the requested 40-60px/s range
const SPEED_MOBILE_PX_S = 30; // slower on mobile, per spec
const MAX_CLONE_SETS = 12; // runaway guard, not expected to be hit

export function initTestimonialMarquee({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  const track = document.querySelector('[data-marquee]');
  if (!track) return NOOP;

  const originalSlides = Array.from(track.querySelectorAll('[data-carousel-slide]'));
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  if (!originalSlides.length) return NOOP;

  // Reduced motion: leave the DOM exactly as authored so the CSS
  // scroll-snap baseline keeps working. No clones, no drift, no listeners.
  if (reduced) return NOOP;

  // --- Neutralise the CSS no-JS baseline (native horizontal scroll with
  // scroll-snap) now that JS drives an inner wrapper with transforms.
  // Restored verbatim in cleanup.
  const prevOverflowX = track.style.overflowX;
  const prevSnapType = track.style.scrollSnapType;
  const prevScrollLeft = track.scrollLeft;
  track.style.overflowX = 'hidden';
  track.style.scrollSnapType = 'none';
  track.scrollLeft = 0;

  // --- Build the owned wrapper and move the originals into it -------------
  const trackStyles = getComputedStyle(track);
  const gapValue = trackStyles.columnGap && trackStyles.columnGap !== 'normal'
    ? trackStyles.columnGap
    : (trackStyles.gap || '0px');

  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-marquee-track', '');
  wrapper.style.display = 'flex';
  wrapper.style.gap = gapValue;

  originalSlides.forEach((slide) => wrapper.appendChild(slide));
  track.appendChild(wrapper);

  // --- Clone strippers ------------------------------------------------------
  function stripClone(node) {
    node.removeAttribute('data-carousel-slide');
    node.removeAttribute('id');
    node.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    node.setAttribute('aria-hidden', 'true');
    node.setAttribute('tabindex', '-1');
    node.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((el) => {
      el.setAttribute('tabindex', '-1');
    });
    // data-dissolve / data-dissolve-frame are deliberately left intact so
    // testimonial-dissolve.js still initialises the cloned figures.
    return node;
  }

  const cloneSets = [];
  function appendCloneSet() {
    const set = originalSlides.map((slide) => stripClone(slide.cloneNode(true)));
    set.forEach((clone) => wrapper.appendChild(clone));
    cloneSets.push(set);
  }

  // First clone set is mandatory: it is the "next" copy the loop wraps into.
  appendCloneSet();

  // Distance from the start of the original set to the start of the first
  // clone set. This is the tween's repeat period: because every set is
  // identical, wrapping x by exactly this distance is always seamless.
  function measurePeriod() {
    const originRect = originalSlides[0].getBoundingClientRect();
    const cloneRect = cloneSets[0][0].getBoundingClientRect();
    return Math.round(cloneRect.left - originRect.left);
  }

  let period = measurePeriod();

  // Add further whole sets only until the wrapper covers the container width
  // plus one more period, so no point in the loop ever runs out of physical
  // content before the wrap resets. Minimal on mobile by construction, since
  // the loop stops as soon as coverage is sufficient.
  const containerWidth = track.getBoundingClientRect().width || window.innerWidth;
  let guard = 0;
  while (
    period > 0 &&
    wrapper.getBoundingClientRect().width < containerWidth + period &&
    guard < MAX_CLONE_SETS
  ) {
    appendCloneSet();
    guard += 1;
  }

  // --- The drift tween ------------------------------------------------------
  const speed = isMobile ? SPEED_MOBILE_PX_S : SPEED_DESKTOP_PX_S;
  let tween = null;

  function wrapX(rawValue) {
    const num = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
    const wrapped = gsap.utils.wrap(-period, 0, num);
    // MUST return a unit-bearing string. A bare number here makes GSAP write
    // translate(0px, 0px) on every tick: the tween runs, reports isActive() and
    // advances its progress, but never moves a pixel. Verified in-browser against
    // three variants — bare number renders 0, "<n>px" and no-modifier both render
    // correctly. This was the cause of the marquee appearing completely dead.
    return `${wrapped}px`;
  }

  function buildTween() {
    if (tween) tween.kill();
    if (period <= 0) return null;
    gsap.set(wrapper, { x: 0 });
    return gsap.to(wrapper, {
      x: `-=${period}`,
      duration: period / speed,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: wrapX,
      },
      onStart: () => {
        wrapper.style.willChange = 'transform';
      },
    });
  }

  tween = buildTween();

  // --- Pause/resume, multi-reason -------------------------------------------
  // Several independent conditions can each demand a pause. The tween plays
  // only when none of them are active. "manual" is the user's own explicit
  // choice via the repurposed button and is never cleared by anything else.
  const pauseReasons = new Set();

  function applyPlayState() {
    if (!tween) return;
    if (pauseReasons.size > 0) {
      tween.pause();
    } else {
      tween.play();
    }
  }

  function addReason(reason) {
    pauseReasons.add(reason);
    applyPlayState();
  }
  function removeReason(reason) {
    pauseReasons.delete(reason);
    applyPlayState();
  }

  // Hover
  function onPointerEnter() {
    addReason('hover');
  }
  function onPointerLeave() {
    removeReason('hover');
  }
  track.addEventListener('pointerenter', onPointerEnter);
  track.addEventListener('pointerleave', onPointerLeave);

  // Focus anywhere inside
  function onFocusIn() {
    addReason('focus');
  }
  function onFocusOut(e) {
    if (track.contains(e.relatedTarget)) return;
    removeReason('focus');
  }
  track.addEventListener('focusin', onFocusIn);
  track.addEventListener('focusout', onFocusOut);

  // Tab visibility
  function onVisibilityChange() {
    if (document.hidden) {
      addReason('hidden');
    } else {
      removeReason('hidden');
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);
  // Initial state: the page can already be a hidden background tab at
  // module-init time, before any visibilitychange event has ever fired.
  // Without this the 'hidden' reason would only ever be *removable*, never
  // added, for a session that starts hidden.
  if (document.hidden) addReason('hidden');

  // Scroll in/out of view. onEnter/onLeave etc. only fire on a *crossing*
  // detected by ScrollTrigger, so they cannot establish the initial state
  // for a section that is already in view at the moment the trigger is
  // created (the common case: the coordinator's probe centred the section
  // in the viewport before measuring). Relying on st.isActive immediately
  // after ScrollTrigger.create() is unreliable here too, since this module
  // runs before fonts.ready / the main.js ScrollTrigger.refresh() and the
  // trigger's start/end can be computed against not-yet-final layout.
  // Instead, the initial in/out-of-view state is measured directly against
  // the exact same thresholds ('top 95%' / 'bottom 5%') used by the
  // trigger, decoupled from ScrollTrigger's internal timing.
  function isInViewport() {
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.95 && rect.bottom > vh * 0.05;
  }

  const st = ScrollTrigger.create({
    trigger: track,
    start: 'top 95%',
    end: 'bottom 5%',
    onEnter: () => removeReason('scroll'),
    onEnterBack: () => removeReason('scroll'),
    onLeave: () => addReason('scroll'),
    onLeaveBack: () => addReason('scroll'),
  });
  if (!isInViewport()) addReason('scroll');

  // --- Repurpose the two controls as the WCAG 2.2.2 pause/resume toggle ----
  // Paging is retired: the first button becomes a genuine pause/resume
  // toggle with its accessible name and aria-pressed driven from JS. The
  // second button is redundant and is hidden from view and from assistive
  // tech, also from JS, since the markup is not this module's to edit.
  let prevBtnOriginalLabel = null;
  let nextBtnOriginalDisplay = '';
  let nextBtnHadAriaHidden = false;
  let nextBtnOriginalAriaHidden = null;
  let nextBtnHadTabindex = false;
  let nextBtnOriginalTabindex = null;

  function updateToggleButton() {
    if (!prevBtn) return;
    const paused = pauseReasons.has('manual');
    prevBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    prevBtn.setAttribute(
      'aria-label',
      paused ? 'Resume testimonial animation' : 'Pause testimonial animation'
    );
  }

  function onToggleClick() {
    if (pauseReasons.has('manual')) {
      removeReason('manual');
    } else {
      addReason('manual');
    }
    updateToggleButton();
  }

  if (prevBtn) {
    prevBtnOriginalLabel = prevBtn.getAttribute('aria-label');
    prevBtn.removeAttribute('aria-disabled');
    prevBtn.addEventListener('click', onToggleClick);
    updateToggleButton();
  }

  if (nextBtn) {
    nextBtnOriginalDisplay = nextBtn.style.display;
    nextBtnHadAriaHidden = nextBtn.hasAttribute('aria-hidden');
    nextBtnOriginalAriaHidden = nextBtn.getAttribute('aria-hidden');
    nextBtnHadTabindex = nextBtn.hasAttribute('tabindex');
    nextBtnOriginalTabindex = nextBtn.getAttribute('tabindex');

    nextBtn.style.display = 'none';
    nextBtn.setAttribute('aria-hidden', 'true');
    nextBtn.setAttribute('tabindex', '-1');
  }

  return function cleanup() {
    track.removeEventListener('pointerenter', onPointerEnter);
    track.removeEventListener('pointerleave', onPointerLeave);
    track.removeEventListener('focusin', onFocusIn);
    track.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    st.kill();

    if (prevBtn) {
      prevBtn.removeEventListener('click', onToggleClick);
      prevBtn.removeAttribute('aria-pressed');
      if (prevBtnOriginalLabel === null) {
        prevBtn.removeAttribute('aria-label');
      } else {
        prevBtn.setAttribute('aria-label', prevBtnOriginalLabel);
      }
    }

    if (nextBtn) {
      nextBtn.style.display = nextBtnOriginalDisplay;
      if (nextBtnHadAriaHidden) {
        nextBtn.setAttribute('aria-hidden', nextBtnOriginalAriaHidden);
      } else {
        nextBtn.removeAttribute('aria-hidden');
      }
      if (nextBtnHadTabindex) {
        nextBtn.setAttribute('tabindex', nextBtnOriginalTabindex);
      } else {
        nextBtn.removeAttribute('tabindex');
      }
    }

    if (tween) tween.kill();
    wrapper.style.willChange = 'auto';

    // Move the originals back to the track, in original order, then remove
    // the wrapper (and every clone with it).
    originalSlides.forEach((slide) => track.appendChild(slide));
    wrapper.remove();

    track.style.overflowX = prevOverflowX;
    track.style.scrollSnapType = prevSnapType;
    track.scrollLeft = prevScrollLeft;
  };
}
