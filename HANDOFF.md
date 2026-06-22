# Anchor Point — Cross-Device Handoff

> **Purpose of this file:** let a fresh Claude on another machine continue this project at the same quality. Read this top to bottom before doing anything. Nothing in the plan below has been implemented yet — this branch is clean.
>
> **Written:** 2026-06-22 (session on the primary laptop).
> **Author context:** previous Claude (Opus 4.8) that ran the Mont-Fort benchmark and wrote the accepted polish plan.

---

## 0. READ-ME-FIRST / current state in one paragraph

Anchor Point is a finished, committed **CH00–CH05 cinematic homepage** (Next.js + raw Three.js + GSAP/Lenis scroll film) for a maritime-intelligence software company. The build works and is backed up on GitHub. We ran a rigorous **live benchmark against mont-fort.com** and concluded the foundation is strong but the *surface* reads too much like a **sci-fi SaaS / HUD** (too much cyan, too much constant motion, too much dashboard chrome). The user **accepted a 3-phase, no-redesign "Mont-Fort restraint polish" plan** (in §6 below). We created branch **`monfort-restraint-polish-phase-1`** to do the work and **stopped before implementing**. The next action is **Phase 1**, but **three decisions are still pending from the user** (§7). Do not start coding until those are answered.

**Hard rules the user set (do not violate):**
- Do **not** redesign the site. Every change is a *removal or a calming*, not a rebuild.
- Do **not** remove or rebuild the WebGL foundation.
- Do **not** touch CH05's structure except colour/typography restraint.
- Do **not** add navigation, CTA, logo, product pages, or media yet.
- Do **not** invent new product claims (copy changes may only reuse existing copy).
- Do **not** commit or implement until the user approves the specific phase.

---

## 1. Git state & how to resume

- **Remote:** `https://github.com/Miguelinho25/anchor-point.git` (private).
- **Branches:**
  - `master` — known-good CH00–CH05 (commit `8da6efa`). **Protected. Do not work here.**
  - `ch05-operating-system-reveal` — at `8da6efa` (historical).
  - `monfort-restraint-polish-phase-1` — **the working branch. Start here.** Created from `master`, currently clean (this HANDOFF.md is its first change).
- **Commit history:** `8da6efa` (CH05) → `2f2e192` (CH00–CH04 checkpoint) → `eea9dbd` (init).

**To resume on the other laptop:**
```bash
git fetch origin
git checkout monfort-restraint-polish-phase-1
git pull origin monfort-restraint-polish-phase-1   # gets this HANDOFF.md
npm install                                         # if node_modules absent
npm run dev                                          # http://localhost:3000
```
If `npm run dev` complains another dev server holds the `.next` cache, kill the stray Node process first (see §8 pitfalls).

**Commit/push etiquette:** the user wants explicit approval before commits. When approved, commit per phase with a clear message and push the branch so it syncs across laptops. End commit messages with the Co-Authored-By trailer used in this repo.

---

## 1.5 Bundled skills & dev tooling (set this up first)

**The `ui-ux-pro-max` design-intelligence skill is bundled in this repo** at `.claude/skills/ui-ux-pro-max/`. It was copied in **specifically for cross-device parity** — on the primary laptop it lives outside the repo (`Claude Code/.claude/skills/`), so it would NOT have travelled with the clone. Because it now sits in the project's `.claude/skills/`, **Claude Code auto-discovers it as a project skill** when this repo is the working directory — no manual install step. Invoke it via the Skill tool whenever you plan/build/review UI, pick palettes or typography, or check accessibility.

- **Contents:** `SKILL.md` (the guide) + `data/*.csv` (67 styles, 96 palettes, 57 font pairings, 99 UX guidelines, 25 charts, 13 stacks incl. Next.js/React/Tailwind/shadcn) + `scripts/*.py` (search/query helpers: `search.py`, `design_system.py`, `core.py`).
- **Requires Python 3** to run the `scripts/*.py` searchers. If Python isn't installed, the `SKILL.md` + CSVs are still fully readable directly — the skill degrades gracefully. `__pycache__`/`*.pyc` are gitignored so bytecode never gets committed.
- **Why it matters here:** use it directly for the polish work — typography pairing + discipline (plan items 1D/2B) and colour-palette/contrast restraint (1A). It has data made for exactly these decisions.

**Verify it loaded:** on the other laptop, confirm `ui-ux-pro-max` appears among available skills when Claude is working *inside this repo*. If it doesn't, you opened Claude Code with the wrong working directory — project skills load only from `<repo>/.claude/skills/`.

**Other skills (NOT bundled):** the primary environment also had Anthropic plugin skills (`docx`, `pdf`, `pptx`, `xlsx`, `code-review`, `verify`, `security-review`, etc.). Those are plugin/environment-level, not project files, so they can't be shipped via this repo — install them through your normal Claude Code plugin/marketplace setup on the other laptop if you want them. Only `ui-ux-pro-max` is bundled because it's the one directly relevant to this project.

---

## 2. What the site is (product & narrative)

**Anchor Point** = the parent operating system for maritime intelligence. Two sub-products live under it: **AnchorVoyage** (operational layer) and **Anchor AI** (intelligence layer). The homepage is a 6-chapter scroll film:

| Chapter | Name | Beat |
|---|---|---|
| CH00 | Maritime chaos | "42,000 vessels are moving right now… almost none of them can see each other." Vessel field drifts in ocean-flow chaos. |
| CH01 | Order / routes | Vessels snap to real shipping lanes; routes resolve. Title "Anchor Point" + positioning line. |
| CH02 | Fragmented data | 8 incompatible data systems converge toward a glowing hero vessel. "The answers already exist…" |
| CH03 | AnchorVoyage reveal | 4 intelligence modules radiate out; AnchorVoyage wordmark resolves. |
| CH04 | Anchor AI activation | Live intelligence layer: scan waves, sonar, route recalculation, peak activation. |
| CH05 | Anchor Point (OS reveal) | AnchorVoyage + Anchor AI unify into Anchor Point; system boundary seals; held final frame. |

Emotional target of CH05: *"Oh… this is the platform."*

---

## 3. Tech stack & architecture

- **Next.js 16.2.9** App Router, **TypeScript**, **Tailwind CSS 4**, **Turbopack**, port **3000**.
  - ⚠️ This is a newer Next.js than training data — see `anchor-point/AGENTS.md`. Check `node_modules/next/dist/docs/` before using unfamiliar Next APIs.
- **Three.js v0.184.0**, raw (no React-Three-Fiber). Use `THREE.Timer`, **not** `THREE.Clock` (deprecated r184+).
- **GSAP + ScrollTrigger** — single master `onUpdate` per chapter, `scrub: 2.5`, smootherstep easing.
- **Lenis v1.3.23** — `duration: 1.6`, expo easing, driven by `gsap.ticker`.
- **Font:** `Josefin_Sans` via `next/font/google` in `app/layout.tsx` (weights 100,200,300,400,600), exposed as `--font-display`, applied to `<html>` — so **every element inherits the display face, including 8px labels** (this is a typography problem; see plan).

### Exact dependencies (`package.json`) — install with `npm install`
```
dependencies:
  next 16.2.9 · react 19.2.4 · react-dom 19.2.4
  three ^0.184.0 · gsap ^3.15.0 · lenis ^1.3.23
  @tailwindcss/vite ^4.3.1
devDependencies:
  typescript ^5 · tailwindcss ^4.3.1 · @tailwindcss/postcss ^4
  eslint ^9 · eslint-config-next 16.2.9
  @types/node ^20 · @types/react ^19 · @types/react-dom ^19
```
Scripts: `npm run dev` (Turbopack dev, port 3000) · `npm run build` · `npm run start` · `npm run lint`.
Note: **`@types/three` is intentionally NOT installed** — see §8 (the `any` errors in `Stage.tsx` are expected and harmless).

### Key files
| File | Role |
|---|---|
| `app/page.tsx` | All chapter JSX + refs (`filmRef`…`film05Ref`) + all GSAP ScrollTrigger logic in a `useEffect`. |
| `app/globals.css` | All styling. Design tokens in `:root` (see §4). Per-chapter rulesets (`.ch00-*`, `.ch01-*`, `.frag-*`, `.mod-*`, `.ai-*`, `.ch05-*`). All `@keyframes`. |
| `components/Stage/Stage.tsx` | The WebGL engine: vertex/fragment shaders, vessel field, route lines + live recalculation, hero core, rings, sonar, scan arc, CH05 system rings, camera dolly. |
| `lib/scrollStore.ts` | Module-level singleton bridging DOM↔WebGL: `progress, ch02Progress, ch03Progress, ch04Progress, ch05Progress`. GSAP writes it every frame; Three.js reads it every frame. |
| `components/providers/LenisProvider.tsx` | Lenis setup. |
| `app/layout.tsx` | Font config + LenisProvider + `<Stage/>` (fixed canvas, z0) + content wrapper (z1). |
| `.claude/launch.json` | Preview server config (name `"dev"`, port 3000). |

### Scroll math (critical for verification)
- 5 sections × **300vh** = **1500vh** total. Each section: outer container `height:300vh; position:relative`; inner stage `position:sticky; top:0; height:100vh`.
- At **1440×900**: body scrollHeight = **13500px**. Section *i* (0-indexed) is active over scroll range **[i×2700, i×2700+1800]** (a 300vh=2700px element scrolls top-top→bottom-bottom over 2700−900=1800px).
- The shared **fixed WebGL canvas** is the only cross-chapter continuity. `uCh04Progress` stays ≈1 past CH04 so the scan field persists into CH05.

---

## 4. Design tokens (exact, from `globals.css :root`)

```
--abyss:  #04121A   near-black teal, canvas bg
--deep:   #0A2A3A   panels/depth
--steel:  #2D628C   primary structure
--haze:   #5A86A6   mid atmosphere, LABELS  ← demote-cyan target colour
--ice:    #BFD6E6   dim text, DATA          ← demote-cyan target colour
--white:  #F3F8FB   headlines
--signal: #18E0FF   THE accent (radar cyan). Token comment literally says "One use: live intelligence"
```
Type scale: `--text-xs .625rem` → `--text-sm .75` → `--text-base 1` → `--text-md 1.25` → `--text-lg 1.5` → `--text-xl 2` → `--text-2xl 3` → `--text-3xl 4.5` → `--text-hero 6rem`.
Space scale: `--space-1 .5rem` … `--space-16 8rem`.

**The colour rule the whole polish follows:** cyan = live/active only (WebGL hero core/scan field + ONE status dot per scene). Everything else → `--white` (headlines), `--ice` (data), `--haze` (labels). The token comment already says this; the build currently violates it.

---

## 5. The benchmark (what we found — live evidence)

We benchmarked against **mont-fort.com** using the user's supplied "Mont-Fort deconstruction source pack." Core principle: **luxury through subtraction** — restraint, stillness, rare accent colour, bespoke/disciplined typography, atmosphere before information, minimal UI vocabulary, designed transitions ("dissolve, don't cut"), clear focal hierarchy per frame, "confident enough to say less."

⚠️ **Evidence honesty:** we could **not** load Mont-Fort live (no Chrome extension connected; browsers are read-only under computer-use). The Mont-Fort *target* is principle-based (from the pack), **not** freshly observed pixels. **Anchor Point findings ARE live** (screenshots + computed styles + animation census via the preview tools). If the other laptop has the Claude-in-Chrome extension connected, **do the real side-by-side** — `list_connected_browsers` first; if non-empty, navigate to mont-fort.com at 1440×900 and 1366×768 and capture multiple scroll positions.

### Scores (1=generic, 10=Mont-Fort level)
| Dimension | Score | Why |
|---|---|---|
| Cinematic pacing | 6 | Good 300vh breathing, but identical rhythm every chapter; no designed transitions; no stillness. |
| Visual hierarchy | 6.5 | Strong at CH00/01/05; diluted in CH02/03/04. |
| Typography | 5.5 | Real font (Josefin Sans, **not** default — earlier claim of "system font" was WRONG), but one display face at all sizes incl. 8px; weight-100 everywhere; 3 inconsistent wordmarks. |
| Colour discipline | 4 | ~half of all text is cyan. Biggest gap. |
| Motion restraint | 4.5 | 35 elements / 8 infinite loops at once; CH04 ≈18. Nothing rests. |
| Atmosphere | 7 | Strongest alignment; undercut by HUD chrome layered on top. |
| Narrative clarity | 7.5 | Legible arc; CH01/CH05 name collision; parent reads weaker than children. |
| Premium feel | 5.5 | Premium-HUD, not luxury-editorial. |
| Mont-Fort closeness | 5 | Close on atmosphere/tech foundation; far on restraint/colour/motion/type discipline. |

### Hard live measurements (baseline — re-measure to prove improvement)

**Typography (computed at 1440×900):**
- `.ch01-title` (CH01 "Anchor Point"): weight **100**, 86px, tracking −0.02em, **white**.
- `.wordmark-name` (AnchorVoyage): **100**, 77px, **0.32em**, **cyan .86**.
- `.ai-wordmark` (Anchor AI): **100**, 74px, **0.34em**, **cyan .92**.
- `.ch05-wordmark` (Anchor Point): **100**, 80px, **0.18em**, **white**.  ← parent tracked tighter & no glow → reads *less* dominant than its children.
- `.ch00-lead` 200/43px/white · `.ch02-text-a` 200/32px/white · `.ch01-sub` 300/20px/**cyan (full)**.
- Tiny labels in display face: `.frag-label` 400/8px/0.22em/**cyan .65** · `.mod-tag` ~0.38rem/**cyan .48** · `.ai-sig-label` 300/8.3px/0.30em/**cyan .42** · `.ai-sig-value` 200/11.8px/**cyan .62** · `.ch05-eyebrow` 300/8.8px/**cyan .6** · `.ch05-status` 300/8px/**cyan .42**.

**Cyan-as-text offenders (recolour these):** `.ch01-sub`, `.frag-label`, `.mod-tag`, `.wordmark-name`, `.wordmark-sub`, `.ai-wordmark`, `.ai-subline`, `.ai-sig-label`, `.ai-sig-value`, `.ai-footer-text`, `.ch05-mod-layer`, `.ch05-eyebrow`, `.ch05-status` (text).

**Animation census (live; 35 elements, 8 infinite `@keyframes`):**
- `bar-scan` ×12 → CH03 `.mod-bar`
- `ai-dot-pulse` ×8 → CH04 `.ai-sig-dot` + pill dot + CH05 `.ch05-mod-dot` + `.ch05-status-dot`
- `ai-bar-scan` ×4 → CH04 `.ai-sig-fill`
- `ai-sig-breathe` ×4 → CH04 `.ai-sig-value`
- `mod-field-resonance` ×4 → CH03 `.ch03-module`
- `ai-sweep` ×1 → CH04 scanline (**keep** — CH04's one ambient motion)
- `ai-pill-glow` ×1 → `.ai-active-pill`
- `pulse-hint` ×1 → CH00 scroll hint (**keep** — CH00's one ambient cue)

---

## 6. THE ACCEPTED PLAN (Mont-Fort restraint polish, no redesign)

Each item: **file · selector · current issue · proposed change · risk · impact.** Phase 1 is approved-in-principle; await the §7 decisions for Phase 2 specifics. Do **Phase 1 only**, then re-benchmark, then Phase 2.

### PHASE 1 — Low-risk, high-impact

**1A · Cyan demotion** — `globals.css` (+ optional `Stage.tsx`).
- Selectors: the cyan-as-text list above.
- Issue: ~half of text is cyan; accent meaningless.
- Change: labels → `--haze`; data/values → `--ice`; sub-heads → `--ice`/`--white`. Keep cyan ONLY on WebGL hero core (unchanged), `.ch05-status-dot`, and the single CH04 live dot. *Optional/med:* in `Stage.tsx` soften route-line base toward steel/ice, cyan only at scan peaks.
- Risk: **very low** (CSS values). Impact: **highest single move** → calm/editorial.

**1B · Reduce infinite DOM loops** — `globals.css`.
- Remove animation declarations: `mod-field-resonance` (×4), `ai-dot-pulse` (on sig dots ×4 + mod-dots ×2), `ai-sig-breathe` (×4), `ai-pill-glow`. Elements stay; motion stops.
- Keep exactly ONE ambient motion per chapter: CH00 `pulse-hint`, CH04 `ai-sweep`, CH05 `.ch05-status-dot` heartbeat. CH01/02/03 rely on WebGL.
- Risk: **low**. Impact: **high** → stillness.

**1C · Remove dashboard bars** — `page.tsx` (markup) + `globals.css`.
- Remove `.frag-bar` (8, CH02), `.mod-bars`/`.mod-bar`+`bar-scan` (12, CH03), `.ai-sig-bar`/`.ai-sig-fill`+`ai-bar-scan` (4, CH04). Keep the text content (labels/values).
- Risk: **low-med** (CH03 modules will look lighter — keep tag+title, tune padding so they don't read empty). Impact: **high** → removes telemetry-dashboard read.

**1D · Small-label typography discipline (no new font)** — `globals.css`.
- Selectors: `.mod-tag`, `.frag-label`, `.ai-sig-label`, `.ai-subline`, `.ch05-mod-layer`, `.ch05-eyebrow`, `.ch05-status`, `.ch05-fut-label`.
- Issue: display face at sub-9px + extreme tracking = muddy/gimmicky.
- Change: one micro-label standard — **floor .625rem (10px)**, tracking **~0.16–0.20em**, weight **400**, colour `--haze`.
- Risk: **low**. Impact: **medium** → intentional, legible labels.

**Phase 1 success metrics (re-run live probe):** cyan text count down ~80%; ≤1 DOM loop visible per chapter; zero animated bars.

### PHASE 2 — Medium-risk (needs §7 decisions)

**2A · CH01↔CH05 name collision** — `page.tsx` (`.ch01-title` + `.ch01-sub`). ⚠️ user decision #1.
- Issue: brand name spent at hero scale in CH01, weakening CH05's reveal.
- Option A (recommended): CH01 hero becomes the positioning line ("The intelligence layer for global shipping."), remove the large "Anchor Point" wordmark from CH01; CH05 owns the only large brand reveal.
- Option B: keep "Anchor Point" in CH01 but shrink to a small quiet title-card.
- Constraint: reuse existing copy only. Risk: medium. Impact: high.

**2B · Wordmark system unification** — `globals.css` (+ optional `layout.tsx`). ⚠️ user decision #2.
- Selectors: `.wordmark-name`, `.ai-wordmark`, `.ch05-wordmark` + sublines.
- Issue: 3 trackings (0.32/0.34/0.18em); children cyan, parent white; all weight 100 → parent weaker than children.
- Change: weight **200** for all three; **children** (AnchorVoyage, Anchor AI) share one size tier + one tracking (~0.28em), colour `--ice`, minimal/no glow; **parent** (Anchor Point) larger tier, ~0.20em, `--white`, the ONLY one with a soft glow → dominant.
- Optional: add a neutral UI/text face (`--font-ui`, e.g. Inter/Geist) for labels/data if 1D isn't enough.
- Risk: medium (verify both viewports). Impact: high.

**2C · CH04 decrowding** — `page.tsx` + `globals.css`. ⚠️ user decision #3.
- Issue: banner + 4 signals + footer pill + core = no single focal point.
- Change: keep 4 signals quiet (text-only post-1C, dim `--haze`, no pulse) OR cut to 2 diagonal; replace bordered glowing `.ai-active-pill` with one quiet status line (single live dot).
- Risk: medium. Impact: high.

### PHASE 3 — Later (higher risk, separate sessions)
- **3A Chapter tempo variation** — `page.tsx` ScrollTrigger scrub/timing; vary cadence, add held-silent beats. Risk med-high (⚠️ Lenis cap, §8). 
- **3B Designed inter-chapter dissolves** ("dissolve, don't cut") — overlapping opacity ramps at boundaries + WebGL bridge. Risk high.
- **3C Photographic/atmospheric texture** — subtle grain / fog / one restrained low-opacity sea-horizon behind WebGL. NOT product imagery. Risk med-high. Experimental.

---

## 7. OPEN DECISIONS — get these from the user before Phase 2 (Phase 1 can start without them)

1. **CH01 copy:** Option A (positioning line, remove brand wordmark — recommended) or Option B (small quiet title-card)?
2. **Secondary font:** stay single-typeface (Josefin only; 1D handles labels) or add a neutral UI face for labels/data?
3. **CH04 signals:** keep all 4 (quiet) or cut to 2?

Phase 1 (1A–1D) is independent of these and is the approved starting point.

---

## 8. Known pitfalls (learned the hard way)

- **Lenis stale scroll cap:** after adding a section or anything that changes total scroll height over HMR, Lenis keeps capping scroll at the old height → new content unreachable ("there's nothing there"). Fix: **full dev-server restart + hard reload**. Already hardened with deferred `ScrollTrigger.refresh()` (rAF + 600ms) after first paint in `page.tsx`. Any Phase-3 height/trigger change risks this — restart + hard reload to verify.
- **Two dev servers / `.next` cache:** Next refuses a second dev server against the same `.next`. Kill the stray Node PID before `npm run dev`.
- **No `@types/three`:** `npx tsc` reports a couple of module-level `any` errors in `Stage.tsx`. **Pre-existing and harmless** — Turbopack dev transpiles without type-checking. Don't "fix" by churning the WebGL.
- **Preview screenshots frame small:** the preview tool renders the page into a small corner of the image — fine for **gross composition/density**, useless for fine type/colour. For precise type/colour use `preview_eval` computed styles; for "is it crowded" use the screenshot.

---

## 9. How to reproduce the live benchmark (so you can verify your own work)

The previous Claude verified everything with the **Claude Preview MCP** (`mcp__Claude_Preview__preview_*`). Method:

1. `preview_start` with name `"dev"` (or it may already be running — `preview_list`). URL `http://localhost:3000`.
2. `preview_resize` to **1440×900** (then repeat checks at **1366×768**).
3. To capture a chapter's key frame: `preview_eval` →
   ```js
   (async () => { window.scrollTo(0, Y); await new Promise(r=>setTimeout(r,3300)); return window.scrollY; })()
   ```
   The **~3.3s wait is mandatory** — `scrub: 2.5` means visuals lag the scroll; screenshot before settling and you capture a half-finished frame. `window.scrollTo` sticks (native scroll; Lenis doesn't fight a programmatic jump after settle).
4. Target scroll positions at 1440×900 (section base + progress×1800):
   - CH00 `Y=0` · CH01 `Y≈1710` · CH02 `Y≈4176` · CH03 `Y≈7056` · CH04 `Y≈9216` (peak) · CH05 `Y≈12330`.
   - At other viewports compute from §3 math (`base=i*vh*3`, `active=vh*3−vh`).
5. `preview_screenshot` after the wait (composition); `preview_eval` for computed styles & the animation census:
   ```js
   // animation census
   (() => { const a={}; document.querySelectorAll('*').forEach(e=>{const n=getComputedStyle(e).animationName; if(n&&n!=='none') n.split(',').forEach(x=>{x=x.trim();a[x]=(a[x]||0)+1;});}); return a; })()
   ```
   ```js
   // computed type/colour for a selector
   (()=>{const s=getComputedStyle(document.querySelector('SELECTOR'));return{font:s.fontFamily,w:s.fontWeight,size:s.fontSize,ls:s.letterSpacing,color:s.color};})()
   ```
6. **Always re-verify at both 1440×900 and 1366×768.** CH05 was previously confirmed to hold (no overlap, wordmark capped at 80px) at 1366×768.

When done with a session, `preview_stop` the server.

---

## 10. Working style the user expects

- Honest, critical, evidence-based. The user explicitly values **not inventing** — if you can't observe something (e.g. Mont-Fort live), say so and separate evidence tiers (prior analysis / live observation / your judgement).
- High-effort, restrained taste. This is a **luxury cinematic** project; match that bar.
- Auto Mode is on (`anchor-point/AGENTS.md`): bias to action on reasonable calls, but **stop for genuine decisions** (the §7 items are genuine decisions).
- Confirm before commits; keep `master` protected; work on the polish branch.
- There's also persistent memory at `~/.claude/.../memory/project_anchor_point.md` on the *primary* laptop — it won't be on the other laptop, so this HANDOFF.md is the source of truth there.

---

## 11. Immediate next action for the other-laptop Claude

1. `git checkout monfort-restraint-polish-phase-1 && git pull`, `npm install`, `npm run dev`. Then confirm the bundled `ui-ux-pro-max` skill is available (see §1.5) and `python --version` works (optional, for the skill's scripts).
2. Re-run the §9 benchmark to confirm the baseline matches §5 (sanity that you're looking at the same build).
3. Ask the user the §7 decisions (or confirm they want Phase 1 first).
4. On approval, implement **Phase 1 only** (1A→1B→1C→1D), re-run the §9 probe to hit the Phase-1 success metrics, show before/after screenshots, then stop for review.
5. Do **not** proceed to Phase 2 until §7 is answered and the user approves.

Good luck. Keep it restrained.
