# Agent pipeline

Reusable orchestration for building animated static marketing sites on Cloudflare Pages. Written for TheAnalytico; portable to the next client by swapping [CLAUDE.md](CLAUDE.md).

## Principle

Expensive models decide. Cheap models type. Expensive models check.

Opus never writes production code here. It writes specifications precise enough that a cheaper model cannot misinterpret them, then it rejects work that misses the spec.

## Roster

| Agent | Model | Writes code | Job |
|---|---|---|---|
| `site-architect` | Opus | No | Specs, tokens, acceptance criteria, work breakdown |
| `html-builder` | Haiku 4.5 | Yes | Semantic markup from a spec |
| `css-stylist` | Sonnet 5 | Yes | Tokens, layout, responsive, section rhythm |
| `motion-engineer` | Sonnet 5 | Yes | GSAP, ScrollTrigger, Lenis modules |
| `cf-deploy` | Haiku 4.5 | Yes | `_headers`, `_redirects`, `wrangler.toml`, Pages Functions |
| `seo-auditor` | Sonnet 5 | Yes | Meta, JSON-LD, headings, alt text, perf fixes |
| `design-reviewer` | Opus | No | Final gate against the reference recording |

Cost note: Haiku handles markup and config well. It does **not** handle GSAP timelines well — misplaced `scrub`, double-registered triggers, RAF conflicts with Lenis. Motion work stays on Sonnet.

## Pipeline

```
Phase 0  site-architect     → SPEC.md per page, token table, acceptance criteria
Phase 1  css-stylist        → tokens.css + base.css          (blocking, everything depends on it)
Phase 2  html-builder       → index.html markup from spec
         cf-deploy          → _headers, _redirects, wrangler.toml, functions/  (parallel)
Phase 3  motion-engineer    → js/modules/*.js, one agent per effect module (parallel, worktree isolation)
Phase 4  design-reviewer    → compare against reference frames, list defects
Phase 5  motion-engineer /
         css-stylist        → fix defects
Phase 6  html-builder       → remaining pages, reusing Phase 2 components
Phase 7  seo-auditor        → meta, schema, Lighthouse pass
Phase 8  design-reviewer    → sign-off
```

`index.html` is the reference implementation. No other page starts until it passes Phase 4.

Phase 3 fans out one agent per module. Use worktree isolation only if agents would write the same file; separate module files mean they usually will not.

## Handoff contract

Every spec handed to a coding agent states:

1. **Files to create or edit** — exact paths, nothing outside that list
2. **Tokens to use** — variable names, never raw values
3. **Acceptance criteria** — checkable statements, not vibes
4. **Explicit non-goals** — what to leave alone

Coding agents return a file list and a one-line-per-file summary. They do not return code in prose.

## Review gates

`design-reviewer` rejects on any of:

- A hardcoded hex, px font size, or magic number outside `tokens.css`
- Motion that runs without a `prefers-reduced-motion` guard
- A second RAF loop alongside Lenis
- `width` / `height` / `top` / `left` animated anywhere but the header shell
- Content invisible with JS disabled
- An invented fact not marked `[EVIDENCE NEEDED: …]`
- Layout shift above the fold (CLS > 0.05)

## Reuse on a new client site

1. Copy `.claude/agents/` and `AGENTS.md`
2. Rewrite `CLAUDE.md`: brand, palette, type, effect inventory, content rules
3. Drop the reference recording in `examples/`
4. Run the pipeline from Phase 0
