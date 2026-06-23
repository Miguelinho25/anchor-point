# Handoff — CH00 Ocean Atmosphere (cursor-wake work)

> Focused handoff for continuing the CH00 ocean work on another device.
> For broader project context read **`HANDOFF.md`** first — this file complements it.
> Written 2026-06-23.

## TL;DR

We are evolving CH00 (the dark-sea opening) into a **living, media-driven ocean**, entirely inside one isolated component: **`components/site/OceanBackdrop.tsx`**. Everything is additive and reversible — no chapter code, no `Stage.tsx`, no scroll architecture, no new packages.

**You're picking up mid-review of Step 1B (cursor wake).** It is committed as **WIP, NOT approved**, because the home-PC headless preview can't convey the live mouse feel. **Your job on the laptop: run it, move a real mouse over CH00, and decide.**

## Branch & commits

- **Branch:** `ch00-ocean-atmosphere-step0` (pushed to origin)
- `4811668` — master base (Three.js typecheck fix)
- `a000663` — **APPROVED**: "Add CH00 ocean atmosphere backdrop" (the Step 1A.3 living-still base)
- `cb0d3bd` — **WIP / pending review**: "CH00 cursor wake (Step 1B)"

```bash
git fetch origin
git checkout ch00-ocean-atmosphere-step0
git pull
cd anchor-point && npm install && npm run dev   # http://localhost:3000
```

`master` is untouched. If the wake is rejected, revert to the approved base with:
```bash
git reset --hard a000663
```

## What's approved (the base — do not regress)

The `a000663` "living still" CH00 ocean, all in `OceanBackdrop.tsx`:
- Optimized dark-ocean still `public/media/ch00-ocean.webp` (37.6 KB), layered at `z-index:-1` **behind** the transparent WebGL canvas, **homepage + CH00 only** (`usePathname()` gate + scroll fade).
- Two DOM layers drift/breathe at different slow speeds (depth) + a faint screen-blended **luminance breath**; **edge vignette** deepened toward abyss; **recede + centre pool** keep text/particles readable.
- **CH00-only fade:** held full until `0.45vh`, gone by `1.30vh` (before CH01 at ~2vh). Passive scroll listener — does **not** touch GSAP/Lenis/scrollStore.
- Respects `prefers-reduced-motion`.

## What's pending (Step 1B — the cursor wake)

Replaces a **rejected** earlier Step 1B (whole-layer mouse parallax — felt like "a poster moving behind glass"). The new approach is a **localized wake**, not parallax.

**How it works:**
1. A small offscreen 2D canvas (200×120) is the **disturbance field**. Each frame it (a) fades the whole field toward black a little (the wake's decaying tail) and (b) stamps a soft white blob along the cursor's path (interpolated, intensity ∝ speed). So the field is bright along the *recent* cursor path and fades in ~1–1.5 s. **No expanding rings** (it's a decaying trail, not a wave simulation).
2. The ocean image is rendered on an **isolated raw-WebGL fullscreen quad** (no three.js, no `Stage.tsx`). The fragment shader samples the field, computes its **gradient**, and **bends the ocean texture's UVs locally** by that gradient (+ a small smear along cursor velocity). Where the field is 0 (away from the path) there is zero distortion → calm water.
3. The autonomous 1A.3 breathing/drift + two-layer depth are reproduced **in-shader** (so it's alive when the mouse is still). The DOM luminance/vignette/recede overlays stay on top unchanged.

**Renderer selection (runtime):**
- **Desktop** (`hover:hover` + `pointer:fine`, motion allowed) → WebGL ocean + wake. On first rendered frame it hides the DOM ocean layers.
- **Touch / coarse / reduced-motion / no-WebGL** → the approved DOM/CSS ocean (no wake). Reduced-motion → static.

**Performance:** continuous rAF, but DPR capped at 1.5 and the GPU draw is skipped while the backdrop is faded out (scrolled past CH00) or the tab is hidden.

## The review you need to do (laptop, real mouse)

Pass criteria (from the brief):
- Feels like the cursor is **traversing/disturbing** the water; tactile; not parallax, not a cheap ripple, not "game water," not a shader demo.
- Text stays the focal point; vessel particles stay readable; premium/restrained; dark navy dominant.
- Mouse still → wake fades, ocean returns to calm living state.

If it's **too subtle** or **too strong**, tune these constants at the top of `OceanBackdrop.tsx` (no other code needs touching):

| Constant | Now | Effect |
|---|---|---|
| `DISP_GRAD` | `0.022` | how hard the wake **bends** the texture (main "strength" dial) |
| `DISP_VEL` | `0.012` | extra **smear along** cursor motion (directional feel) |
| `DECAY` | `0.05` | wake **fade speed** — higher = shorter tail |
| `STAMP` | `0.085` | wake **width** (brush radius, fraction of field) |
| `WAKE_SHADE` | `0.10` | subtle darkening on wake slopes (keep low; **no brightening**) |

Suggested first nudges if too subtle: `DISP_GRAD → 0.030`, `DISP_VEL → 0.018`. If too gimmicky: `DISP_GRAD → 0.015`.

## Verification notes / gotchas

- The **headless preview cannot drive or show the live wake feel** — it only confirms the mechanism (GL active, ocean renders, wake stamps + decays, no errors). Judge feel with a real mouse.
- Stale-CSS rule still applies: if the shell/ocean ever renders unstyled after a checkout under a running dev server → stop server, `rm -rf .next`, `npm run dev`.
- WebGL fallback is intentional: if the shader fails to compile/link it logs to console and the **approved DOM ocean stays visible** (no blank).

## Hard constraints (unchanged)

Do **not**: touch CH01–CH05, `Stage.tsx`, the WebGL particle system, or the scroll architecture; install packages; add video/audio; commit to `master` or merge without explicit approval. Keep everything inside `OceanBackdrop.tsx`.

## Next steps after your decision

- **Approve** → re-commit cleanly (replace the WIP message), then ask before merging to `master`.
- **Tune** → adjust the dials above, re-review.
- **Reject** → `git reset --hard a000663` (keeps the approved living-still base).
- Then the roadmap returns to the deferred CH00→CH05 media evolution (see `HANDOFF.md` / the media-evolution plan).
