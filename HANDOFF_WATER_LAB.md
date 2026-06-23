# Handoff — WebGL Water (Evan Wallace-inspired) — PLAN ONLY, POC NOT STARTED

> Read **`HANDOFF.md`** first for full project context. This file is the complete plan for an
> experimental interactive dark-water surface for CH00, inspired by Evan Wallace's WebGL Water.
> Written 2026-06-23 (laptop session). **Planning is done; no code, branch, or download exists yet.**
> Reason for handoff: the POC is an all-or-nothing focused-shader session and was deferred to a
> fresh Claude with full budget. **Self-contained — a fresh Claude needs only this + HANDOFF.md.**

## TL;DR

We want to test whether an **Evan Wallace-style heightfield water surface**, reskinned dark, can
become CH00's interactive sea (and later seed a surface→underwater→rise narrative). The full demo
aesthetic (bright pool, sphere, tiles, caustics) is the **opposite** of what we want. The borrowable
core is the **heightfield ripple simulation + local cursor disturbance + natural decay**, rendered as
a near-black premium maritime surface. **Build it isolated, judge it visually, risk nothing.**

Reference (viewed live 2026-06-23): https://madebyevan.com/webgl-water/ — confirmed it is a tiled
swimming pool, bright cyan water, draggable light-blue sphere, caustics on the pool floor, camera
drag, gravity toggle. Feature list includes "Heightfield water simulation" + "Draw on the water to
make ripples" (the parts we want) and raytraced refraction/caustics/AO/soft-shadows (the parts we don't).

## ⚠️ LICENSING — VERIFIED FIRSTHAND (do not re-assume)

Checked both repos directly in-browser on 2026-06-23:

- **`github.com/evanw/webgl-water`** (the demo code: `water.js`, `renderer.js`, `main.js`, `index.html`):
  **NO `LICENSE` file and GitHub detects NO license → all rights reserved by default.** Public
  visibility is NOT permission to copy. **DO NOT port, vendor, paste, or place this code in the repo —
  not even in an ignored reference folder.**
- **`github.com/evanw/lightgl.js`** (its helper lib): **MIT licensed** (LICENSE present; GitHub badge
  confirms). We're on Three.js and don't need it; if ever used, preserve the MIT notice.

**Conclusion / the only safe path:** treat the demo as **inspiration only**. Algorithms/techniques
(the heightfield wave equation, ping-pong FBO simulation, normals-from-gradient, cursor disturbance)
are **not copyrightable** — only specific code is. **Write 100% original GLSL/TS from general graphics
knowledge.** Do not transcribe Evan's source. This avoids the license issue entirely; nothing to
attribute. An optional one-line goodwill credit ("water interaction inspired by Evan Wallace's WebGL
Water") is fine but not required since we copy no code.

## What to BORROW (essential) vs SKIP

**Borrow:** heightfield simulation (water height + velocity stored in a float/half-float texture,
advanced each frame by a discrete wave equation); local disturbance injection (a small Gaussian bump
at the cursor, scaled by cursor *velocity* so movement leaves a wake); natural ripple **decay**
(damping — this is what makes it feel physical, not a cheap ripple); **normals from the heightfield**
(central-difference gradient → surface normal, used for lighting).

**Skip entirely:** sphere, pool, tiles, floor, caustics, refraction, raytracing, reflections,
environment cubemap, camera controls, gravity, soft shadows, ambient occlusion, and the demo's whole
surface-rendering pipeline. We replace rendering with a dark specular/fresnel material.

## Visual reskin direction (make it Anchor Point, not a demo)

- Palette: near-black `--abyss #04121A` → deep navy `--deep #0A2A3A`; highlights only in dim
  `--ice #BFD6E6` / `--haze #5A86A6`. **No cyan ripples** (cyan stays reserved for the film's "live
  intelligence" accent).
- Lighting: a single low, cool key light. Ripples = **subtle specular slivers** on near-black water;
  most of the surface stays dark. Moonlight on a night sea, NOT a lit pool.
- Grazing-angle **fresnel** sheen toward the horizon so it reads as a material, not a flat fill.
- Keep the accepted darker edge **vignette**; ripple energy concentrates centrally, fades at edges.
- The existing vessel **particles render above** the water; opening CH00 text stays fully legible.
- **Use the accepted `public/media/ch00-ocean.webp` as the BASE material** the heightfield perturbs
  (subtle normal-based displacement + specular on top of it). Blended, NOT replaced. It also remains
  the verbatim static fallback. (Decision: blended base — keeps the already-approved look as the
  foundation; do not go fully procedural and do not discard the still.)

## Architecture decision (locked)

- **Approach D → A, built as E:** prototype on a **hidden `/water-lab` route** with a **self-contained
  `WaterSurface` component** that is a **custom lightweight heightfield shader** (NOT a port). Once it
  wins visually, promote the same isolated component into CH00 — still **never touching `Stage.tsx`**.
- **Rejected: integrating into `Stage.tsx`** (Option C) — directly endangers the CH00–CH05 film; violates
  the hard rule. The accepted homepage must stay safe.
- CH00 promotion note: two WebGL contexts (film `Stage` + water) is fine on desktop; render the water
  in OceanBackdrop's depth band (behind the particle canvas), tiny sim resolution. If two contexts ever
  prove heavy, fold the water pass into OceanBackdrop's own canvas — still never `Stage.tsx`.

## The narrative this seeds (CH00→CH03) — mostly FAKED, deliberately

Only **CH00** is real WebGL water. **CH01–CH03 are scroll/fog/opacity/scale/mask fakery — and that's
correct**, not a compromise. A literal 3D dive would be heavy, fragile, and break the restraint.

- **CH00 surface:** the real heightfield + cursor disturbance (the one real water moment).
- **CH01 sink:** cross-fade the surface out; push darker fog/scrim in; slight scale-up + blur; colour
  deepens. Scroll-driven scalars only — no new 3D. The water sim fades out by CH01; it never has to
  survive the whole scroll.
- **CH02 underwater currents:** the **existing `Stage` particles/routes**, recoloured cooler/foggier
  and reframed as "currents." No new sim. Stays abstract.
- **CH03 rise / vessel reveal:** a bright surface-break flash/fade up into the AnchorVoyage reveal. The
  **vessel video is a SEPARATE future asset decision** (size/source/licensing) — NOT part of this water
  system, and the user has said no photos/media yet.

Avoid a literal dive: "underwater" = darker fog + cooler grade + surface left behind via opacity, all
mapped from scroll into existing systems.

## Performance & fallback requirements (build these in from the start)

- Cursor disturbance gated to **fine pointers** (`matchMedia('(pointer: fine)')`); touch never runs it.
- **Mobile fallback** + **`prefers-reduced-motion`** → the static `ch00-ocean.webp` (sim doesn't mount).
- **First-paint protection:** still renders immediately; the sim **lazy-activates** after first paint/idle
  and fades in. Homepage never waits on it.
- **DPR cap** ≤1.5 on the render target; **sim grid fixed small (128–256²)**, independent of viewport.
- **Feature-detect half-float render targets**; if absent → static fallback. (This is the demo's
  `OES_texture_float` requirement.) Prefer HalfFloat over Float for device coverage + cost.
- CH00-only: pause RAF when scrolled past CH00 or tab hidden; full dispose on unmount (textures, render
  targets, geometry, listeners). Separate WebGL context from the film; no coupling to its RAF.
- Test 60fps at 1440×900 and 1366×768 + a throttled-GPU pass (DevTools Performance + on-screen FPS meter).

## FIRST POC STEP — build ONLY this

- **Branch:** `experiment/water-lab` off `master`. Never merge until it wins visually.
- **Route:** hidden `/water-lab` — NOT added to nav; trivial to delete.
- **New files only (touch nothing else):**
  - `app/water-lab/page.tsx` — test harness (on-screen FPS meter + a couple of debug sliders for
    disturbance strength / damping / specular).
  - `components/experimental/WaterSurface.tsx` — self-contained water component (own canvas/context,
    own cleanup). Raw Three.js, consistent with the codebase (use `THREE.Timer`, not `Clock`).
  - shaders inline or `components/experimental/water/*.glsl.ts`.
- **Build first (only this):** the **dark CH00 surface** — heightfield sim (ping-pong half-float render
  targets, wave-equation update pass) + **cursor disturbance** (Gaussian bump scaled by pointer velocity)
  + **dark reskin** (near-black base from `ch00-ocean.webp`, subtle specular slivers + fresnel from
  heightfield normals) + central edge vignette. Full-viewport. Desktop pointer. That is the entire POC.
- **Do NOT build yet:** the sink/underwater transitions, CH02 reframe, CH03 vessel video, `Stage.tsx`
  integration, CH00 promotion, mobile interaction, scroll mapping. None of it.
- **Pass/fail (the user judges visually):**
  - ✅ PASS: on near-black water, a cursor crossing the surface leaves a **local, naturally-decaying
    wake** that reads **premium / physical / mysterious / maritime** — clearly better than the rejected
    cursor-wake — at a steady **60fps**.
  - ❌ FAIL: reads as a shader demo / pool / "cheap ripple," moves the whole background like parallax,
    or can't hold 60fps. If it fails → **delete the branch**, keep the accepted still. No harm to master.

## Context the POC must respect (why the bar is high)

A previous cursor-wake experiment (CH00 Step 1B, commit `cb0d3bd`) was **tried and rejected** because
it moved the whole background like "a poster behind glass" — global parallax, not physics — and "made
the page feel cheaper." It was reverted (`ba74eca`). **Do not reintroduce that.** The heightfield
approach is the *correct* tool precisely because it does **local, decaying disturbance** where the
cursor actually is — the opposite of the rejected global-parallax wake. But water interaction is
unforgiving; the POC may still not clear the user's bar, and that's an acceptable outcome.

## Hard constraints (unchanged from the project)

Do **not**: touch CH00–CH05, `Stage.tsx`, the particle system, or the scroll architecture; modify the
accepted `OceanBackdrop.tsx` during the POC; install packages (stay on Next.js/React/Three.js/GSAP/
Lenis — no new libs); add video/audio/photos; port or vendor Evan Wallace's `webgl-water` code; commit
to `master` or merge without explicit user approval. The user reviews **visually** before any commit
and wants a **masterpiece, not a rushed gimmick** — give the POC a full focused session.

## First action for the next Claude

1. `git checkout master && git pull`, `npm install`, `npm run dev`. Confirm the site runs and the
   accepted CH00 ocean still renders (don't disturb it).
2. Re-read this file + `HANDOFF.md` §0–3. Optionally open https://madebyevan.com/webgl-water/ for
   reference (do not copy its code — see licensing above).
3. Create `experiment/water-lab`, build ONLY the FIRST POC STEP above, then stop and have the user
   judge it visually against the pass/fail criteria. Do not integrate or promote until it passes.
