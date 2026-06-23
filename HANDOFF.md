# Anchor Point — Cross-Device Handoff

> **⚓ LATEST (2026-06-23):** the **CH00 living-ocean backdrop is DONE and MERGED to `master`**
> (HEAD `3519925`). A cursor-wake interaction (Step 1B) was tried and **rejected + removed** — the
> shipped state is the **living-still ocean only**: a dark-ocean still with slow autonomous
> drift/breathe, a deeper edge vignette, a CH00-only fade, and **no mouse/cursor interaction**.
> **No pending review and no open branch work.** Read **`HANDOFF_CH00_OCEAN.md`** for exactly what
> that step covers and the next CH00 options.

> **Purpose of this file:** let a fresh Claude on the home PC continue this project at the same quality. Read it top to bottom before touching anything.
>
> **Written:** 2026-06-22 (laptop session — "site shell" phase complete).
> **Author context:** Claude (Opus 4.8) that built the navigation/CTA/footer shell on top of the now-merged Mont-Fort restraint polish.
> **Supersedes** the previous handoff (which was written when *nothing* was implemented yet). Everything that handoff called "the plan" is now **done and merged to `master`**.

---

## 0. READ-ME-FIRST / current state in one paragraph

Anchor Point is a **finished, committed, fully-merged** product homepage for a maritime-intelligence software company. It has two layers: (1) the **CH00–CH05 cinematic scroll film** (Next.js + raw Three.js/WebGL + GSAP/Lenis) — the hero experience; and (2) a **quiet premium site shell around it** — fixed header/nav, a final "doors open" CTA after CH05, a footer, and three placeholder routes. Most recently, CH00 gained a **living-ocean backdrop** (a dark-ocean still with slow autonomous drift/breathe behind the WebGL canvas, homepage + CH00 only — no mouse interaction). **All of it is on `master`** (`3519925`) and pushed to GitHub. There is **no pending code work** and **nothing waiting to be reviewed**. The last activity was diagnosing a styling scare (the shell briefly rendered as raw unstyled text after a merge) — it turned out to be a **stale Turbopack compilation, not a code bug** (see §7). The natural next step is **Phase 3** (chapter tempo / designed dissolves / texture) — but that is **deferred and not started**; do not begin it without the user.

**Hard rules the user has held throughout (do not violate):**
- Do **not** redesign the cinematic film. Every change is a *removal or a calming*, not a rebuild.
- Do **not** remove or rebuild the WebGL foundation; do **not** touch CH00–CH05 animation/scroll unless explicitly asked.
- Do **not** install new packages — **no** framer-motion, motion, Spline, or any animation library. Stack is fixed: Next.js, React, GSAP/ScrollTrigger, Lenis, Three.js/WebGL.
- Do **not** invent product claims, fake clients, stats, testimonials, dashboards, or media.
- Do **not** commit, merge to `master`, or delete branches without explicit approval. The user reviews **visually** before every commit.

---

## 1. Git state & how to resume

- **Remote:** `https://github.com/Miguelinho25/anchor-point.git` (private).
- **`master` = the live, complete site** at commit **`3519925`**. Pushed. This is what to pull.
- **Branch ladder (all merged into `master`, kept for history — do not delete):**

| Commit | What |
|---|---|
| `3519925` | **Merge CH00 living-ocean backdrop** ← `master` HEAD |
| `ba74eca` | Remove rejected CH00 cursor wake |
| `a000663` | Add CH00 ocean atmosphere backdrop (the approved living-still base) |
| `4811668` | Fix Three.js TypeScript declarations (`next build` typecheck now passes) |
| `dc3f89a` | Build site shell navigation and CTA |
| `37918cf` | Apply Phase 2 Mont-Fort restraint polish |
| `b4752f0` | Apply Phase 1 Mont-Fort restraint polish |
| `ddb61a9` | Bundle `ui-ux-pro-max` skill + dev-stack notes |
| `abea77e` | First cross-device handoff |
| `8da6efa` | CH05 operating-system reveal (original film baseline) |

- **Local/remote branches** (all merged into / behind `master`, kept for history — do not delete): `ch00-ocean-atmosphere-step0` (the CH00 ocean work, now merged), `build-typecheck-fix`, `monfort-restraint-polish-phase-1`, `montfort-restraint-polish-phase-2`, `site-shell-navigation-cta`, `ch05-operating-system-reveal` (historical). Plus **`site-shell-style-hotfix`** — a local diagnostic branch that ended up with **zero commits** (the styling issue needed no code change). It equals `master`; it is **not pushed** and can be ignored or deleted by the user.

**To resume on the home PC:**
```bash
git fetch origin
git checkout master
git pull origin master          # gets this HANDOFF.md + the full shell
npm install                     # if node_modules absent
npm run dev                     # http://localhost:3000
```
**Start any new work on a fresh branch off `master`** (e.g. `git checkout -b phase-3-tempo`). Don't work directly on `master`.

---

## 1.5 Bundled skills & dev tooling

**The `ui-ux-pro-max` design-intelligence skill is bundled in this repo** at `.claude/skills/ui-ux-pro-max/` so it travels with the clone. When this repo is the working directory, Claude Code **auto-discovers it as a project skill** — no install step. Use it for any UI/typography/palette/accessibility decision (it has 96 palettes, 57 font pairings, 99 UX guidelines, a Next.js/React/Tailwind stack profile). The `scripts/*.py` searchers need **Python 3**; if absent, the `SKILL.md` + `data/*.csv` are still readable directly.

**Not bundled:** plugin/environment skills (`docx`, `pdf`, `code-review`, `verify`, `security-review`, etc.) are not project files — install via your normal plugin setup on the PC if wanted.

---

## 2. What the site is now

**Anchor Point** = the parent operating system for maritime intelligence. Two sub-products: **AnchorVoyage** (operational layer) and **Anchor AI** (intelligence layer).

**Layer 1 — the cinematic film (unchanged hero):**

| Chapter | Beat |
|---|---|
| CH00 | "42,000 vessels are moving right now… almost none can see each other." Ocean-flow chaos. |
| CH01 | Vessels snap to real shipping lanes. Positioning statement *"The intelligence layer for global shipping."* writes in (Phase 2 made this the hero, **not** the brand wordmark — see §5). |
| CH02 | 8 incompatible data systems converge on a hero vessel. "The answers already exist…" |
| CH03 | 4 modules radiate out; **AnchorVoyage** wordmark resolves. |
| CH04 | **Anchor AI** live intelligence layer: scan/sonar/route recalculation. |
| CH05 | AnchorVoyage + Anchor AI unify into **Anchor Point**; boundary seals; held final frame. The only large brand reveal. |

**Layer 2 — the site shell (NEW this phase):**
- **Fixed header / nav** — wordmark left; `AnchorVoyage · Anchor AI · Vision` + a framed `Request Access` right. Transparent at the very top (clean over CH00); slides away on scroll-down, returns with a faint scrim on scroll-up.
- **Final CTA** — a "doors open" section in normal flow **directly after CH05's film**: eyebrow "Enter the system" → framed `Request Access` → `Explore AnchorVoyage · Explore Anchor AI · Contact`.
- **Footer** — brand + existing tagline, product/contact links, `© 2026 Anchor Point · Legal` base.
- **Placeholder routes** — `/anchor-voyage`, `/anchor-ai`, `/contact`. Minimal, brand-consistent, each with an honest "In development" status. They exist to make nav functional and prepare the architecture — **not** full product pages.

---

## 3. Tech stack & architecture

- **Next.js 16.2.9** App Router, **TypeScript**, **Tailwind CSS 4**, **Turbopack**, port **3000**.
  - ⚠️ Newer than training data — see `anchor-point/AGENTS.md`; check `node_modules/next/dist/docs/` before using unfamiliar Next APIs. (Routing/`next/link`/`app/<route>/page.tsx` are standard App Router and confirmed.)
- **Three.js v0.184.0**, raw (no R3F). Use `THREE.Timer`, **not** `THREE.Clock` (deprecated r184+).
- **GSAP + ScrollTrigger** — one master `onUpdate` per chapter, `scrub: 2.5`, smootherstep easing.
- **Lenis v1.3.23** — `duration: 1.6`, expo easing, driven by `gsap.ticker`.
- **Fonts (two faces, set in `app/layout.tsx` via `next/font/google`):**
  - `Josefin_Sans` → `--font-display` — applied to `<html>`; all hero wordmarks, statements, brand marks.
  - `Inter` → `--font-ui` — **added in Phase 2** for small labels / data / interface text only.
  - ⚠️ **Turbopack/Lightning-CSS gotcha:** `font-family: var(--font-ui)` is silently dropped from compiled CSS. **Always write the literal first:** `font-family: "Inter", var(--font-ui), system-ui, sans-serif;` (the grouped label rules in `globals.css` already do this).

### Key files
| File | Role |
|---|---|
| `app/page.tsx` | All chapter JSX + refs + GSAP ScrollTrigger logic in one `useEffect`. Renders `<FinalCTA/>` after CH05's film. |
| `app/layout.tsx` | Fonts + LenisProvider + `<Stage/>` (fixed canvas z0) + `<Header/>` + content wrapper (z1) containing `{children}` + `<Footer/>`. |
| `app/globals.css` | All styling. `:root` tokens (§4). Per-chapter rulesets + the **SITE SHELL** block at the bottom (header/CTA/footer/placeholder). |
| `components/Stage/Stage.tsx` | The WebGL engine (shaders, vessel field, route lines + CH01 settle + CH04 recalculation, hero core, rings, sonar, scan arc, CH05 system seal, camera dolly). |
| `components/site/Header.tsx` | Client component. Fixed nav; scroll-direction hide/show via a passive `window.scrollY` listener (no library). |
| `components/site/Footer.tsx` | Server component. Restrained footer. |
| `components/site/FinalCTA.tsx` | The post-CH05 CTA section. |
| `components/site/PlaceholderPage.tsx` | Shared minimal page (eyebrow/title/sub/status/optional CTA). |
| `app/anchor-voyage/`, `app/anchor-ai/`, `app/contact/` | `page.tsx` placeholder routes using `PlaceholderPage`. |
| `lib/scrollStore.ts` | Module singleton bridging DOM↔WebGL: `progress, ch02–ch05Progress`. GSAP writes, Three.js reads, every frame. |
| `components/providers/LenisProvider.tsx` | Lenis setup. |
| `.claude/launch.json` | Preview server config — name **`anchor-point-dev`**, port 3000 (runs `sh -c "cd 'anchor-point' && npm run dev"`; lives in the *parent* `Claude Code/.claude/`, not in the repo). |

### Scroll math (now includes the shell)
- 5 film sections × **300vh** = **1500vh** (= **15 viewport-heights**). Each: outer `height:300vh;position:relative`; inner stage `position:sticky;top:0;height:100vh`.
- **The CTA + footer add height in normal flow *after* CH05.** Total document ≈ **16.1 viewport-heights** (15 film + ~0.8 CTA `min-height:80vh` + ~0.3 footer).
- **Crucial:** each chapter's ScrollTrigger is self-contained (`start: top top → end: bottom bottom`), so the film's timing is **independent of what comes after**. The CTA begins at **exactly 15vh**, i.e. the instant CH05's held final frame ends — "doors open." **No scroll-architecture change was needed** to add the shell.
- At **1440×900**: film = 13500px; CTA starts at 13500px. CH05 reveal lands by ~progress 0.84 (verified: wordmark opacity 0.96, eyebrow 0.55, tagline 0.62).

---

## 4. Design tokens (`globals.css :root`)

```
--abyss  #04121A   canvas bg            --haze  #5A86A6   labels (UI face)
--deep   #0A2A3A   panels/depth         --ice   #BFD6E6   data / dim text
--steel  #2D628C   structure/hairlines  --white #F3F8FB   headlines
--signal #18E0FF   THE accent — "one use: live intelligence" (radar cyan)
```
**The colour rule the whole design now follows (Phase 1 enforced it):** cyan = live/active only (WebGL hero core/scan + the single status dot per scene). Everything else → `--white` headlines, `--ice` data, `--haze` labels. The shell honours this — its one cyan touch is a soft glow on the CTA `Request Access` hover, nothing more.

---

## 5. What's been completed (so you don't redo it)

**Phase 1 — restraint polish (`b4752f0`):** demoted ~14 cyan-as-text selectors to haze/ice; removed 4 infinite `@keyframes` and the dashboard bars (`.frag-bar`, `.mod-bars`, `.ai-sig-bar`); standardised micro-labels to 10px/400/0.18em/haze. Result: ≤1 ambient motion per chapter, zero animated bars.

**Phase 2 — restraint polish (`37918cf`):**
- **CH01↔CH05 name collision resolved (Option A):** CH01's hero is now the *positioning statement* "The intelligence layer for global shipping." (with a scroll-synced char reveal + a WebGL route-settle in `Stage.tsx`). The big "Anchor Point" wordmark is now spent **only** in CH05.
- **Wordmark hierarchy unified:** children (AnchorVoyage, Anchor AI) share one tier — 64px/200/0.28em/ice/no-glow; parent (Anchor Point) is dominant — 80px/200/0.20em/white/the only glow.
- **Inter** added as the secondary UI face for labels/data.
- **CH04 decrowded** (4 signals kept but quiet/dim).

**Site shell (`dc3f89a`):** Header, FinalCTA, Footer, PlaceholderPage components; `/anchor-voyage`, `/anchor-ai`, `/contact` routes; wired into `layout.tsx`/`page.tsx`; ~360 lines of shell CSS appended to `globals.css`. Verified at 1440×900 and 1366×768 — no overflow, no console errors, CH00–CH05 untouched. (One **open decision** the user is aware of: **"Vision" in the nav currently routes to `/`** — the cinematic homepage *is* the manifesto/vision. If they later want a dedicated `/vision` page, that's a future item.)

---

## 6. The site shell — how it behaves (reference)

- **Header** (`components/site/Header.tsx`): `position:fixed; z-index:50`. A passive scroll listener compares `window.scrollY` to the last value: `< 64px` → visible + transparent (CH00 stays clean); scrolling down → `translateY(-118%)` hidden; scrolling up → visible with a faint top scrim (`is-scrolled`). Pure CSS transition, no animation library. Nav links keep brand casing (AnchorVoyage / Anchor AI); `Request Access` is a hairline-framed link, never a bright button.
- **FinalCTA** (`components/site/FinalCTA.tsx`): plain section in `page.tsx` after the CH05 film. Background `transparent → abyss` lets the last WebGL frame bleed in then seals to solid — the "doors open" read. Primary action is display-face but capped ~2.4rem (well below CH05's ~5rem) so CH05 stays the climax.
- **Footer / placeholder pages**: server components; abyss background with a strong scrim over the live sea on sub-pages. All small labels use the literal-`"Inter"` font rule.

---

## 7. ⚠️ THE STALE-CSS INCIDENT — read this before "fixing" any unstyled-shell scare

**What happened:** right after merging the shell into `master`, the header/CTA/footer briefly rendered as **raw unstyled text** (run-together nav, stacked footer). It looked like the shell CSS had broken.

**Root cause — it was NOT a code bug.** It was a **stale Turbopack dev compilation**:
1. During the merge, `git checkout master` reverted `globals.css` to its pre-shell (819-line) version → Turbopack compiled *that* (no shell styles).
2. The fast-forward `git merge` restored the 1178-line version **with** the shell, but the running dev server's file-watcher **missed the swap**, so it kept serving the stale, pre-shell CSS.

**Proof it was staleness:** the *source* had all 45 shell selectors and a clean boundary; **no** CSS error in the build logs; the *compiled* stylesheet contained old `.ch05-wordmark` but none of `.site-header/.final-cta/.site-footer`. Forcing a recompile flipped the header from `static`→`fixed` and a **clean production build** (`rm -rf .next && next build`) emitted **all** shell CSS (`site-header`×4, `site-footer`×15, `final-cta`×11). `git status` was clean throughout — the committed source was always correct.

**THE RULE (save yourself an hour):** if the shell (or any CSS) ever renders unstyled **after a git checkout/merge/branch-switch under a running dev server**, it is almost certainly stale Turbopack output. **Do not hunt for a CSS bug.** Fix it with a clean rebuild:
```bash
# stop the dev server, then:
rm -rf .next
npm run dev          # fresh compile
```
A fresh `npm run dev` after pulling is always correct — this only bites a server that was *running through* the file-swap.

---

## 8. Known pitfalls

- **Stale Turbopack CSS after git ops** — see §7. The #1 gotcha now.
- **Lenis stale scroll cap** — after anything that changes total scroll height over HMR, Lenis can cap scroll at the old height (new content unreachable). Hardened with deferred `ScrollTrigger.refresh()` (rAF + 600ms) in `page.tsx`. Adding the CTA/footer did **not** trip it (verified: deep CH05 reachable, reveal lands). Any future height change: full restart + hard reload to verify.
- **Preview tool can't drive the film scroll on demand** — the headless preview throttles `requestAnimationFrame`, so the `gsap.ticker → Lenis → ScrollTrigger` scrub chain doesn't advance reliably from a programmatic `window.scrollTo` (position moves, scrub doesn't follow; synthetic wheel events don't register; the real Lenis instance isn't exposed). Computed-style checks are reliable at any position; the **actual scroll-through animation is best judged by the user's eyes**. (It worked opportunistically a few times earlier when the page was "warm" — don't rely on it.)
- **Preview screenshots:** reliable at the very top (Y=0); often blank/partial mid-page (Lenis intercept). Use `preview_eval` computed styles for mid-page verification.
- **No `@types/three`** (intentional — no packages). `next build` therefore **fails its TypeScript step** on `Stage.tsx` ("Could not find a declaration file for module 'three'"). This is **pre-existing and unrelated to the shell**; the *compile* succeeds (`✓ Compiled successfully`) — only the type-check gate fails. Don't "fix" by adding a package or churning the WebGL unless the user asks. (If they want production builds to pass, the clean fix is a one-line `declare module 'three'` ambient `.d.ts`, or `@types/three` — but that's a package and currently off-limits.)
- **Two dev servers / `.next` lock:** Next refuses a second dev server against the same `.next`. Kill the stray Node PID (`lsof -ti:3000 | xargs kill -9`) before `npm run dev`, or use the preview tool's `preview_start` which reuses a running one.

---

## 9. How to verify your work (preview MCP)

1. `preview_start` name **`anchor-point-dev`** (or it may already be running — it reuses). URL `http://localhost:3000`.
2. `preview_resize` to **1440×900**, then repeat at **1366×768**.
3. **Shell checks** (reliable): `preview_eval` computed styles — e.g. `.site-header` → `position:fixed, zIndex:50`; `.final-cta` → `display:flex`, gradient bg, `minHeight:720px` at 900h; `.site-footer` → abyss bg + hairline border; label classes → `fontFamily` starts `"Inter"`. Screenshot the top for the header.
4. **Film checks:** structure via `preview_eval` (5 `scroll-film*`, doc ≈16.1vh, `canvas` present, `html.lenis`, zero console errors). For the *animation*, rely on the user's visual scroll-through (see §8). If a warm-page read happens to work, deep CH05 is at `Y≈13.6×innerHeight`; wait ~3.4s for `scrub:2.5` to settle before reading opacity.
5. **Routes:** `fetch('/anchor-voyage')` etc. should be 200; `PlaceholderPage` classes styled.
6. `preview_stop` when done.

---

## 10. Working style the user expects

- Honest, critical, evidence-based — **never invent**; separate "verified live" from "structural inference" from "judgement." (The §7 diagnosis is a model: prove the root cause, don't guess.)
- High-effort, restrained, luxury-cinematic taste. Match that bar.
- **Workflow discipline:** new work on a fresh branch off `master`; **show the user a visual result and get approval before every commit**; commit per logical unit with the repo's `Co-Authored-By` trailer; push the branch; merge to `master` **only** when the user says so; never delete branches without asking.
- Persistent memory exists at `~/.claude/.../memory/` on each machine separately — **this HANDOFF.md is the cross-device source of truth.**

---

## 11. Immediate next action for the home-PC Claude

1. `git checkout master && git pull`, `npm install`, `npm run dev`. Confirm the `ui-ux-pro-max` skill is available (working *inside* this repo).
2. **Sanity-check the live state** (don't assume): header styled and fixed at top; scroll down → CH00–CH05 film plays; past CH05 → the CTA "doors open"; footer below; `/anchor-voyage`, `/anchor-ai`, `/contact` load styled. If the shell looks unstyled, it's §7 — `rm -rf .next && npm run dev`, **not** a code hunt.
3. There is **no pending code work** and nothing awaiting review. Wait for the user's direction. The likely next topic is **Phase 3** (deferred): **3A** chapter tempo variation, **3B** designed inter-chapter dissolves ("dissolve, don't cut"), **3C** restrained atmospheric texture — all higher-risk, **do not start without the user**.
4. Smaller open threads to raise if relevant: the **"Vision" nav target** (currently `/`); whether to make `next build` pass type-check (the `three` types item, §8).

Good luck. Keep it restrained.
