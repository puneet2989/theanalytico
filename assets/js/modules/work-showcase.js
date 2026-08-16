/**
 * work-showcase.js
 * Substantial scroll-scrubbed centrepiece for work.html's `#showcase` section:
 * a pinned browser-chrome mockup rotates in 3D and cross-fades through three
 * real portfolio screenshots (ArdLens, KC Accountants, SodoLT) as the user
 * scrolls through the pinned distance.
 *
 * Hook contract (existing markup, queried read-only, no class selectors):
 * - [data-work-showcase]        the <section>, ScrollTrigger's trigger and pin target.
 * - [data-work-showcase-frame]  the 3D mockup frame; only transform (rotateX/rotateY/
 *                                scale) is ever animated on it.
 * - [data-work-showcase-slide]  three <img> slides stacked by CSS
 *                                (position: absolute; inset: 0), first at opacity: 1,
 *                                the other two at opacity: 0 — that CSS default IS the
 *                                no-JS fallback and the reduced-motion resting state.
 *
 * Pin distance: `+= viewportHeight * 2.4`, recomputed on every ScrollTrigger.refresh()
 * via a function end value. Three stages need roughly a full viewport of scroll each
 * to read as deliberate rather than rushed; 2.4x gives ~0.8 viewport per segment,
 * short enough that the pin doesn't outstay the section's welcome relative to the
 * rest of the page, long enough that scrub:1 doesn't feel twitchy.
 *
 * Timeline: one gsap.timeline of 3 equal units (0–1, 1–2, 2–3), scrub: 1, attached to
 * a single ScrollTrigger pinning the section.
 * - Unit 0–1 (segment 1, slide 1 holds): the CSS resting state (flat frame, slide 1
 *   opaque) is the timeline's time-0 state, so there is zero divergence between what
 *   CSS already paints and what GSAP renders the instant the ScrollTrigger initialises
 *   — this is the hard constraint from the no-JS/late-JS-load fallback rule. The frame
 *   then dips into the tilt (rotateY -18, rotateX 8, scale .92) at the segment's
 *   midpoint and returns to flat by the segment's end, so segment 1 still reads as
 *   "the mockup tilts" without ever requiring a non-flat value at progress 0. This is
 *   a deliberate reinterpretation of the spec's literal "starts tilted, settles flat"
 *   wording: the *only* way to keep progress-0 identical to the CSS default (required)
 *   while still delivering a tilt motion within segment 1 is to dip away from flat and
 *   back, rather than start away from flat.
 * - Unit 1–2 and 2–3 (the two crossfades): slide N fades 1→0 while slide N+1 fades
 *   0→1 across the full unit (opacity only), and the frame takes a small rotateY dip
 *   (+10 and back to 0) over the same unit so every swap carries a bit of rotation,
 *   echoing a rotating-object feel rather than a flat cut.
 * - End of timeline (progress 1): frame flat, slide 3 (SodoLT) fully opaque, slides 1–2
 *   at opacity 0 — scrolling past the pin leaves the mockup on the last real site.
 *   Chosen over looping back to slide 1: `#projects` immediately below starts its own
 *   grid with ArdLens again, so landing back on ArdLens right before that grid would
 *   read as a stutter/repeat; ending on SodoLT instead gives the eye a fresh site
 *   right as `#projects` reintroduces ArdLens at the top of the grid.
 *
 * Mobile: pin bailed entirely on `matchMedia('(max-width: 768px)')`. No other module
 * in this codebase uses ScrollTrigger's `pin` (header-pill.js drives its own state
 * machine off a scroll listener, not a pinned ScrollTrigger; section-curtain.js and
 * reveal-stagger.js explicitly chose non-pinning scrub so they could stay
 * mobile-enabled). Pinning is the one technique that scroll-jacks the viewport for a
 * fixed distance, which fights hardest with mobile browser chrome
 * (address-bar show/hide) resizing the visual viewport mid-pin. The CSS default
 * (slide 1 fully opaque, frame flat) is a complete, correct static presentation, so
 * bailing is a safe fallback rather than broken content.
 *
 * Reduced motion: returns immediately, before anything is queried or built. No pin,
 * no scrub, no timeline — the CSS default stands exactly as painted, matching the
 * no-JS fallback state precisely (frame flat, slide 1 opaque, slides 2–3 transparent).
 *
 * Global rules (CLAUDE.md), repeated per project convention:
 * 1. One effect per file, no cross-module imports.
 * 2. Single named export.
 * 3. ScrollTrigger registered once in main.js, received as an argument here.
 * 4. Lenis created once elsewhere; never created here.
 * 5. gsap.ticker is the only RAF loop; never call requestAnimationFrame here.
 * 6. Returns a cleanup function that kills the ScrollTrigger/timeline and clears
 *    every inline style this module ever set, so re-init is safe.
 * 7. Bails to the static CSS default when reduced is true.
 * 8. Bails to the static CSS default on mobile (see above).
 * 9. Animates only transform (rotateX/rotateY/scale) and opacity. Never width,
 *    height, top, or left.
 * 10. will-change set on frame + slides only while the pin's ScrollTrigger is active
 *     (onEnter/onEnterBack), cleared on leave/leaveBack/cleanup.
 * 11. Start state matches the CSS default exactly (see pin-distance note above); no
 *     inline style is set outside the scrub-driven tween.
 * 12. Elements queried by data-* attribute only.
 * 13. No-op cleanup immediately if the section, frame, or fewer than 3 slides exist.
 * 14. Never logs to the console.
 *
 * VENDOR LOADING OVERRIDE: GSAP/ScrollTrigger are self-hosted UMD globals passed in
 * as arguments by main.js, not imported as ES modules here.
 */

const NOOP = () => {};

export function initWorkShowcase({ gsap, ScrollTrigger, reduced, isMobile }) {
  if (reduced) return NOOP;

  const section = document.querySelector('[data-work-showcase]');
  if (!section) return NOOP;

  const frame = section.querySelector('[data-work-showcase-frame]');
  const slides = Array.from(section.querySelectorAll('[data-work-showcase-slide]'));
  if (!frame || slides.length < 3) return NOOP;

  if (isMobile) return NOOP;

  const [slide1, slide2, slide3] = slides;

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      pin: true,
      // Offset by the fixed header's clearance (the same 96px used by
      // section[id]'s scroll-margin-top elsewhere) so the pinned heading
      // never sits under the header pill for the length of the pin.
      start: 'top top+=96',
      end: () => `+=${Math.round(window.innerHeight * 2.8)}`,
      scrub: 1,
      invalidateOnRefresh: true,
      onEnter: () => gsap.set([frame, ...slides], { willChange: 'transform, opacity' }),
      onEnterBack: () => gsap.set([frame, ...slides], { willChange: 'transform, opacity' }),
      onLeave: () => gsap.set([frame, ...slides], { willChange: 'auto' }),
      onLeaveBack: () => gsap.set([frame, ...slides], { willChange: 'auto' }),
    },
  });

  // Segment 1 (0–0.6): slide 1 holds at rest (CSS default: opacity 1). Frame
  // dips into the tilt and returns to flat, so progress 0 stays identical to
  // the CSS resting state while segment 1 still reads as a tilt motion. Kept
  // shorter than the two crossfades below (0.6 units vs. 1 each) since this
  // segment has no slide change to carry, only the tilt — a full equal third
  // here read as dead scroll in review.
  tl.to(frame, { rotateY: -18, rotateX: 8, scale: 0.92, duration: 0.3 }, 0)
    .to(frame, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.3 }, 0.3);

  // Transition 1→2 (0.6–1.6): crossfade slide 1 out / slide 2 in, frame dips
  // rotateY the other way and returns, so the swap carries rotation rather
  // than a flat cut.
  tl.to(slide1, { opacity: 0, duration: 1 }, 0.6)
    .to(slide2, { opacity: 1, duration: 1 }, 0.6)
    .to(frame, { rotateY: 10, duration: 0.5 }, 0.6)
    .to(frame, { rotateY: 0, duration: 0.5 }, 1.1);

  // Transition 2→3 (1.6–2.6): same crossfade + rotate pattern, slide 2 → 3.
  tl.to(slide2, { opacity: 0, duration: 1 }, 1.6)
    .to(slide3, { opacity: 1, duration: 1 }, 1.6)
    .to(frame, { rotateY: -10, duration: 0.5 }, 1.6)
    .to(frame, { rotateY: 0, duration: 0.5 }, 2.1);

  return function cleanup() {
    const st = tl.scrollTrigger;
    tl.kill();
    if (st) st.kill();
    gsap.set(frame, { clearProps: 'all' });
    gsap.set(slides, { clearProps: 'all' });
  };
}
