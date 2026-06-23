# Handoff — CH00 Ocean Atmosphere

> Focused handoff for continuing the CH00 ocean work on another device.
> For broader project context read **`HANDOFF.md`** first — this file complements it.
> Updated 2026-06-23.

## TL;DR

CH00 has a **living, media-driven dark ocean** backdrop — entirely inside one isolated component:
**`components/site/OceanBackdrop.tsx`**. Everything is additive and reversible — no chapter code,
no `Stage.tsx`, no scroll architecture, no new packages.

**Current accepted state: Step 1A.3 living-still ocean base.** A cursor-wake pass (Step 1B) was
implemented, reviewed on a real device, and **rejected** ("makes the page feel cheaper"). It has
been reverted. There is **no mouse/cursor interaction** on the ocean.

## Branch & commits

- **Branch:** `ch00-ocean-atmosphere-step0` (pushed to origin)
- `4811668` — master base (Three.js typecheck fix)
- `a000663` — **APPROVED**: "Add CH00 ocean atmosphere backdrop" (living-still base)
- `cb0d3bd` — rejected cursor wake (WIP, kept in history)
- `86073f0` — handoff docs
- HEAD — **"Remove rejected CH00 cursor wake"** (revert of cb0d3bd + this update)

```bash
git fetch origin
git checkout ch00-ocean-atmosphere-step0
git pull
cd anchor-point && npm install && npm run dev   # http://localhost:3000
```

`master` is untouched. The ocean branch is the only active work.

## What's accepted — the living-still ocean (Step 1A.3)

All in `OceanBackdrop.tsx` + `public/media/ch00-ocean.webp` (37.6 KB) + 3 lines in `app/layout.tsx`:

- Optimized dark-ocean still layered at `z-index:-1` **behind** the transparent WebGL canvas.
- **Homepage + CH00 only** via `usePathname() === '/'` gate + passive scroll fade.
- **Two DOM layers** drift/breathe at different slow speeds (depth) + a faint screen-blended
  **luminance breath**. Values tuned across three passes (1A → 1A.2 → 1A.3) before approval.
- **Edge vignette** deepened toward abyss (0.88 at edge); recede + centre pool keep
  text/particles readable.
- **CH00-only fade:** held full until `0.45vh`, gone by `1.30vh` (before CH01 at ~2vh).
- **No mouse interaction.** Reduced-motion → static. Touch → normal.

## What was rejected (do NOT re-introduce)

- **Step 1B whole-layer mouse parallax** — felt like "a poster moving behind glass."
- **Step 1B cursor wake (raw WebGL disturbance field)** — reviewed on a real device; made the
  page feel cheaper. Reverted cleanly.

Do **not** add any form of mouse/cursor interaction to the ocean without explicit re-approval.

## Next steps

The ocean base is approved and clean. Options from here (user's call, do not start without asking):

1. **Merge to `master`** — the living-still ocean is solid; could be shipped as-is.
2. **Step 2 — subtle depth of field / haze layer** — purely CSS/DOM, no new interaction.
3. **Broader CH00→CH05 media evolution** — see the earlier planning doc in conversation history.

## Hard constraints (unchanged)

Do **not**: touch CH01–CH05, `Stage.tsx`, the WebGL particle system, or the scroll architecture;
install packages; add video/audio; add mouse/cursor interaction; commit to `master` or merge
without explicit approval. Keep ocean work inside `OceanBackdrop.tsx`.
