"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * CH01 underwater layer.
 *
 * Sits between the WebGL Stage (z:0) and the DOM content (z:1) on the homepage
 * only, and drives a single sensory arc from window.scrollY:
 *
 *   CH00 surface       (p<0.16)  → fully transparent, Stage reads normally
 *   PLUNGE             (0.16–0.55) → surface line crosses overhead, bubbles rise,
 *                                    pressure blur, viewer is pulled under
 *   CH01 underwater    (0.55–1.0) → deep navy volume, overhead light shafts,
 *                                   suspended drift, route layer reads as
 *                                   diffused currents through water
 *
 * Pointer-events: none, aria-hidden, homepage-only. Stage.tsx and all chapter
 * logic are untouched — the volume disguises the top-down route field rather
 * than replacing it. Fully reversible: delete this file + its import in
 * app/layout.tsx and CH00→CH01 returns to its prior state.
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

/* ── 1. DEEP WATER VOLUME ─────────────────────────────────────────────────
   Vertical depth gradient — lighter near the (vanished) surface, denser
   toward the seafloor. The radial centre pool keeps CH01 text legible. */
.ap-uw-volume {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 44% at 50% 52%,
      rgba(2,12,22,0.55) 0%,
      rgba(2,12,22,0) 70%),
    linear-gradient(180deg,
      rgba(4,22,38,0.20) 0%,
      rgba(3,18,32,0.55) 38%,
      rgba(2,12,22,0.78) 100%);
  mix-blend-mode: multiply;
}

/* ── 2. PRESSURE BLUR ──────────────────────────────────────────────────────
   Soft radial darkening + a touch of backdrop blur that intensifies through
   the plunge. Kept subtle so it never reads as a lens-distortion gimmick. */
.ap-uw-pressure {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(calc(var(--plunge, 0) * 4px));
  -webkit-backdrop-filter: blur(calc(var(--plunge, 0) * 4px));
  background: radial-gradient(ellipse 110% 90% at 50% 50%,
    rgba(0,0,0,0) 45%,
    rgba(0,4,10,calc(var(--depth, 0) * 0.45)) 100%);
}

/* ── 3. CAUSTIC LIGHT SHAFTS ───────────────────────────────────────────────
   Diffused, soft god-rays angling down from the (now-overhead) surface.
   Three layered linear gradients, very low alpha — they don't read as
   distinct beams, they read as light filtering through water. Slow drift. */
.ap-uw-light {
  position: absolute;
  inset: -8%;
  opacity: calc(var(--depth, 0) * 0.85);
  background:
    linear-gradient( 96deg, transparent 18%, rgba(140,190,220,0.085) 26%, transparent 34%),
    linear-gradient(102deg, transparent 42%, rgba(120,170,200,0.060) 50%, transparent 58%),
    linear-gradient( 88deg, transparent 64%, rgba(160,200,225,0.075) 72%, transparent 80%);
  background-size: 100% 200%;
  background-position: 0% 0%;
  mix-blend-mode: screen;
  animation: ap-uw-shaft-drift 38s linear infinite;
  filter: blur(8px);
}

/* ── 4. SUSPENDED PARTICLES ───────────────────────────────────────────────
   24 motes of drifting matter. Each is positioned + animated individually so
   no two follow the same path — reads as plankton/silt in a water column,
   never as a particle FX explosion. Sparkles deliberately avoided
   (no scale-pulse, no bright pop). Visible only once submerged. */
.ap-uw-motes {
  position: absolute;
  inset: 0;
  opacity: calc(max(0, var(--depth, 0) - 0.25) * 1.1);
}
.ap-uw-mote {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(180,210,230,0.55);
  box-shadow: 0 0 4px rgba(160,200,230,0.35);
  animation-name: ap-uw-mote-drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* ── 5. SURFACE LINE ──────────────────────────────────────────────────────
   The water surface seen from beneath: a soft refractive band that descends
   past the viewport during the plunge. translateY is driven by --plunge so
   the band passes overhead at the exact moment of submersion. */
.ap-uw-surface {
  position: absolute;
  left: -20%;
  right: -20%;
  top: -25%;
  height: 60%;
  background:
    linear-gradient(180deg,
      rgba(80,140,180,0) 0%,
      rgba(120,180,220,0.18) 38%,
      rgba(180,220,240,0.42) 50%,
      rgba(120,180,220,0.18) 62%,
      rgba(80,140,180,0) 100%);
  filter: blur(6px);
  opacity: calc(var(--plunge-vis, 0));
  transform: translateY(calc((var(--plunge, 0) - 0.35) * 260%));
  mix-blend-mode: screen;
}
/* Wake displacement above the descending surface — slight chromatic shimmer
   so the surface line feels like water bending light, not a CSS gradient. */
.ap-uw-surface::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  top: 38%; height: 24%;
  background:
    radial-gradient(ellipse 70% 100% at 30% 50%, rgba(200,230,245,0.18) 0%, transparent 70%),
    radial-gradient(ellipse 60% 100% at 70% 50%, rgba(170,210,235,0.14) 0%, transparent 70%);
  filter: blur(10px);
}

/* ── 6. BUBBLES ────────────────────────────────────────────────────────────
   Streams of small bubbles rising past the viewer at the moment of plunge.
   Three columns, staggered, only visible during plunge — reads as displaced
   water around the body entering the column. */
.ap-uw-bubbles {
  position: absolute;
  inset: 0;
  opacity: var(--plunge-vis, 0);
}
.ap-uw-bubble {
  position: absolute;
  bottom: -10%;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85) 0%, rgba(200,230,250,0.45) 40%, rgba(160,200,230,0.10) 80%, transparent 100%);
  animation: ap-uw-bubble-rise linear infinite;
  filter: blur(0.4px);
}

/* ── 7. DEPTH VIGNETTE ────────────────────────────────────────────────────
   Tightens the frame as depth increases — pressure on the periphery,
   keeps the eye centred on the statement. */
.ap-uw-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 78% 72% at 50% 50%,
    rgba(0,0,0,0) 48%,
    rgba(0,2,6,calc(var(--depth, 0) * 0.55)) 88%,
    rgba(0,2,6,calc(var(--depth, 0) * 0.78)) 100%);
}

/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes ap-uw-shaft-drift {
  from { background-position: 0%   0%; }
  to   { background-position: -22% 100%; }
}
@keyframes ap-uw-mote-drift {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(var(--mx, 6px), var(--my, -22px), 0); }
}
@keyframes ap-uw-bubble-rise {
  0%   { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0; }
  10%  { opacity: 0.9; }
  90%  { opacity: 0.7; }
  100% { transform: translate3d(var(--bx, 18px), -120vh, 0) scale(1.05); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ap-uw-light, .ap-uw-mote, .ap-uw-bubble { animation: none !important; }
  .ap-uw-surface { transition: none !important; }
}
`;

const MOTE_COUNT = 24;
const BUBBLE_COUNT = 14;

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

// Deterministic pseudo-random so SSR matches client (no hydration mismatch).
function makeMotes(): Mote[] {
  const out: Mote[] = [];
  for (let i = 0; i < MOTE_COUNT; i++) {
    const a = Math.sin(i * 12.9898) * 43758.5453;
    const b = Math.sin(i * 78.233) * 43758.5453;
    const c = Math.sin(i * 39.346) * 43758.5453;
    const r1 = a - Math.floor(a);
    const r2 = b - Math.floor(b);
    const r3 = c - Math.floor(c);
    const size = 1 + r3 * 2.2;
    out.push({
      left: (r1 * 100).toFixed(2) + "%",
      top: (r2 * 100).toFixed(2) + "%",
      size,
      dur: (22 + r3 * 28).toFixed(1) + "s",
      delay: (-r1 * 40).toFixed(1) + "s",
      mx: ((r2 - 0.5) * 18).toFixed(1) + "px",
      my: (-(14 + r3 * 26)).toFixed(1) + "px",
      opacity: 0.35 + r3 * 0.45,
    });
  }
  return out;
}
function makeBubbles(): Bubble[] {
  const out: Bubble[] = [];
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const a = Math.sin(i * 21.31) * 43758.5453;
    const b = Math.sin(i * 57.117) * 43758.5453;
    const c = Math.sin(i * 91.733) * 43758.5453;
    const r1 = a - Math.floor(a);
    const r2 = b - Math.floor(b);
    const r3 = c - Math.floor(c);
    out.push({
      left: (10 + r1 * 80).toFixed(2) + "%",
      size: 3 + r3 * 5,
      dur: (4.5 + r2 * 3.5).toFixed(2) + "s",
      delay: (-r1 * 5).toFixed(2) + "s",
      bx: ((r3 - 0.5) * 50).toFixed(1) + "px",
    });
  }
  return out;
}

const MOTES = makeMotes();
const BUBBLES = makeBubbles();

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

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      // 300vh sticky film → progress 0..1 over scrollY 0..200vh
      const filmRunway = 2 * vh;
      const p = Math.max(0, Math.min(1, window.scrollY / filmRunway));

      // depth: 0 until CH00 starts exiting (p≥0.14), ramps to 1 by p=0.62,
      // holds at full through the rest of CH01. Smootherstep keeps the
      // descent feel monotonic — once you go under, you stay under.
      const depth = smootherstep((p - 0.14) / 0.48);

      // plunge: a single bell over the submersion moment. The surface band
      // passes overhead at plunge≈0.55, where its translateY zeros out.
      // Visibility is shorter than the bell so the surface line cleanly
      // appears, sweeps past, and disappears (no lingering ghost band).
      const plungeRaw = Math.max(0, Math.min(1, (p - 0.16) / 0.34));
      const plunge = smootherstep(plungeRaw);
      const plungeVis = Math.sin(
        Math.max(0, Math.min(1, (p - 0.18) / 0.3)) * Math.PI,
      );

      el.style.setProperty("--depth", depth.toFixed(4));
      el.style.setProperty("--plunge", plunge.toFixed(4));
      el.style.setProperty("--plunge-vis", plungeVis.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  if (pathname !== "/") return null;

  return (
    <div ref={ref} className="ap-underwater" aria-hidden>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Order matters: volume tints Stage canvas, light shafts read on top
          of the tint, motes drift through the lit volume, then surface line
          and bubbles overlay during the plunge, then vignette at the edge. */}
      <div className="ap-uw-volume" />
      <div className="ap-uw-light" />

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

      <div className="ap-uw-surface" />

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
