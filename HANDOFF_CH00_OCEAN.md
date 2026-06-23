# Handoff — CH00 Ocean Atmosphere (DONE / merged)

> Record of the CH00 living-ocean step. For broader project context read **`HANDOFF.md`** first.
> Updated 2026-06-23.

## TL;DR

CH00 (the dark-sea opening) now has a **living, media-driven ocean** backdrop. It is **complete,
approved, and merged to `master`** (`3519925`). Everything lives in one isolated component —
**`components/site/OceanBackdrop.tsx`** — plus one asset and 3 lines in `app/layout.tsx`. Fully
additive and reversible; no chapter code, no `Stage.tsx`, no scroll architecture, no new packages.

**There is no pending review and no open branch work for CH00.** A cursor-wake interaction was
tried and rejected (see below) — the shipped state is the **living-still ocean only**.

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
