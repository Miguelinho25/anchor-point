# Handoff — WebGL Water System

> **Status updated 2026-06-23.**
> This file used to be the plan for the Evan Wallace-inspired water POC. That POC is now implemented, visually approved, merged into `master`, and quality-hotfixed.
> Read `HANDOFF.md` first; it is the source of truth for current project state.

---

## 1. Current Water Status

The WebGL water system is no longer plan-only.

Shipped:

- Hidden `/water-lab` route.
- Original dark heightfield-style WebGL water experiment.
- CH00 homepage integration using the WebGL water as the primary ocean foundation.
- Static/living ocean base retained as fallback/revert path.
- Ripple quality hotfix merged into `master`.

Important commits:

| Commit | Meaning |
|---|---|
| `81408a1` | Add isolated water-lab WebGL water experiment |
| `13f8168` | Test WebGL water integration in CH00 |
| `3c291b4` | Improve WebGL water ripple quality |

`master` currently includes all of the above.

---

## 2. What Was Accepted

The accepted CH00 direction:

- Dark physical ocean foundation.
- Local mouse disturbance that feels more physical than the rejected old cursor wake.
- Slow autonomous water life.
- No pool-demo look.
- No bright cyan ripple treatment.
- No global parallax wake.
- Opening text remains readable.
- Faint CH00 particles remain visible.
- `/water-lab` stays isolated for testing and is not linked in nav.

The accepted quality hotfix:

- Increased simulation/detail budget.
- Smoothed normal sampling.
- Reduced chunky/pixelated ripple appearance.
- Kept the dark mood and did not redesign the water.

---

## 3. Files Involved

| File | Role |
|---|---|
| `app/water-lab/page.tsx` | Hidden internal test page |
| `components/experimental/WaterSurface.tsx` | Self-contained original WebGL water component |
| `components/site/OceanBackdrop.tsx` | CH00 homepage water layering and fallback |
| `components/Stage/Stage.tsx` | Existing vessel/route particle field; touched during CH00 integration to keep CH00 particles faint but visible |

Do not delete `/water-lab`.

---

## 4. Licensing Note

The Evan Wallace demo was used only as visual/technical inspiration.

Do not copy Evan Wallace source code into this repo.

Earlier research found:

- `github.com/evanw/webgl-water` has no detected license, so source code must not be copied or ported.
- General concepts like heightfield simulation, ping-pong render targets, normals from gradients, and cursor disturbance can be implemented independently.

Current implementation is original project code, not a vendored port.

---

## 5. Rejected Water-Related Attempts

Rejected old CH00 cursor wake:

- Felt cheap.
- Moved the background like a poster/parallax layer.
- Must not be reintroduced.

Rejected final shader unification tweak:

- Tried to make ambient lighting and ripple response feel more unified.
- Made ripples pixelated/worse.
- Reverted before merge.

Rejected CH00 -> CH01 underwater transition attempt:

- See `HANDOFF.md` §5.
- Fully reverted.
- Do not rebuild that approach without a new prompt and a different plan.

---

## 6. If You Need To Verify Water

```bash
git checkout master
git pull origin master
npm run dev
```

Then check:

- `http://localhost:3000/`
- `http://localhost:3000/water-lab`

Expected:

- CH00 water loads cleanly.
- No old background flash.
- Idle water is alive.
- Mouse ripples are smooth, not pixelated.
- `/water-lab` still shows the internal water experiment.
- CH01-CH05 still scroll normally.

---

## 7. Future Direction

The CH00 water system is step one toward making Anchor Point feel more physical and cinematic.

Do not treat this as permission to add lots of effects. The creative rule remains:

**Add by substitution.**

Future physical/media upgrades should replace weaker abstract layers, not pile on top of them.
