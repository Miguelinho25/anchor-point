# Anchor Point - Cross-Device Handoff

> Latest status: 2026-06-24, end of laptop/Codex session.
> Current accepted baseline: `master` at `3ad4e8747aafe5b53ea196ea75752e8b304463c9`
> Commit: `Add WebGL water backdrop to static pages`
> Remote: `origin/master` is synced to this commit.

This file is the first thing a fresh Claude/Codex should read before touching the project.

---

## 0. Current State In One Paragraph

Anchor Point is now a premium dark maritime-intelligence website with a cinematic CH00-CH05 homepage, a restrained site shell, functional product/contact/about routes, founder portraits on About, the approved CH00 WebGL water foundation, the isolated `/water-lab` experiment, and the same full-strength CH00-style WebGL water backdrop applied to static pages. The current master baseline is stable, built successfully, pushed to GitHub, and visually approved through the static-page water backdrop milestone.

---

## 1. Absolute Rules

- Do not work directly on `master` unless the user explicitly asks for a merge or a tiny approved hotfix.
- Start new work from latest `master` on a feature branch.
- Do not commit, push, or merge until the user visually approves, unless the user explicitly asks for a checkpoint.
- Do not delete feature branches unless the user explicitly asks.
- Do not install packages unless the user explicitly approves.
- Do not add Framer Motion, Motion, Spline, or new animation libraries.
- Do not copy Evan Wallace WebGL Water source code. The current water implementation is original and only conceptually inspired by heightfield water ideas.
- Do not invent fake clients, metrics, testimonials, dashboards, product claims, or media.
- Do not redesign CH00-CH05 casually. The film is the hero experience.
- Keep `/water-lab` available as an isolated internal experiment. Do not add it to nav.
- Keep the approved CH00 WebGL water and static-page water backdrop intact unless the user gives a specific prompt.

---

## 2. Git State

Remote:

```bash
https://github.com/Miguelinho25/anchor-point.git
```

Current accepted master:

```text
branch: master
HEAD: 3ad4e8747aafe5b53ea196ea75752e8b304463c9
short: 3ad4e87 Add WebGL water backdrop to static pages
status: pushed to origin/master
```

Important commits:

| Commit | Status | Meaning |
|---|---|---|
| `3ad4e87` | `master`, pushed | Add WebGL water backdrop to static pages |
| `6f6adcc` | merged | Add founder portraits to About page |
| `3c291b4` | merged | Improve WebGL water ripple quality |
| `13f8168` | merged | Test WebGL water integration in CH00 |
| `81408a1` | merged | Add isolated water-lab WebGL water experiment |
| `f030a25` | merged | Add About page and founder section |
| `dc3f89a` | merged | Build site shell navigation and CTA |
| `37918cf` | merged | Apply Phase 2 Mont-Fort restraint polish |
| `b4752f0` | merged | Apply Phase 1 Mont-Fort restraint polish |

Branches to know:

| Branch | Meaning |
|---|---|
| `static-pages-water-backdrop` | Approved and merged into `master`; keep branch unless user asks to delete |
| `water-project-CODEX` | Earlier CH00 water integration branch; merged through water commits |
| `ch01-underwater-transition` | Rejected attempt branch; reverted clean, do not continue without new prompt |
| `water-ripple-quality-hotfix` | Ripple-quality hotfix branch; merged |

To resume safely:

```bash
git fetch origin
git checkout master
git pull origin master
npm install
npm run dev
```

For new work:

```bash
git checkout master
git pull origin master
git checkout -b <new-feature-branch>
```

---

## 3. What Is Shipped

### Cinematic Homepage

The homepage remains the core product experience:

| Chapter | Current role |
|---|---|
| CH00 | Dark physical WebGL ocean surface + faint vessel/data particles + opening copy |
| CH01 | World begins organizing into maritime intelligence; statement: "The intelligence layer for global shipping." |
| CH02 | Fragmented maritime data converges around one vessel |
| CH03 | AnchorVoyage module reveal |
| CH04 | Anchor AI live intelligence layer |
| CH05 | Anchor Point parent operating-system reveal |

Do not weaken CH05. It remains the first dominant "ANCHOR POINT" climax.

### Site Shell

Merged and working:

- Fixed premium header/nav
- Final CTA after CH05
- Footer
- `/anchor-voyage`
- `/anchor-ai`
- `/contact`
- `/about`

### About Page

Approved base:

- Premium dark About page
- Founder section
- Founder portraits approved and merged
- Co-founders:
  - Miguel Morett
  - Argenis Omana
  - Ansh Sahadew

Do not replace portraits, rewrite bios, or invent job titles unless asked.

### Static Pages With Water Backdrop

Approved and merged in `3ad4e87`:

- `/anchor-voyage`
- `/anchor-ai`
- `/about`
- `/contact`

These pages now use the same CH00-style WebGL water background behavior:

- full-strength dark WebGL water presence
- idle movement visible
- mouse ripple interaction visible
- dark ocean tone
- content remains readable
- About portraits remain clean/readable

Implementation summary:

- `components/site/StaticWaterBackdrop.tsx` mounts the static-page water only on static routes.
- `app/layout.tsx` renders the static water backdrop globally but route-gates it internally.
- `app/globals.css` contains the shared shell/static backdrop styling and static-page background adjustments.
- Homepage CH00 remains handled by `components/site/OceanBackdrop.tsx`.
- `/water-lab` remains isolated.

---

## 4. Water System Notes

Key files:

| File | Role |
|---|---|
| `components/experimental/WaterSurface.tsx` | Original reusable WebGL water component |
| `app/water-lab/page.tsx` | Hidden isolated water experiment route |
| `components/site/OceanBackdrop.tsx` | Homepage CH00 water/backdrop layering and fallback |
| `components/site/StaticWaterBackdrop.tsx` | Static-page water backdrop wrapper |
| `components/Stage/Stage.tsx` | Existing cinematic vessel/route WebGL stage |

Accepted behavior:

- CH00 water is dark, physical, premium, and restrained.
- Mouse interaction feels like local disturbance on a physical surface.
- Idle water is alive without becoming bright.
- No pool-demo look.
- No toy ripple look.
- No global cursor parallax/wake.
- CH00 particles remain faint but visible.
- Opening text remains dominant and readable.
- Static pages use the same approved water feel, not a faint decorative variant.
- `/water-lab` stays visually separate and internal.

Fallback principles:

- If WebGL/reduced-motion/unsupported device is an issue, fall back to a dark ocean/base layer.
- Avoid blank CH00 or blank static pages.
- Avoid multiple unnecessary active canvases on one page.

---

## 5. Rejected Work

### Rejected: Old CH00 Cursor Wake

An earlier cursor/wake experiment before the WebGL water was rejected because it felt cheap, like moving a poster/background rather than disturbing a physical surface. Do not reintroduce it.

### Rejected: Final Shader Unification Tweak

A shader tweak intended to unify ambient lighting and ripple normals made the water worse and pixelated. It was reverted. The accepted water path is the CH00 integration plus the later ripple-quality hotfix.

### Rejected: CH00 -> CH01 Underwater Transition Attempt

Branch used:

```text
ch01-underwater-transition
```

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

Do not make a new CH01 underwater attempt until the user gives a new prompt and a new direction.

---

## 6. Mont-Fort Standard And Creative North Star

Mont-Fort is the quality standard for restraint, production value, cinematic craft, and polish.

Critical distinction:

- Mont-Fort is not the visual template.
- Anchor Point must keep its own identity: dark abyss/navy palette, restrained instrument-blue accents, premium maritime intelligence mood, and current cinematic typography direction.
- The goal is to reach Mont-Fort's level of craft while staying inside Anchor Point's world.

User direction:

- The current Anchor Point vibe, colors, and dark identity are correct.
- Future upgrades should use real media, 3D objects, and physical interactive surfaces to raise production value.
- The CH00 water project is step one toward making the site feel more real and physical.
- Add by substitution: each new real/premium element should replace a weaker abstract element, not pile on top.
- Avoid a showreel of effects. Everything must feel like one serene world.

Likely future high-leverage moves:

1. Real cinematic vessel/sea shot or video for CH03/AnchorVoyage reveal.
2. A better-planned CH00 -> CH01 underwater transition, but only after a fresh plan.
3. More authored inter-chapter transitions.
4. Selective 3D/physical assets where they deepen the maritime world.

---

## 7. Verification Checklist For Fresh Agent

Run:

```bash
npm run build
npm run dev
```

Check:

- `/`
  - CH00 WebGL water loads cleanly.
  - CH00 text is readable.
  - CH00 particles are faint but visible.
  - CH01-CH05 scroll correctly.
- `/water-lab`
  - Isolated water experiment still works.
  - Mouse ripples remain smooth.
- `/anchor-voyage`
  - Full-strength CH00-style water backdrop visible.
  - Mouse ripple visible.
  - Text readable.
- `/anchor-ai`
  - Same as AnchorVoyage.
- `/about`
  - Full-strength water backdrop visible.
  - Founder portraits visible/readable.
  - Cards/content remain clear.
- `/contact`
  - Full-strength water backdrop visible.
  - Contact content readable.

Expected build:

- Next.js build passes.
- TypeScript passes.
- Routes generated:
  - `/`
  - `/about`
  - `/anchor-ai`
  - `/anchor-voyage`
  - `/contact`
  - `/water-lab`

---

## 8. Next-Agent Advice

Before changing code:

1. Read this file.
2. Run `git status`.
3. Confirm current branch.
4. Pull latest `master`.
5. Create a new feature branch.
6. Keep visual changes isolated and reversible.
7. Do not touch the water system, Stage, or scroll architecture unless the user prompt specifically asks.

If the user asks for the next cinematic agenda item, plan first. The project is now strong enough that careless effects will make it worse, not better.
