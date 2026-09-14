/**
 * services-pin.js
 * Movement 3 (docs/specs/12-home-restructure.md §5; concept originates in
 * docs/specs/11-…md Part C): the pinned services section on index.html —
 * Mercury pattern. Pins the stage for a scroll distance proportional to
 * the four-item list; as that scroll advances, each pillar's own panel
 * (video, `assets/video/panel-*.mp4`; see docs/panel-assets.md) scrubs
 * through its own footage via currentTime, the same technique the hero
 * used before its video was retired — this section has none of the
 * conditions that broke that one (contained, not full-bleed; dark, not
 * white; shown one at a time; no text over it), so the technique itself
 * was never the problem.
 *
 * Lazy-loaded per panel, not all four upfront: each panel's video is only
 * fetched the first time scroll approaches it (its crossfade blend
 * becomes greater than zero). A visitor who never scrolls past pillar two
 * never fetches pillars three and four's video at all.
 *
 * Global motion rules (CLAUDE.md), repeated per module:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export, no default export.
 * 3. ScrollTrigger is registered once in main.js. Modules receive it as an argument.
 * 4. Lenis is created once elsewhere; this module never creates a Lenis instance.
 * 5. The only RAF loop in the project is gsap.ticker; nothing here starts a second one.
 * 6. This module returns a cleanup function.
 * 7. Bails out to a no-op cleanup when prefers-reduced-motion: reduce
 *    matches, or when isMobile (max-width: 768px) — both per this task's
 *    own instruction, not just the site's general default. No pin, no
 *    fetch, no ScrollTrigger.create call either way: the static markup
 *    (a plain stacked list, poster images only) is already correct for
 *    both cases without any JS help — see components.css's own comment on
 *    the query this module's absolute-positioned layout lives inside,
 *    which requires the exact same two conditions to apply.
 * 8. Never animates width, height, top, or left. Opacity for the panel
 *    crossfade and item emphasis; currentTime is a media playback
 *    position, not a layout or transform property.
 * 9. will-change is set only on the two panels actively crossfading (see
 *    updateWillChange below) and removed the instant they stop.
 * 10. Queries elements with data-* attributes only, never a class selector.
 * 11. If a hook element is absent, returns a no-op cleanup immediately.
 * 12. No console.* in shipped code.
 *
 * Data hooks (index.html, source of truth):
 * - [data-services-pin-stage] — the pinned container.
 * - [data-services-pin-item="N"] — one of the four <li>, N = 0..3.
 * - [data-services-pin-panel="N"] — the visual box inside item N.
 * - [data-services-pin-poster] — always-visible <img>, the no-JS/reduced-motion fallback.
 * - [data-services-pin-video], with data-video-src — fetched lazily, per panel.
 * - [data-services-pin-active] — written by this module onto the one dominant item.
 */

const NOOP = () => {};
const PANEL_COUNT = 4;
const TRANSITION_WINDOW = 0.25; // fraction of each quarter spent crossfading, not held
const FRAME_DURATION = 1 / 30; // panel-*.mp4 are all 30fps, matching the hero's own encodes

function panelStateFor(progress) {
  const raw = Math.min(PANEL_COUNT - 1e-6, Math.max(0, progress * PANEL_COUNT));
  const index = Math.min(PANEL_COUNT - 1, Math.floor(raw));
  const localT = raw - index;
  const isLast = index === PANEL_COUNT - 1;
  const nextIndex = isLast ? index : index + 1;
  const transitionStart = 1 - TRANSITION_WINDOW;
  const blend = !isLast && localT > transitionStart ? (localT - transitionStart) / TRANSITION_WINDOW : 0;
  const dominant = blend < 0.5 ? index : nextIndex;
  return { index, nextIndex, blend, dominant };
}

export function initServicesPin({ ScrollTrigger, reduced, isMobile }) {
  const stage = document.querySelector('[data-services-pin-stage]');
  if (!stage || reduced || isMobile) return NOOP;

  const panels = [];
  for (let i = 0; i < PANEL_COUNT; i += 1) {
    const item = document.querySelector('[data-services-pin-item="' + i + '"]');
    const panelEl = document.querySelector('[data-services-pin-panel="' + i + '"]');
    if (!item || !panelEl) return NOOP;
    const poster = panelEl.querySelector('[data-services-pin-poster]');
    const video = panelEl.querySelector('[data-services-pin-video]');
    if (!poster || !video) return NOOP;
    panels.push({ item, panelEl, poster, video, loaded: false, fetching: false, objectUrl: null, willChanging: false });
  }

  let cancelled = false;

  function fetchPanel(i) {
    const panel = panels[i];
    if (panel.loaded || panel.fetching) return;
    const src = panel.video.dataset.videoSrc;
    if (!src) return;
    panel.fetching = true;
    fetch(src)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error('services-pin: fetch failed'))))
      .then((blob) => {
        if (cancelled) return;
        panel.objectUrl = URL.createObjectURL(blob);
        panel.video.src = panel.objectUrl;
        panel.video.addEventListener(
          'loadedmetadata',
          () => {
            if (cancelled) return;
            panel.loaded = true;
            panel.video.style.opacity = '1';
          },
          { once: true }
        );
      })
      .catch(() => {
        panel.fetching = false; // allow a retry on a later approach
      });
  }

  function updateWillChange(panel, shouldWillChange) {
    if (shouldWillChange && !panel.willChanging) {
      panel.panelEl.style.willChange = 'opacity';
      panel.willChanging = true;
    } else if (!shouldWillChange && panel.willChanging) {
      panel.panelEl.style.willChange = '';
      panel.willChanging = false;
    }
  }

  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => '+=' + Math.round(window.innerHeight * PANEL_COUNT),
    pin: true,
    pinSpacing: true,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const state = panelStateFor(self.progress);
      const transitioning = state.blend > 0 && state.blend < 1;

      panels.forEach((panel, i) => {
        let opacity = 0;
        if (i === state.index) opacity = 1 - state.blend;
        else if (i === state.nextIndex) opacity = state.blend;
        panel.panelEl.style.opacity = String(opacity);

        const relevant = i === state.index || i === state.nextIndex;
        updateWillChange(panel, transitioning && relevant);

        if (relevant && opacity > 0) {
          fetchPanel(i);
        }

        if (relevant && panel.loaded && panel.video.duration) {
          const localProgress = Math.min(1, Math.max(0, self.progress * PANEL_COUNT - i));
          const clamped = Math.min(localProgress * panel.video.duration, panel.video.duration - FRAME_DURATION);
          panel.video.currentTime = Math.max(0, clamped);
        }

        if (i === state.dominant) {
          if (!panel.item.hasAttribute('data-services-pin-active')) {
            panel.item.setAttribute('data-services-pin-active', '');
          }
        } else if (panel.item.hasAttribute('data-services-pin-active')) {
          panel.item.removeAttribute('data-services-pin-active');
        }
      });
    },
  });

  return function cleanup() {
    cancelled = true;
    trigger.kill();
    panels.forEach((panel) => {
      if (panel.objectUrl) URL.revokeObjectURL(panel.objectUrl);
      panel.video.removeAttribute('src');
      panel.video.load();
      panel.video.style.opacity = '';
      panel.panelEl.style.opacity = '';
      panel.panelEl.style.willChange = '';
      panel.item.removeAttribute('data-services-pin-active');
    });
  };
}
