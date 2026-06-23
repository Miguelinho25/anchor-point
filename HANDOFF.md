# Anchor Point — Cross-Device Handoff

> **Latest status: 2026-06-23, end of laptop/Codex session.**
> The accepted code baseline is `3c291b4`, which contains the approved CH00 WebGL water foundation plus the ripple-quality hotfix.
> This handoff itself may be a newer docs-only commit on `master`.
> Before this handoff update, the local branch was `ch01-underwater-transition`, clean, pointing at the same code commit as `master`.
> The local dev server was stopped; port `3000` was confirmed clear.

This file is the first thing a fresh Claude/Codex should read before touching the project.

---

## 0. Current State In One Paragraph

Anchor Point is a premium dark maritime-intelligence website with a cinematic CH00-CH05 homepage, a restrained site shell, functioning placeholder routes, an About page, an isolated `/water-lab`, and the approved CH00 WebGL water surface now merged into `master`. The accepted homepage starts with a dark physical WebGL water surface, faint vessel/data particles, then proceeds through the existing cinematic narrative into AnchorVoyage, Anchor AI, and the final Anchor Point operating-system reveal. The most recent accepted code is the water ripple quality hotfix at `3c291b4`. A first CH00 -> CH01 underwater-transition attempt was tried on `ch01-underwater-transition`, rejected, and fully reverted; do not restart it until the user gives a new prompt.

---

## 1. Hard Rules

- Do not work directly on `master` unless the user explicitly asks for a merge or a tiny approved hotfix.
- Do not commit, push, or merge until the user visually approves.
- Do not delete feature branches unless the user explicitly asks.
- Do not install packages unless the user explicitly approves.
- Do not add Framer Motion, Motion, Spline, or new animation libraries.
- Do not copy Evan Wallace WebGL Water source code. The water work must remain original implementation inspired only by general heightfield concepts.
- Do not invent fake clients, metrics, testimonials, dashboards, product claims, or media.
- Do not redesign CH00-CH05 casually. The film is the hero experience.
- Keep `/water-lab` available as the isolated water experiment.
- Keep the approved CH00 WebGL water on `master` intact unless the user gives a specific prompt.

---

## 2. Git State

Remote:

```bash
https://github.com/Miguelinho25/anchor-point.git
```

Current important commits:

| Commit | Status | Meaning |
|---|---|---|
| `3c291b4` | `master`, pushed | Improve WebGL water ripple quality |
| `13f8168` | merged | Test WebGL water integration in CH00 |
| `81408a1` | merged | Add isolated water-lab WebGL water experiment |
| `5a78a8e` | merged | Clarify Mont-Fort standard and creative North Star |
| `f030a25` | merged | Add About page and founder section |
| `dc3f89a` | merged | Build site shell navigation and CTA |
| `37918cf` | merged | Apply Phase 2 Mont-Fort restraint polish |
| `b4752f0` | merged | Apply Phase 1 Mont-Fort restraint polish |

Project state immediately before this handoff docs update:

```text
branch: ch01-underwater-transition
working tree: clean
HEAD: 3c291b4
dev server: stopped
port 3000: clear
```

Important branch note:

- `ch01-underwater-transition` currently contains no unique committed work. It was created from latest `master`, used for a rejected attempt, then restored clean.
- Keep it or discard it later only if the user asks. For a fresh new attempt, it is usually safer to create a new branch from `master`.

To resume safely:

```bash
git fetch origin
git checkout master
git pull origin master
npm install
npm run dev
```

Start new work from a fresh branch:

```bash
git checkout -b <new-feature-branch>
```

---

## 3. What Is Shipped

### Cinematic Homepage

The homepage remains the core product experience:

| Chapter | Current role |
|---|---|
| CH00 | Dark physical WebGL ocean surface + faint vessel/data particles + opening copy |
| CH01 | The world organizes into maritime intelligence; statement: "The intelligence layer for global shipping." |
| CH02 | Fragmented maritime data converges around one vessel |
| CH03 | AnchorVoyage module reveal |
| CH04 | Anchor AI live intelligence layer |
| CH05 | Anchor Point parent operating-system reveal |

### Site Shell

Merged and working:

- Fixed premium header/nav
- Final CTA after CH05
- Footer
- `/anchor-voyage`
- `/anchor-ai`
- `/contact`
- `/about`

The `About` page is approved as the current base. It introduces Anchor Point as founded by three university-student co-founders:

- Miguel Morett
- Argenis Omaña
- Ansh Sahadew

Do not add photos or rewrite the About page unless asked. Real photos and copy refinement are future work.

### Water Work

Merged and working:

- Hidden `/water-lab` route.
- Original WebGL heightfield water experiment.
- CH00 integration using the WebGL water as the primary dark ocean foundation.
- Fallback/static ocean base retained.
- Ripple quality hotfix merged into `master`.

`/water-lab` remains available and should not be added to nav.

---

## 4. Water Implementation Notes

Key files:

| File | Role |
|---|---|
| `components/experimental/WaterSurface.tsx` | Self-contained original WebGL water component used by `/water-lab` and CH00 backdrop mode |
| `app/water-lab/page.tsx` | Hidden isolated test route |
| `components/site/OceanBackdrop.tsx` | Homepage CH00 water/backdrop layering and fallback |
| `components/Stage/Stage.tsx` | Existing cinematic vessel/route WebGL stage |

Important accepted behavior:

- CH00 water should feel dark, physical, premium, and restrained.
- Mouse interaction should feel like local disturbance on the same water surface.
- No bright pool look.
- No toy ripple look.
- No global cursor parallax/wake. That earlier cursor experiment was rejected and must not return.
- CH00 particles should remain faint but visible.
- Opening text remains dominant and readable.
- `/water-lab` remains visually separate for testing.

Ripple quality hotfix at `3c291b4`:

- Increased sim resolution for the lab/backdrop.
- Increased pixel ratio modestly.
- Smoothed the water normal calculation so mouse ripples no longer look chunky/pixelated.
- Build passed before merge.

---

## 5. Rejected Work

### Rejected: Old CH00 Cursor Wake

An earlier cursor/wake experiment before the WebGL water was rejected because it felt cheap, like moving a poster/background rather than disturbing a physical surface. Do not reintroduce it.

### Rejected: Final Shader Unification Tweak

A shader tweak intended to unify ambient lighting and ripple normals made the water worse and pixelated. It was reverted before merging the CH00 water integration. The accepted baseline is `13f8168`, followed by the approved quality hotfix `3c291b4`.

### Rejected: CH00 -> CH01 Underwater Transition Attempt

Branch used:

```text
ch01-underwater-transition
```

What was attempted:

- CH00 water receding upward during scroll.
- DOM underwater fog/volume overlay.
- Stage particle/current changes.
- Shared pointer signal from WaterSurface to Stage.
- CH01 routes/particles reframed as underwater currents.

Why user rejected it:

- Did not feel like sinking underwater.
- CH01 became visually worse.
- Route/current animation looked buggy.
- Particles/routes became too obvious and graph-like.
- Felt like an effect layer, not an underwater world.
- Did not feel premium/cinematic enough.

Action already taken:

```bash
git restore app/globals.css app/page.tsx components/Stage/Stage.tsx components/experimental/WaterSurface.tsx components/site/OceanBackdrop.tsx lib/scrollStore.ts
```

Result:

```text
working tree clean
```

Do not make a new CH01 underwater attempt until the user gives a new prompt.

---

## 6. Mont-Fort Standard And Creative North Star

Mont-Fort is the standard for quality, restraint, production value, and cinematic craft.

Critical distinction:

- Mont-Fort is **not** the visual template.
- Anchor Point must keep its current identity: dark abyss/navy palette, instrument-blue restraint, cinematic maritime intelligence mood, current typography direction.
- We are trying to reach Mont-Fort's level of craft while staying in Anchor Point's own world.

The user's direction:

- The current Anchor Point vibe, colors, and dark identity are correct.
- Future upgrades should use real media, 3D objects, and physical interactive surfaces to raise production value.
- The CH00 water project is step one of making the site feel more real and physical.
- Add by substitution: each new real/premium element should replace an abstract weaker element, not pile on top.
- Avoid a showreel of effects. Everything must feel like one serene world.

Highest-leverage future moves:

1. Real cinematic vessel/sea shot or video for CH03/AnchorVoyage reveal.
2. Carefully authored transitions between chapters.
3. More physical surfaces and 3D/media by substitution.
4. Continued restraint: remove anything that looks HUD-like, generic, graph-like, or gimmicky.

---

## 7. Tech Stack

- Next.js 16 App Router
- React
- TypeScript
- GSAP + ScrollTrigger
- Lenis
- Three.js raw WebGL
- Tailwind CSS 4
- `next/font/google` using Josefin Sans and Inter

No new animation libraries.

Key architecture:

- `app/page.tsx`: CH00-CH05 DOM and ScrollTrigger orchestration.
- `components/Stage/Stage.tsx`: main persistent WebGL vessel/route scene.
- `components/experimental/WaterSurface.tsx`: separate water WebGL component.
- `components/site/OceanBackdrop.tsx`: CH00 water/fallback layer.
- `lib/scrollStore.ts`: DOM to WebGL progress singleton.
- `components/providers/LenisProvider.tsx`: smooth scroll.

Three.js note:

- Use `THREE.Timer`, not `THREE.Clock`.

Font/CSS note:

- For Inter, use literal family first:

```css
font-family: "Inter", var(--font-ui), system-ui, sans-serif;
```

Using only `var(--font-ui)` can be dropped by the build pipeline.

---

## 8. Known Pitfalls

### Stale Turbopack CSS

After git checkout/merge while a dev server is running, Turbopack can serve stale CSS. If header/footer/CTA appears as raw unstyled text after a branch switch, do not assume the CSS is broken.

Fix:

```bash
rm -rf .next
npm run dev
```

### Next Font Network Build Failure

`npm run build` can fail transiently while fetching Google font files. If the code did not change fonts and the error is a network/font fetch, retry once. This happened during the rejected CH01 attempt; the retry passed.

### Browser Scroll Verification

Lenis/GSAP scroll can be awkward in automated browser checks. Screenshots at top are reliable. Mid-scroll checks may require real visual review by the user. Use browser DOM/computed checks only as smoke tests; the user judges cinematic motion visually.

### Server State

At handoff time the dev server is stopped. If port `3000` is busy later:

```bash
lsof -tiTCP:3000 -sTCP:LISTEN | xargs -r kill
npm run dev
```

---

## 9. Verification Baseline

Before starting new work, a fresh agent should verify:

```bash
git status --short --branch
npm run build
npm run dev
```

Routes that should exist:

- `/`
- `/about`
- `/anchor-ai`
- `/anchor-voyage`
- `/contact`
- `/water-lab`

Visual baseline:

- CH00 WebGL water loads without old background flash.
- CH00 water is dark and alive at idle.
- Mouse ripple quality is smooth, not pixelated.
- CH00 particles are faint but visible.
- CH01-CH05 still follow the accepted cinematic narrative.
- `/water-lab` still works.

---

## 10. Recommended Next Step

Do nothing until the user gives the next prompt.

If the user returns to the CH00 -> CH01 underwater idea, do not revive the rejected approach. The next attempt needs a different concept, probably more cinematic/media-driven or camera/scene-based, not a DOM fog overlay plus route-current treatment. The user wants an actual premium underwater-world feeling, not obvious graph currents.

If asked to start, create a fresh feature branch from `master`, inspect the current baseline, and plan before coding.
