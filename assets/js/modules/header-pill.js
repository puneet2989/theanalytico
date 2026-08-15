// DOCUMENTED EXCEPTION to CLAUDE.md motion rules.
// CLAUDE.md forbids animating width, height, top, and left.
// The header shell is the single documented exception, and only for max-width.
// Reason: the pill must physically reflow from full-bleed to 1120px centred.
// A transform:scaleX() would squash the nav text and the logo strokes.
// Scope of the exception: the maxWidth, paddingTop, paddingBottom, and borderRadius
// tweens on [data-header-shell], and the width tween on [data-logo-wordmark].
// No other element in the project may animate a layout property.
//
// Vendor note: GSAP/ScrollTrigger/Lenis are self-hosted UMD builds loaded as
// classic scripts in this project (window.gsap, window.ScrollTrigger,
// window.Lenis). This module receives its dependencies as arguments from
// main.js rather than importing them.
//
// Gating note: this module is mobile enabled and always runs. It does not
// bail out on `isMobile` — the drawer is a mobile feature. On `reduced`
// (prefers-reduced-motion: reduce) it skips the GSAP timeline entirely and
// toggles `data-header-state` only, so CSS applies the two resting states
// with no transition. The drawer, under `reduced`, opens and closes with no
// tween either.
//
// Client revision note (see coordinator brief): the monogram is no longer
// tweened out and the wordmark no longer collapses in full. Only the first
// line of the wordmark ("the"), the first element child of
// [data-logo-wordmark], collapses on pinning. It has no data-* hook of its
// own — html-builder's markup is out of scope to edit — so it is selected
// structurally off the existing [data-logo-wordmark] hook. "analytico"
// (the second line) stays visible in both states; its smaller pinned size
// is a CSS concern, not tweened here. The layout-property exception above
// now covers a maxInlineSize tween on that first-line span in place of the
// former width tween on the whole wordmark.

export function initHeaderPill({ gsap, ScrollTrigger, lenis, reduced, isMobile }) {
  const header = document.querySelector('[data-header]');
  if (!header) return () => {};

  const shell = header.querySelector('[data-header-shell]');
  // The monogram was removed from the markup when the logo became wordmark-only,
  // so [data-logo-mark] no longer exists and must NOT be a required hook — making
  // it one silently disabled the entire header pill transition.
  const wordmark = header.querySelector('[data-logo-wordmark]');
  if (!shell || !wordmark) return () => {};

  // "the" is the first line inside the wordmark hook's subtree. It carries
  // no data-* attribute of its own, so it is reached structurally rather
  // than by class, per the coordinator's explicit instruction not to add
  // one to markup owned by html-builder.
  const line1 = wordmark.firstElementChild;
  if (!line1) return () => {};

  const burger = header.querySelector('[data-drawer-toggle]');
  const drawer = document.querySelector('[data-drawer]');
  const drawerLinks = drawer ? Array.from(drawer.querySelectorAll('a')) : [];

  // ---- Header pill timeline -------------------------------------------

  let tl = null;

  if (!reduced) {
    const line1Width = line1.scrollWidth;

    // Pinned max-width must never exceed the viewport minus a gutter, or the
    // pill runs edge to edge with no side inset on any viewport narrower than
    // --header-pill-max (i.e. every mobile width) — this GSAP tween sets
    // max-width via inline style every frame, which always outranks the CSS
    // rule of the same name, so the clamp has to live here too, not just in
    // components.css.
    const rootStyles = getComputedStyle(document.documentElement);
    const pillMaxPx = parseFloat(rootStyles.getPropertyValue('--header-pill-max')) || 1120;
    const gutterPx = parseFloat(rootStyles.getPropertyValue('--s-4')) || 16;
    const pinnedMaxWidth = `${Math.min(pillMaxPx, window.innerWidth - gutterPx * 2)}px`;

    tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.45, ease: 'power3.out' },
      onStart: () => {
        shell.style.willChange = 'max-width, transform, opacity';
        line1.style.willChange = 'max-inline-size, opacity';
      },
      onComplete: () => {
        shell.style.willChange = '';
        line1.style.willChange = '';
      },
      onReverseComplete: () => {
        shell.style.willChange = '';
        line1.style.willChange = '';
      }
    });

    // Monogram (`mark`) is intentionally not part of this timeline. The
    // client wants it visible, unscaled, in both states.
    tl.fromTo(
      shell,
      {
        maxWidth: '1280px',
        borderRadius: '0px',
        paddingTop: '16px',
        paddingBottom: '16px',
        backgroundColor: 'rgba(255,255,255,0)',
        boxShadow: '0 0 0 rgba(26,26,26,0)'
      },
      {
        maxWidth: pinnedMaxWidth,
        borderRadius: '999px',
        paddingTop: '10px',
        paddingBottom: '10px',
        backgroundColor: 'rgba(255,255,255,0.7)',
        boxShadow: '0 4px 24px rgba(26,26,26,0.08)'
      },
      0
    ).fromTo(
      line1,
      { opacity: 1, maxInlineSize: line1Width },
      { opacity: 0, maxInlineSize: 0 },
      0
    );
  }

  // ---- State machine, driven by an absolute scrollY, not ScrollTrigger --

  let currentState = window.scrollY >= 40 ? 'pinned' : 'top';
  header.setAttribute('data-header-state', currentState);
  if (tl) {
    tl.progress(currentState === 'pinned' ? 1 : 0, true);
  }
  if (document.documentElement.dataset.headerBoot) {
    delete document.documentElement.dataset.headerBoot;
  }

  let scrollDirty = false;
  function onScroll() {
    scrollDirty = true;
  }

  function tick() {
    if (!scrollDirty) return;
    scrollDirty = false;
    const y = window.scrollY;
    let next = currentState;
    if (y >= 40) next = 'pinned';
    else if (y < 30) next = 'top';
    if (next !== currentState) {
      currentState = next;
      header.setAttribute('data-header-state', next);
      if (tl) {
        if (next === 'pinned') tl.play();
        else tl.reverse();
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  gsap.ticker.add(tick);

  // ---- Mobile drawer -----------------------------------------------------

  let drawerOpen = false;
  let drawerTl = null;

  function buildDrawerTimeline() {
    gsap.set(drawer, { yPercent: -100 });
    gsap.set(drawerLinks, { y: 16, opacity: 0 });
    const t = gsap.timeline({ paused: true });
    t.to(drawer, { yPercent: 0, duration: 0.4, ease: 'power3.out' }, 0);
    if (drawerLinks.length) {
      t.to(
        drawerLinks,
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.05 },
        0
      );
    }
    return t;
  }

  function onDrawerKeydown(e) {
    if (e.key === 'Escape') {
      closeDrawer(true);
      return;
    }
    if (e.key === 'Tab' && drawerLinks.length) {
      const first = drawerLinks[0];
      const last = drawerLinks[drawerLinks.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function onDrawerLinkClick() {
    closeDrawer(false);
  }

  function openDrawer() {
    if (!drawer || drawerOpen) return;
    drawerOpen = true;
    if (burger) {
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
    }
    drawer.hidden = false;
    document.documentElement.setAttribute('data-drawer-open', 'true');
    if (lenis) lenis.stop();

    if (reduced) {
      // No tween. State attributes only.
    } else {
      if (!drawerTl) drawerTl = buildDrawerTimeline();
      drawer.style.willChange = 'transform';
      drawerTl.eventCallback('onComplete', () => {
        drawer.style.willChange = '';
      });
      drawerTl.play(0);
    }

    if (drawerLinks[0]) drawerLinks[0].focus();
    document.addEventListener('keydown', onDrawerKeydown);
  }

  function closeDrawer(returnFocus) {
    if (!drawer || !drawerOpen) return;
    drawerOpen = false;
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }
    document.documentElement.removeAttribute('data-drawer-open');
    if (lenis) lenis.start();
    document.removeEventListener('keydown', onDrawerKeydown);

    if (reduced) {
      drawer.hidden = true;
    } else if (drawerTl) {
      drawerTl.eventCallback('onReverseComplete', () => {
        drawer.style.willChange = '';
        drawer.hidden = true;
      });
      drawer.style.willChange = 'transform';
      drawerTl.reverse();
    } else {
      drawer.hidden = true;
    }

    if (returnFocus && burger) burger.focus();
  }

  function onBurgerClick() {
    if (drawerOpen) closeDrawer(true);
    else openDrawer();
  }

  if (burger) burger.addEventListener('click', onBurgerClick);
  drawerLinks.forEach((link) => link.addEventListener('click', onDrawerLinkClick));

  // ---- Cleanup -------------------------------------------------------------

  return function cleanup() {
    window.removeEventListener('scroll', onScroll);
    gsap.ticker.remove(tick);
    if (tl) tl.kill();
    if (drawerTl) drawerTl.kill();

    if (burger) burger.removeEventListener('click', onBurgerClick);
    drawerLinks.forEach((link) => link.removeEventListener('click', onDrawerLinkClick));
    document.removeEventListener('keydown', onDrawerKeydown);

    shell.style.willChange = '';
    line1.style.willChange = '';
    if (drawer) drawer.style.willChange = '';

    header.setAttribute('data-header-state', 'top');
    document.documentElement.removeAttribute('data-drawer-open');

    if (!reduced) {
      gsap.set(shell, { clearProps: 'all' });
      gsap.set(line1, { clearProps: 'all' });
      if (drawer) gsap.set(drawer, { clearProps: 'all' });
      if (drawerLinks.length) gsap.set(drawerLinks, { clearProps: 'all' });
    }

    if (drawer) drawer.hidden = true;
  };
}
