/**
 * Cloudflare Worker entry point.
 *
 * The site is static assets plus one dynamic route. Assets are served by the
 * ASSETS binding configured in wrangler.toml, which also honours the _headers
 * and _redirects files at the repository root.
 *
 * POST /api/contact is handled here. The handler itself still lives in
 * functions/api/contact.js and is imported rather than duplicated: it was
 * written as a Pages Function with the signature onRequestPost({ request, env }),
 * which a Worker can call directly. That file is excluded from the served
 * assets via .assetsignore, but it is still bundled as code — being ignored as
 * an asset does not stop it being imported.
 */

import { onRequestPost as handleContact } from './functions/api/contact.js';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Canonical host — PARTIAL COVERAGE ONLY. Read before relying on this.
    //
    // It cannot live in _redirects: Workers static assets only support relative
    // destinations, so an absolute cross-host rule is parsed and skipped with
    // "Only relative URLs are allowed. Skipping absolute URL".
    //
    // But it cannot fully live here either. With default asset routing, a
    // request that matches a static asset is served by the asset layer WITHOUT
    // invoking this script. Measured in wrangler dev with Host www.theanalytico.com:
    //   /                     -> 200, worker never ran, no redirect
    //   /api/contact          -> 301, worker ran
    //   /__nonexistent-probe  -> 301, worker ran
    // So this only catches non-asset paths, which is the minority of traffic.
    //
    // The correct fix is one of:
    //   1. A Cloudflare Redirect Rule on the zone (free, runs at the edge,
    //      covers every request). Preferred.
    //   2. Only route the apex hostname to this Worker so www never reaches it.
    //   3. Set run_worker_first = true under [assets] in wrangler.toml, which
    //      makes this branch authoritative at the cost of a Worker invocation
    //      on every asset request.
    // Kept here as a backstop for non-asset paths until one of those is in place.
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/contact') {
      // Method gating lives here because Pages did it implicitly by filename.
      // A Worker gets every method, so it has to be explicit.
      if (request.method !== 'POST') {
        return new Response(
          JSON.stringify({ ok: false, error: 'method_not_allowed' }),
          { status: 405, headers: { ...JSON_HEADERS, Allow: 'POST' } }
        );
      }

      try {
        return await handleContact({ request, env, ctx });
      } catch (err) {
        // Never leak internals or submitted personal data to the client.
        return new Response(
          JSON.stringify({ ok: false, error: 'server_error' }),
          { status: 500, headers: JSON_HEADERS }
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};
