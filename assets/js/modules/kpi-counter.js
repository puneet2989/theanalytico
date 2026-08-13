/**
 * kpi-counter.js
 * Inventory item 11 — KPI counters: count up on enter.
 *
 * Global motion rules (spec 08 section 0), repeated here:
 * 1. One effect per file. No module imports another module.
 * 2. Single named export. No default export.
 * 3. ScrollTrigger is registered once, in main.js. This module receives it as an argument.
 * 4. Lenis is created once elsewhere; this module does not touch it.
 * 5. The only RAF loop in the project is gsap.ticker. Never call requestAnimationFrame here.
 * 6. This module returns a cleanup function.
 * 7. GATING EXCEPTION (decided at spec time, overrides the usual reduced-motion bail):
 *    a static "0" or a blank counter is a factual error a user would see as broken data,
 *    so on `reduced` this module writes the FINAL value immediately and never animates.
 * 8. This module does NOT bail out on `isMobile`. Spec 08 section 11 marks this module
 *    mobile-enabled: a static zero on mobile would also be a factual error.
 * 12. Query elements with data-* attributes only. Never a class selector.
 * 13. If no [data-counter] elements exist, return a no-op cleanup immediately.
 * 14. Never log to the console in shipped code.
 *
 * VENDOR LOADING OVERRIDE (project-level, overrides spec 08 section 0 item 15):
 * GSAP, ScrollTrigger and Lenis are self-hosted UMD builds loaded as classic scripts
 * (window.gsap, window.ScrollTrigger, window.Lenis). This module takes them as
 * arguments instead of importing them.
 */

export function initKpiCounter({ gsap, ScrollTrigger, reduced, isMobile }) {
  const NOOP = () => {};
  const counters = Array.from(document.querySelectorAll('[data-counter]'));

  if (counters.length === 0) {
    return NOOP;
  }

  function readConfig(el) {
    const to = parseFloat(el.getAttribute('data-counter-to'));
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const decimalsRaw = el.getAttribute('data-counter-decimals');
    const decimals = decimalsRaw ? parseInt(decimalsRaw, 10) : 0;
    return { to, prefix, suffix, decimals };
  }

  function formatValue(value, { prefix, suffix, decimals }) {
    const rounded = Number(value.toFixed(decimals));
    const localized = rounded.toLocaleString('en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    return `${prefix}${localized}${suffix}`;
  }

  function writeFinal(el) {
    const config = readConfig(el);
    if (Number.isNaN(config.to)) {
      return;
    }
    el.textContent = formatValue(config.to, config);
  }

  // CRITICAL GATING EXCEPTION: a reduced-motion user must see the final number,
  // never 0 and never a partial value. Write it immediately and do not animate.
  if (reduced) {
    counters.forEach(writeFinal);
    return NOOP;
  }

  // Group counters by their nearest list ancestor so the 0.12s stagger in
  // spec 08 section 11 ("stagger across the counters within one group") applies
  // per KPI row rather than globally. Spec 08's trigger table also says the
  // ScrollTrigger is per counter element, so each counter keeps its own
  // trigger; the group stagger is reproduced as a per-index tween delay
  // instead of GSAP's array-stagger, since array-stagger requires one shared
  // tween call and would conflict with per-element triggers.
  const groups = new Map();
  counters.forEach((el) => {
    const group = el.closest('ul, ol') || document.body;
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group).push(el);
  });

  const tweens = [];
  const triggers = [];

  groups.forEach((groupCounters) => {
    groupCounters.forEach((el, index) => {
      const config = readConfig(el);
      if (Number.isNaN(config.to)) {
        return;
      }

      // Do NOT touch el.textContent here. The shipped markup already holds the
      // correct final value for no-JS users, and it must stay on screen,
      // untouched, until the moment this counter's ScrollTrigger actually
      // fires. Writing "0" at init would flash a wrong value at anyone who
      // lands with the KPI block already in view or scrolls past it fast,
      // before `once`-fire even happens.
      const proxy = { value: 0 };

      const tween = gsap.to(proxy, {
        value: config.to,
        duration: 1.6,
        ease: 'none',
        delay: index * 0.12,
        onStart() {
          // The trigger has just fired (toggleActions "play"). Switch to the
          // start value and hide from the accessibility tree for the tween's
          // duration in the same tick the animation begins, so the visible
          // authored value is replaced by "0" and the first animated frame
          // back-to-back — no frame is painted with a stale zero beforehand.
          el.textContent = formatValue(0, config);
          el.setAttribute('aria-hidden', 'true');
          el.style.willChange = 'contents';
        },
        onUpdate() {
          el.textContent = formatValue(proxy.value, config);
        },
        onComplete() {
          el.textContent = formatValue(config.to, config);
          el.removeAttribute('aria-hidden');
          el.style.willChange = '';
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true
        }
      });

      tweens.push(tween);
      if (tween.scrollTrigger) {
        triggers.push(tween.scrollTrigger);
      }
    });
  });

  return function cleanup() {
    triggers.forEach((trigger) => trigger.kill());
    tweens.forEach((tween) => tween.kill());
    // Cleanup must never leave a partial number on screen.
    counters.forEach((el) => {
      writeFinal(el);
      el.removeAttribute('aria-hidden');
      el.style.willChange = '';
    });
  };
}
