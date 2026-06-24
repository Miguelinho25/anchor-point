# Handoff - CH00 Ocean Atmosphere (HISTORICAL / superseded)

> Historical record of the older CH00 living-still ocean step.
> Updated 2026-06-24.
> For current project state read **`HANDOFF.md`** first. The current approved CH00 foundation is now the WebGL water system, not only this older living-still ocean.

## TL;DR

This file documents the earlier **living-still ocean** implementation that shipped before the
current WebGL water system. It remains useful as history and fallback context, but it is no longer
the latest CH00 baseline.

Current accepted state is documented in `HANDOFF.md` and `HANDOFF_WATER_LAB.md`:

- CH00 uses approved dark WebGL water as the primary foundation.
- `/water-lab` remains the isolated water experiment.
- Static pages now use the CH00-style WebGL water backdrop.
- The old living-still ocean remains relevant as fallback/revert history.

Important distinction: the rejected interaction in this file was the old poster-like cursor wake.
It is not the same as the later approved WebGL water ripple interaction.

## What shipped (on `master`)

The "living-still" ocean, all in `OceanBackdrop.tsx` + `public/media/ch00-ocean.webp` (~38 KB) +
3 lines in `app/layout.tsx`:

- Optimized dark-ocean still layered at `z-index:-1` **behind** the transparent WebGL canvas.
- **Homepage + CH00 only** via `usePathname() === '/'` gate + a passive scroll fade.
- **Two DOM layers** drift/breathe at different slow speeds (depth) + a faint screen-blended
  **luminance breath**. Motion values were tuned across three passes (1A → 1A.2 → 1A.3) before
  approval — the user wanted it *noticeably* alive but still premium/restrained.
- **Edge vignette** deepened toward abyss (0.88 at the edge); a recede + centre pool keeps the
  vessel particles and CH00 text legible on top.
- **CH00-only fade:** held full until `0.45vh`, gone by `1.30vh` (before CH01 at ~2vh). Passive
  scroll listener only — does **not** touch GSAP / Lenis / ScrollTrigger / scrollStore.
- Respects `prefers-reduced-motion` (falls back to the static still). **No mouse interaction.**

## What was tried and rejected (do NOT re-introduce without explicit approval)

- **Step 1B whole-layer mouse parallax** — felt like "a poster moving behind glass."
- **Step 1B cursor wake** (raw-WebGL quad + decaying disturbance-field shader that bent the ocean
  UVs along the cursor path) — reviewed on a real device; "makes the page feel cheaper." Reverted
  cleanly in `ba74eca`; the wake commit `cb0d3bd` is kept in history only.

Do **not** add any form of mouse/cursor/pointer interaction to the ocean again without the user
asking for it specifically.

## Git trail

- `4811668` — Three.js typecheck fix (so `next build` passes)
- `a000663` — **approved** living-still ocean base
- `cb0d3bd` — cursor wake (rejected; history only)
- `ba74eca` — remove rejected cursor wake
- `3519925` — **merge to `master`** (`--no-ff`, preserves the above)

Branch `ch00-ocean-atmosphere-step0` is merged and kept for history (do not delete).

## Next CH00 options (none started — do not begin without the user)

1. **Ship as-is** — it's already on `master`; nothing required.
2. **Step 2 — subtle depth / haze** — purely CSS/DOM atmosphere (e.g. a faint drifting haze or
   light-shaft layer). No new interaction, same isolation in `OceanBackdrop.tsx`.
3. **Broader CH00→CH05 media evolution** — the larger cinematic plan from the earlier planning
   turn (real footage in CH03, atmospheric descent in CH01, etc.). Big scope; plan first.

## Hard constraints (unchanged)

Do **not**: touch CH01–CH05, `Stage.tsx`, the WebGL particle system, or the scroll architecture;
install packages; add video/audio; add mouse/cursor interaction; commit to `master` or merge
without explicit approval. Keep ocean work inside `OceanBackdrop.tsx`.
