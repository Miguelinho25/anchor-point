"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { scrollStore } from "@/lib/scrollStore";

/**
 * CH01 underwater layer.
 *
 * Sits between the WebGL Stage (z:0) and the DOM content (z:1) on the homepage
 * only. Driven by the shared scrollStore (same signals the WebGL field and the
 * DOM chapters read), it runs one continuous sensory arc:
 *
 *   CH00 surface     (progress < 0.16) → fully transparent, Stage reads normally
 *   DESCENT          (0.16 – 0.60)      → surface light recedes overhead, blur
 *                                         pulse + rising bubbles, depth tint and
 *                                         instrument-blue glow build
 *   CH01 underwater  (0.60 – 1.0)       → settled deep volume: overhead shafts,
 *                                         suspended particulate, faint distant
 *                                         silhouettes, the intelligence field
 *                                         glowing through the water
 *   CH02 onward      (ch02Progress > 0) → overlay recedes to fully transparent,
 *                                         so CH02–CH05 keep their full glow
 *
 * Design notes that matter for review:
 *  - NO `multiply` blend. The depth tint is center-clear (dark only at the top
 *    and bottom edges) so it never crushes the glow of the particle field that
 *    lives in the centre of the frame. Depth/energy come from a screen-blended
 *    blue glow + vignette + shafts, not from darkening the particles.
 *  - The overlay's container opacity IS the depth, and depth multiplies back to
 *    0 as CH02 begins — so nothing the overlay does can dim CH02–CH05. The
 *    earlier "dead lines" regression came from this overlay staying at full
 *    strength over the persistent Stage canvas for the whole page.
 *  - The surface light is top-anchored and recedes UPWARD; nothing translates
 *    across the middle of the screen, so there is no stray horizontal line.
 *  - Pressure blur is a transient pulse during the sink only; it returns to 0
 *    once submerged, keeping the field crisp and glowing at rest.
 *
 * Pointer-events: none, aria-hidden, homepage-only. Stage.tsx, global CSS, and
 * all chapter logic are untouched. Fully reversible: delete this file + its
 * import in app/layout.tsx.
 */

const CSS = `
.ap-underwater {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: var(--depth, 0);
  will-change: opacity;
}

/* ── 1. DEPTH TINT (normal blend, CENTRE-CLEAR) ───────────────────────────
   Darkens only the top and bottom edges so the frame gains a heavy "water
   column" feel with depth, while the central band — where the WebGL particle
   field and currents live — stays completely clear and keeps its full glow. */
.ap-uw-tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
    rgba(3,16,28,0.62) 0%,
    rgba(3,16,28,0.18) 18%,
    rgba(3,16,28,0)   34%,
    rgba(2,11,21,0)   60%,
    rgba(2,10,19,0.40) 82%,
    rgba(2,9,18,0.72) 100%);
}

/* ── 2. DEPTH GLOW (screen blend) ─────────────────────────────────────────
   A soft instrument-blue luminance in the centre of the field — the hidden
   intelligence layer glowing through the water. Screen-blended + low alpha so
   it lifts the particles/currents and adds energy without washing to white or
   reading as a HUD. */
.ap-uw-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 54% 44% at 50% 50%,
      rgba(26,150,200,0.11) 0%,
      rgba(20,112,170,0.055) 42%,
      rgba(16,90,150,0) 72%),
    radial-gradient(ellipse 80% 60% at 50% 46%,
      rgba(14,70,120,0.05) 0%,
      transparent 70%);
  mix-blend-mode: screen;
}

/* ── 3. OVERHEAD LIGHT SHAFTS (screen blend) ──────────────────────────────
   Diffused god-rays from the surface above. Three low-alpha gradients, heavily
   blurred + slow drift — read as light filtering down through water, never as
   distinct beams. */
.ap-uw-light {
  position: absolute;
  inset: -10%;
  opacity: calc(var(--depth, 0) * 0.9);
  background:
    linear-gradient( 94deg, transparent 16%, rgba(150,200,228,0.10) 24%, transparent 33%),
    linear-gradient(100deg, transparent 40%, rgba(125,178,210,0.072) 49%, transparent 59%),
    linear-gradient( 86deg, transparent 63%, rgba(165,205,230,0.088) 71%, transparent 80%);
  background-size: 100% 220%;
  background-position: 50% 0%;
  mix-blend-mode: screen;
  animation: ap-uw-shaft-drift 44s linear infinite;
  filter: blur(10px);
}

/* ── 4. RECEDING SURFACE LIGHT (screen blend) ─────────────────────────────
   The surface seen from just beneath, anchored to the TOP of the frame. As you
   sink it dims and slides further up and out of view — the surface receding
   above you. It never crosses the middle of the screen, so there is no stray
   horizontal band/line artifact. */
.ap-uw-surface {
  position: absolute;
  left: -12%;
  right: -12%;
  top: -26%;
  height: 56%;
  background: radial-gradient(ellipse 78% 100% at 50% 0%,
    rgba(168,212,236,0.26) 0%,
    rgba(120,175,210,0.12) 32%,
    rgba(90,150,190,0.05) 52%,
    transparent 74%);
  filter: blur(16px);
  mix-blend-mode: screen;
  opacity: var(--surface, 0);
  transform: translateY(calc(var(--surface-recede, 0) * -46%));
}

/* ── 5. SUSPENDED PARTICULATE ─────────────────────────────────────────────
   Drifting plankton/silt in the water column. Each mote is positioned and
   animated individually (no shared path), faintly glowing — reads as alive,
   never as a sparkle FX. Visible once submerged, fades out by CH02. */
.ap-uw-motes {
  position: absolute;
  inset: 0;
  opacity: calc(var(--depth, 0) * 0.95);
}
.ap-uw-mote {
  position: absolute;
  border-radius: 50%;
  background: rgba(186,214,234,0.6);
  box-shadow: 0 0 5px rgba(150,200,230,0.45);
  animation-name: ap-uw-mote-drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* ── 6. SLOW MICRO-BUBBLES ────────────────────────────────────────────────
   Sparse, small bubbles rising slowly through the column — subtle ambient
   life. Tied to depth (a touch stronger during the sink). No cartoon shine. */
.ap-uw-bubbles {
  position: absolute;
  inset: 0;
  opacity: calc(var(--depth, 0) * 0.55 + var(--pulse, 0) * 0.3);
}
.ap-uw-bubble {
  position: absolute;
  bottom: -8%;
  border-radius: 50%;
  background: radial-gradient(circle at 36% 32%,
    rgba(230,244,252,0.7) 0%,
    rgba(180,214,236,0.32) 45%,
    rgba(150,195,225,0.08) 78%,
    transparent 100%);
  animation: ap-uw-bubble-rise linear infinite;
  filter: blur(0.3px);
}

/* ── 7. DISTANT SILHOUETTES (extremely subtle) ────────────────────────────
   Faint, far-off shapes drifting slowly across the deep background — read as
   distant marine life at the edge of visibility. Heavily blurred, very low
   opacity, slow glide. Deliberately not detailed: a suggestion, not an
   aquarium. Easy to remove (delete this block + the .ap-uw-school markup). */
.ap-uw-school {
  position: absolute;
  inset: 0;
  opacity: calc(var(--depth, 0) * 0.5);
}
.ap-uw-fish {
  position: absolute;
  background: radial-gradient(ellipse 62% 100% at 64% 50%,
    rgba(5,14,22,0.85) 0%,
    rgba(5,14,22,0.35) 55%,
    transparent 80%);
  border-radius: 50%;
  filter: blur(2.5px);
  animation-name: ap-uw-fish-swim;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

/* ── 8. PRESSURE (transient sink blur + soft darkening) ───────────────────
   A brief backdrop blur + radial darkening that PULSES during the descent and
   returns to zero once submerged — the disorientation of sinking, not a
   permanent soft-focus. (--pulse is a bell over the sink only.) */
.ap-uw-pressure {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(calc(var(--pulse, 0) * 3px));
  -webkit-backdrop-filter: blur(calc(var(--pulse, 0) * 3px));
  background: radial-gradient(ellipse 120% 95% at 50% 42%,
    transparent 50%,
    rgba(0,5,12,calc(var(--pulse, 0) * 0.35)) 100%);
}

/* ── 9. DEPTH VIGNETTE ────────────────────────────────────────────────────
   Closes the periphery as depth increases (pressure on the edges, eye held to
   the centre). Gentle — never crushes the field. */
.ap-uw-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 74% at 50% 50%,
    rgba(0,0,0,0) 50%,
    rgba(0,3,8,calc(var(--depth, 0) * 0.42)) 86%,
    rgba(0,3,8,calc(var(--depth, 0) * 0.66)) 100%);
}

/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes ap-uw-shaft-drift {
  from { background-position: 56% 0%; }
  to   { background-position: 44% 100%; }
}
@keyframes ap-uw-mote-drift {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(var(--mx, 6px), var(--my, -22px), 0); }
}
@keyframes ap-uw-bubble-rise {
  0%   { transform: translate3d(0, 0, 0) scale(0.85); opacity: 0; }
  12%  { opacity: 0.8; }
  88%  { opacity: 0.6; }
  100% { transform: translate3d(var(--bx, 14px), -118vh, 0) scale(1.02); opacity: 0; }
}
@keyframes ap-uw-fish-swim {
  from { transform: translate3d(-16vw, 0, 0) scaleX(var(--dir, 1)); }
  50%  { transform: translate3d(42vw, var(--bob, 6px), 0) scaleX(var(--dir, 1)); }
  to   { transform: translate3d(116vw, 0, 0) scaleX(var(--dir, 1)); }
}

@media (prefers-reduced-motion: reduce) {
  .ap-uw-light, .ap-uw-mote, .ap-uw-bubble, .ap-uw-fish { animation: none !important; }
}
`;

const MOTE_COUNT = 28;
const BUBBLE_COUNT = 10;
const FISH_COUNT = 3;

type Mote = {
  left: string;
  top: string;
  size: number;
  dur: string;
  delay: string;
  mx: string;
  my: string;
  opacity: number;
};
type Bubble = {
  left: string;
  size: number;
  dur: string;
  delay: string;
  bx: string;
};
type Fish = {
  top: string;
  width: number;
  height: number;
  dur: string;
  delay: string;
  dir: number;
  bob: string;
  opacity: number;
};

// Deterministic pseudo-random so SSR markup matches the client (no hydration
// mismatch). Same hash the WebGL field uses for its scatter.
function rng(i: number, salt: number) {
  const v = Math.sin(i * salt) * 43758.5453;
  return v - Math.floor(v);
}

function makeMotes(): Mote[] {
  const out: Mote[] = [];
  for (let i = 0; i < MOTE_COUNT; i++) {
    const r1 = rng(i + 1, 12.9898);
    const r2 = rng(i + 1, 78.233);
    const r3 = rng(i + 1, 39.346);
    out.push({
      left: (r1 * 100).toFixed(2) + "%",
      top: (r2 * 100).toFixed(2) + "%",
      size: +(1 + r3 * 2.4).toFixed(2),
      dur: (24 + r3 * 30).toFixed(1) + "s",
      delay: (-r1 * 44).toFixed(1) + "s",
      mx: ((r2 - 0.5) * 20).toFixed(1) + "px",
      my: -(14 + r3 * 28).toFixed(1) + "px",
      opacity: +(0.3 + r3 * 0.5).toFixed(2),
    });
  }
  return out;
}
function makeBubbles(): Bubble[] {
  const out: Bubble[] = [];
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const r1 = rng(i + 1, 21.31);
    const r2 = rng(i + 1, 57.117);
    const r3 = rng(i + 1, 91.733);
    out.push({
      left: (8 + r1 * 84).toFixed(2) + "%",
      size: +(2 + r3 * 3).toFixed(2),
      dur: (9 + r2 * 8).toFixed(2) + "s",
      delay: (-r1 * 12).toFixed(2) + "s",
      bx: ((r3 - 0.5) * 36).toFixed(1) + "px",
    });
  }
  return out;
}
function makeFish(): Fish[] {
  const out: Fish[] = [];
  for (let i = 0; i < FISH_COUNT; i++) {
    const r1 = rng(i + 1, 33.71);
    const r2 = rng(i + 1, 64.52);
    const r3 = rng(i + 1, 17.19);
    const w = 18 + r2 * 16;
    out.push({
      top: (24 + r1 * 46).toFixed(1) + "%",
      width: +w.toFixed(1),
      height: +(w * (0.2 + r3 * 0.08)).toFixed(1),
      dur: (52 + r2 * 30).toFixed(1) + "s",
      delay: (-r1 * 40).toFixed(1) + "s",
      dir: i % 2 === 0 ? 1 : -1,
      bob: ((r3 - 0.5) * 22).toFixed(1) + "px",
      opacity: +(0.05 + r3 * 0.06).toFixed(3),
    });
  }
  return out;
}

const MOTES = makeMotes();
const BUBBLES = makeBubbles();
const FISH = makeFish();

function smootherstep(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

export default function UnderwaterCH01() {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const loop = () => {
      rafId = requestAnimationFrame(loop);

      // Read the SAME shared signals the WebGL field and DOM chapters use, so
      // the water stays perfectly in sync with the descent and the chapters.
      const prog = scrollStore.progress; // CH00→CH01 film, 0..1
      const ch02 = scrollStore.ch02Progress; // CH02 film, 0..1 (0 during CH01)

      // Descent 0..1 across the sink. Drives surface recede + pressure pulse.
      const d01 = Math.max(0, Math.min(1, (prog - 0.12) / 0.5));

      // Depth ramps in through the descent and holds full through CH01...
      const depthIn = smootherstep((prog - 0.16) / 0.44);
      // ...then recedes to nothing as CH02 begins, so the overlay can never dim
      // CH02–CH05 (the persistent Stage canvas shows through cleanly again).
      const exit = smootherstep(ch02 / 0.18);
      const depth = depthIn * (1 - exit);

      // Surface light: peaks mid-descent, then dims as you go deep / into CH02.
      const surface = Math.sin(d01 * Math.PI) * (1 - exit);
      // ...and slides up and out of frame as you sink.
      const surfaceRecede = d01;

      // Transient blur/darkening pulse — present only while sinking.
      const pulse = Math.sin(d01 * Math.PI) * (1 - exit);

      el.style.setProperty("--depth", depth.toFixed(4));
      el.style.setProperty("--surface", surface.toFixed(4));
      el.style.setProperty("--surface-recede", surfaceRecede.toFixed(4));
      el.style.setProperty("--pulse", pulse.toFixed(4));
    };
    loop();
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  if (pathname !== "/") return null;

  return (
    <div ref={ref} className="ap-underwater" aria-hidden>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Back → front: depth tint, then blue depth glow + overhead shafts, then
          the receding surface light, then particulate / bubbles / distant
          silhouettes drifting through the lit volume, then the transient sink
          pressure, then the edge vignette. */}
      <div className="ap-uw-tint" />
      <div className="ap-uw-glow" />
      <div className="ap-uw-light" />
      <div className="ap-uw-surface" />

      <div className="ap-uw-school">
        {FISH.map((f, i) => (
          <span
            key={i}
            className="ap-uw-fish"
            style={
              {
                top: f.top,
                left: 0,
                width: `${f.width}px`,
                height: `${f.height}px`,
                opacity: f.opacity,
                animationDuration: f.dur,
                animationDelay: f.delay,
                ["--dir" as string]: String(f.dir),
                ["--bob" as string]: f.bob,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="ap-uw-motes">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="ap-uw-mote"
            style={
              {
                left: m.left,
                top: m.top,
                width: `${m.size}px`,
                height: `${m.size}px`,
                opacity: m.opacity,
                animationDuration: m.dur,
                animationDelay: m.delay,
                ["--mx" as string]: m.mx,
                ["--my" as string]: m.my,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="ap-uw-bubbles">
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="ap-uw-bubble"
            style={
              {
                left: b.left,
                width: `${b.size}px`,
                height: `${b.size}px`,
                animationDuration: b.dur,
                animationDelay: b.delay,
                ["--bx" as string]: b.bx,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="ap-uw-pressure" />
      <div className="ap-uw-vignette" />
    </div>
  );
}
