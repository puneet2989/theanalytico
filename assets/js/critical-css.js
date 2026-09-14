/**
 * critical-css.js — loads the non-critical stylesheets without blocking
 * first paint, and without an inline `onload=` handler (CLAUDE.md forbids
 * inline `on*` attributes, so the usual
 * `<link media="print" onload="this.media='all'">` trick is not allowed).
 *
 * The four stylesheet `<link>` elements are created here, in JS, rather
 * than written as static tags in the HTML: a static `media="print"` link
 * can finish loading (from cache, in particular) before a later `<script>`
 * gets a chance to attach a `load` listener to it, silently leaving that
 * sheet stuck at `media="print"` forever — confirmed by hand, this raced
 * and lost for the smaller of the four files (tokens.css, base.css) while
 * components.css, slower to fetch, happened to win the race. Creating the
 * element and attaching the listener BEFORE its `href` is ever set removes
 * the race entirely: nothing can finish loading before a fetch has even
 * been requested.
 *
 * This script itself is a classic, non-deferred, non-module `<script src>`
 * so it runs synchronously, in document order, right where the old static
 * `<link rel="stylesheet">` tags used to sit — `document.currentScript`
 * depends on that. The stylesheet hrefs come from this script tag's own
 * `data-css` attribute (comma-separated), so this file stays identical
 * across every page while the actual file list (three files on most pages,
 * four where pages.css is also used) varies per page. A `<link
 * rel="preload" as="style">` for each href, written in the HTML right
 * before this script, is what actually starts the fetch early — this file
 * only decides when each sheet starts applying. A <noscript> fallback next
 * to it still loads every stylesheet normally with JS disabled, per
 * CLAUDE.md's no-JS rule.
 */
(function () {
  var script = document.currentScript;
  var hrefs = (script.getAttribute('data-css') || '').split(',').filter(Boolean);

  hrefs.forEach(function (href) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.media = 'print';
    link.addEventListener('load', function () {
      link.media = 'all';
    });
    link.href = href;
    document.head.appendChild(link);
  });
})();
