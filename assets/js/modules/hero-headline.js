/**
 * hero-headline.js
 * Inventory item 2 (CLAUDE.md): kinetic headline, word-by-word clip-path
 * reveal. Also drives the hero's pillar-name mask transition — reusing
 * heading-mask.js's own overflow-hidden clip idiom rather than a new
 * module, see below — and the telemetry percent.
 *
 * Rewritten 14 Sep 2026 for the type-only hero (the full-bleed video hero
 * is retired — see CLAUDE.md's own effect inventory item 1, and .hero's
 * own comment in components.css, for why). This module now also owns the
 * hero's pin and scrub, absorbed from hero-morph.js, which had nothing
 * left to justify its own file once its video/canvas logic was removed —
 * it is deleted, not left empty. The pin's scroll progress drives the
 * pillar-name mask transition and the telemetry percent.
 *
 * The h1 reveal itself is NOT tied to that same scrub, and this is a
 * deliberate deviation from an earlier task's literal "the scrub drives
 * typography… word-by-word clip-path reveal on the h1": binding the
 * reveal's progress directly to the pin's scroll range (0 at the top of
 * the page, same as before any scrolling has happened) leaves the hero
 * fully blank — every word at 0 opacity — until the user scrolls.
 * Verified on screen, not assumed: a screenshot at rest (scrollY: 0)
 * showed nothing but the pillar name and the header. That is a materially
 * worse hero than the one this replaced, and CLAUDE.md's own motion rule
 * ("holds its end state once a sequence completes") implies a sequence
 * that resolves promptly, not one gated entirely behind a scroll gesture.
 * The reveal instead plays once, automatically, on an ordinary
 * scroll-into-view trigger (`start: 'top 85%', once: true` — for an
 * element already in the first viewport at load, that condition is true
 * immediately, so it plays on load). The pillar-name transition below is
 * the thing that is genuinely scrub-driven, per the 14 Sep 2026 hierarchy
 * flip: it is now the hero's largest, most interesting content, and the
 * brief for it was explicit that a scrub-driven mask transition (not a
 * fade, not a plain text swap) is what "the pillar swap must be a real
 * transition" requires.
 *
 * Pillar-name mask transition: heading-mask.js's own technique (an
 * overflow-hidden box, a transform-driven reveal — the site's substitute
 * for GSAP SplitText/clip-path, see that file's own header) reused here
 * rather than a new module, per the brief's "reuse heading-mask… rather
 * than writing a new one". heading-mask.js itself cannot be called
 * directly for this: it drives a one-shot reveal-on-enter for a single,
 * static heading, and this needs a continuous, reversible, four-way
 * transition scrubbed against one shared progress value the pin already
 * owns for the telemetry percent — a different trigger shape, not a
 * different visual idiom. All four pillar names live in the DOM as real
 * text (never aria-hidden) inside one overflow-hidden window; scrolling
 * translates the list vertically so each name masks out the top of that
 * window as the next masks in from the bottom, mostly holding still
 * within each quarter of the scroll range and only moving during a short
 * transition window at each boundary — "01 / 04" through "04 / 04",
 * alongside it, restates that progression in mono for legibility, and is
 * decorative (aria-hidden) the same way the telemetry percent is: neither
 * carries information the pillar name / progress bar don't already carry
 * in full.
 *
 * Global motion rules (CLAUDE.md), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker; nothing here starts a second one.
 * 6. This module returns a cleanup function.
 * 7. Shows the finished, unsplit sentence and the last pillar name with no
 *    pin and no scroll-linked writes when prefers-reduced-motion: reduce
 *    matches — telemetry and the pillar index jump straight to their end
 *    values instead of cycling.
 * 8. Mobile pins and scrubs too, same as desktop — the pillar transition
 *    and telemetry must still advance with scroll on mobile. pinType is
 *    'transform' rather than the default position: fixed on mobile — the
 *    latter is what causes the classic mobile Safari scroll-jank/jump
 *    (fighting the dynamic address bar's own show/hide), not pinning
 *    itself.
 * 9. Never animates width, height, top, or left. Transform, opacity, and
 *    textContent swaps only.
 * 10. Queries elements with data-* attributes only, never a class selector.
 * 11. If a hook element is absent, returns a no-op cleanup immediately.
 *     The pillar window's overflow: hidden and fixed height are applied
 *     here, inline, for the same reason: baking them into static CSS
 *     would clip three of the four names for no-JS users with nothing to
 *     un-clip them; JS-applied means no-JS users see all four, stacked
 *     and fully visible instead.
 * 12. No console.* in shipped code.
 *
 * Data hooks (index.html, source of truth):
 * - [data-hero-stage] — the hero <section>, pinned for its own scroll distance.
 * - [data-hero-headline] — the hero <h1>.
 * - [data-hero-pillar-window] — the overflow-clip box around the pillar list.
 * - [data-hero-pillar-list] — the <ul>; its four <li> children are read directly.
 * - [data-hero-pillar-index] — optional, decorative (aria-hidden in the markup).
 * - [data-hero-telemetry-progress] — optional, decorative (aria-hidden in the markup).
 */

const NOOP = () => {};

// Pillar order matches CLAUDE.md "Services" and every other pillar list on
// the site. Kept as a count/label source only — the actual DOM text lives
// in index.html's four <li> elements and is never generated or duplicated
// here, so a no-JS reader and this module always see the same four names.
const PILLAR_COUNT = 4;
const TRANSITION_WINDOW = 0.3; // fraction of each quarter spent transitioning, not held

function pillarOffsetFor(progress) {
  const raw = Math.min(PILLAR_COUNT - 1e-6, Math.max(0, progress * PILLAR_COUNT));
  const index = Math.min(PILLAR_COUNT - 1, Math.floor(raw));
  const nextIndex = Math.min(PILLAR_COUNT - 1, index + 1);
  if (nextIndex === index) {
    return { offset: index, displayIndex: index };
  }
  const localT = raw - index;
  const transitionStart = 1 - TRANSITION_WINDOW;
  const blend = localT > transitionStart ? (localT - transitionStart) / TRANSITION_WINDOW : 0;
  return { offset: index + blend, displayIndex: blend >= 0.5 ? nextIndex : index };
}

export function initHeroHeadline({ gsap, ScrollTrigger, reduced, isMobile }) {
  const stage = document.querySelector('[data-hero-stage]');
  const heading = document.querySelector('[data-hero-headline]');
  if (!stage || !heading) return NOOP;

  const pillarWindow = document.querySelector('[data-hero-pillar-window]');
  const pillarList = document.querySelector('[data-hero-pillar-list]');
  const pillarItems = pillarList ? Array.from(pillarList.children) : [];
  const pillarIndexEl = document.querySelector('[data-hero-pillar-index]');
  const telemetryProgress = document.querySelector('[data-hero-telemetry-progress]');

  function writePillarIndex(index) {
    if (!pillarIndexEl) return;
    const text =
      String(index + 1).padStart(2, '0') + ' / ' + String(PILLAR_COUNT).padStart(2, '0');
    if (pillarIndexEl.textContent !== text) {
      pillarIndexEl.textContent = text;
    }
  }

  function writeProgress(progress) {
    if (!telemetryProgress) return;
    const pct = String(Math.round(progress * 100)).padStart(2, '0');
    telemetryProgress.textContent = pct + '%';
  }

  function itemHeight() {
    return pillarItems.length ? pillarItems[0].getBoundingClientRect().height : 0;
  }

  if (reduced) {
    // Static end state: the h1 is never split (no-JS and reduced-motion
    // users see the same finished sentence), the pillar window is never
    // clipped (no inline height/overflow applied below), so all four
    // names stay visible exactly as they are with JS disabled. Telemetry
    // and the index jump straight to their end values. No pin, no
    // scroll-linked writes.
    writeProgress(1);
    writePillarIndex(PILLAR_COUNT - 1);
    return function cleanup() {
      if (telemetryProgress) telemetryProgress.textContent = '00%';
      writePillarIndex(0);
    };
  }

  // Walk the heading's direct child nodes in document order, splitting text
  // nodes on the space character, so accessible reading order is preserved
  // exactly and no-JS users see the original text node structure untouched.
  const originalChildren = Array.from(heading.childNodes);
  const fragment = document.createDocumentFragment();
  const wordInners = [];

  originalChildren.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(' ');
      parts.forEach((part, i) => {
        if (part.length > 0) {
          const word = document.createElement('span');
          word.className = 'word';
          word.style.overflow = 'hidden';
          word.style.display = 'inline-block';

          const inner = document.createElement('span');
          inner.className = 'word__inner';
          inner.style.display = 'inline-block';
          inner.textContent = part;

          word.appendChild(inner);
          fragment.appendChild(word);
          wordInners.push(inner);
        }
        if (i < parts.length - 1) {
          fragment.appendChild(document.createTextNode(' '));
        }
      });
    } else {
      fragment.appendChild(node);
    }
  });

  heading.textContent = '';
  heading.appendChild(fragment);

  let revealTween = null;

  if (wordInners.length === 0) {
    heading.textContent = originalChildren.map((n) => n.textContent || '').join('');
  } else {
    gsap.set(wordInners, { yPercent: 110, opacity: 0, willChange: 'transform, opacity' });

    const clearWillChange = () => gsap.set(wordInners, { willChange: 'auto' });

    revealTween = gsap.fromTo(
      wordInners,
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.06,
        onComplete: clearWillChange,
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
      }
    );
  }

  // Clip the window to one name's height now that JS is driving it (see
  // rule 11 above for why this isn't in static CSS). Re-measured on every
  // ScrollTrigger refresh, not just once, so a font-load or viewport
  // resize that changes the pillar name's line height doesn't leave the
  // window clipped to a stale size.
  function applyWindowSize() {
    if (!pillarWindow || !pillarItems.length) return;
    pillarWindow.style.overflow = 'hidden';
    pillarWindow.style.height = itemHeight() + 'px';
  }

  applyWindowSize();
  ScrollTrigger.addEventListener('refresh', applyWindowSize);

  // Pin + scrub: drives the pillar-name mask transition and telemetry
  // percent only (see this file's own header for why the headline reveal
  // above is not on this same trigger). +=innerHeight is a deliberate,
  // modest distance — there is no 161-frame video to give this pin room
  // to traverse any more, just two short readouts advancing across
  // four/one-hundred discrete steps respectively.
  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => '+=' + Math.round(window.innerHeight),
    pin: true,
    pinSpacing: true,
    pinType: isMobile ? 'transform' : 'fixed',
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      writeProgress(self.progress);
      if (pillarList && pillarItems.length) {
        const { offset, displayIndex } = pillarOffsetFor(self.progress);
        pillarList.style.transform = 'translateY(' + -offset * itemHeight() + 'px)';
        writePillarIndex(displayIndex);
      }
    },
  });

  return function cleanup() {
    trigger.kill();
    ScrollTrigger.removeEventListener('refresh', applyWindowSize);
    if (revealTween) {
      if (revealTween.scrollTrigger) revealTween.scrollTrigger.kill();
      revealTween.kill();
      gsap.set(wordInners, { clearProps: 'all' });
    }
    heading.textContent = '';
    originalChildren.forEach((node) => heading.appendChild(node));
    if (pillarWindow) {
      pillarWindow.style.overflow = '';
      pillarWindow.style.height = '';
    }
    if (pillarList) pillarList.style.transform = '';
    writePillarIndex(0);
    if (telemetryProgress) telemetryProgress.textContent = '00%';
  };
}
