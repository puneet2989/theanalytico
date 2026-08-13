/**
 * peek-carousel.js — testimonial peek carousel, drag plus arrow controls.
 * Spec: docs/specs/08-motion-modules.md section 9.
 *
 * Global rules repeated per spec 08 section 0:
 * 1. One effect per file. No module imports another module.
 * 2. ES module, single named export, no default export.
 * 3. ScrollTrigger is registered exactly once, in main.js.
 * 5. Exactly one RAF loop in the project: gsap.ticker. Never call requestAnimationFrame here.
 * 6. Every module returns a cleanup function.
 * 9. Never animate width, height, top, or left.
 * 10. will-change set on animation start, removed on complete/cleanup.
 * 12. Query elements with data-* attributes only, never a class selector.
 * 13. If the hook element is absent, return a no-op cleanup immediately.
 * 14. Never log to the console in shipped code.
 *
 * This module is mobile-enabled: it does not bail on isMobile. It bails on
 * `reduced` for tweens only — the carousel remains fully operable (arrows,
 * keyboard, drag) but index changes jump with gsap.set instead of gsap.to,
 * and drag has no momentum snap animation.
 */
export function initPeekCarousel({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  const NOOP = () => {};

  const track = document.querySelector('[data-carousel]');
  if (!track) return NOOP;
  if (track.hasAttribute('data-marquee')) return NOOP;

  const slides = Array.from(track.querySelectorAll('[data-carousel-slide]'));
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  if (!slides.length || !prevBtn || !nextBtn) return NOOP;

  const count = slides.length;
  let index = 0;
  let slideWidth = 0;
  let gap = 0;
  let activeTween = null;
  let resizeTimer = null;

  let dragging = false;
  let axisLocked = null; // null | 'x' | 'y'
  let activePointerId = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let baseX = 0;
  let pointerMoved = 0;

  // Neutralise the CSS no-JS baseline (native horizontal scroll with
  // scroll-snap) now that JS drives the track with transforms. Restored
  // verbatim in cleanup.
  const prevOverflowX = track.style.overflowX;
  const prevSnapType = track.style.scrollSnapType;
  const prevScrollLeft = track.scrollLeft;
  track.style.overflowX = 'hidden';
  track.style.scrollSnapType = 'none';
  track.scrollLeft = 0;

  slides.forEach((slide) => slide.setAttribute('tabindex', '-1'));

  function measure() {
    const styles = getComputedStyle(track);
    gap = parseFloat(styles.columnGap || styles.gap) || 0;
    slideWidth = slides[0].getBoundingClientRect().width;
  }
  measure();

  function clamp(i) {
    return Math.max(0, Math.min(count - 1, i));
  }

  function targetX(i) {
    return -(i * (slideWidth + gap));
  }

  function updateButtons() {
    prevBtn.setAttribute('aria-disabled', index === 0 ? 'true' : 'false');
    nextBtn.setAttribute('aria-disabled', index === count - 1 ? 'true' : 'false');
  }

  function goTo(i) {
    const next = clamp(i);
    index = next;
    updateButtons();

    if (activeTween) {
      activeTween.kill();
      activeTween = null;
    }

    track.style.willChange = 'transform';

    const finish = () => {
      track.style.willChange = 'auto';
      activeTween = null;
      slides[index].focus();
    };

    if (reduced) {
      gsap.set(track, { x: targetX(index) });
      finish();
    } else {
      activeTween = gsap.to(track, {
        x: targetX(index),
        duration: 0.6,
        ease: 'power2.out',
        onComplete: finish,
      });
    }
  }

  updateButtons();

  function onPrevClick() {
    if (prevBtn.getAttribute('aria-disabled') === 'true') return;
    goTo(index - 1);
  }
  function onNextClick() {
    if (nextBtn.getAttribute('aria-disabled') === 'true') return;
    goTo(index + 1);
  }
  prevBtn.addEventListener('click', onPrevClick);
  nextBtn.addEventListener('click', onNextClick);

  function onKeydown(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    goTo(e.key === 'ArrowLeft' ? index - 1 : index + 1);
  }
  track.addEventListener('keydown', onKeydown);

  // --- Drag: pointer events, direction lock so vertical page scroll is
  // never hijacked. touch-action: pan-y on .carousel (components.css) is
  // the CSS-level guarantee; the JS lock backs it up for pointer moves we
  // do act on. Lenis is stopped for the duration of a horizontal drag and
  // restarted on release, since a live drag on the track and Lenis-driven
  // scroll would otherwise fight over the same frame.
  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    axisLocked = null;
    pointerMoved = 0;
    activePointerId = e.pointerId;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    if (activeTween) {
      activeTween.kill();
      activeTween = null;
    }
    baseX = gsap.getProperty(track, 'x');
    track.setPointerCapture(e.pointerId);
    if (lenis) lenis.stop();
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== activePointerId) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (axisLocked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axisLocked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }

    if (axisLocked === 'y') {
      // Vertical intent: abandon the drag and let the page scroll.
      dragging = false;
      if (lenis) lenis.start();
      return;
    }

    if (axisLocked === 'x') {
      e.preventDefault();
      pointerMoved = Math.abs(dx);
      gsap.set(track, { x: baseX + dx });
    }
  }

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    try {
      track.releasePointerCapture(activePointerId);
    } catch (err) {
      /* pointer already released */
    }
    if (lenis) lenis.start();

    const wasHorizontal = axisLocked === 'x';
    axisLocked = null;
    if (!wasHorizontal) return;

    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) >= 40) {
      goTo(dx < 0 ? index + 1 : index - 1);
    } else {
      goTo(index);
    }
  }

  function onPointerUp(e) {
    if (e.pointerId !== activePointerId) return;
    endDrag(e);
  }
  function onPointerCancel(e) {
    if (e.pointerId !== activePointerId) return;
    endDrag(e);
  }

  track.addEventListener('pointerdown', onPointerDown);
  track.addEventListener('pointermove', onPointerMove);
  track.addEventListener('pointerup', onPointerUp);
  track.addEventListener('pointercancel', onPointerCancel);

  // Suppress a click that follows a drag of more than 8px, so a drag never
  // triggers a link inside a slide.
  function onClickCapture(e) {
    if (pointerMoved > 8) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  track.addEventListener('click', onClickCapture, true);

  // The single permitted setTimeout in the motion layer: debounced resize
  // re-measure, since slide width and gap genuinely depend on layout.
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      gsap.set(track, { x: targetX(index) });
    }, 150);
  }
  window.addEventListener('resize', onResize);

  return function cleanup() {
    prevBtn.removeEventListener('click', onPrevClick);
    nextBtn.removeEventListener('click', onNextClick);
    track.removeEventListener('keydown', onKeydown);
    track.removeEventListener('pointerdown', onPointerDown);
    track.removeEventListener('pointermove', onPointerMove);
    track.removeEventListener('pointerup', onPointerUp);
    track.removeEventListener('pointercancel', onPointerCancel);
    track.removeEventListener('click', onClickCapture, true);
    window.removeEventListener('resize', onResize);
    clearTimeout(resizeTimer);

    if (activeTween) activeTween.kill();
    if (lenis) lenis.start();

    gsap.set(track, { clearProps: 'all' });
    track.style.willChange = '';

    track.style.overflowX = prevOverflowX;
    track.style.scrollSnapType = prevSnapType;
    track.scrollLeft = prevScrollLeft;

    slides.forEach((slide) => slide.removeAttribute('tabindex'));
  };
}
