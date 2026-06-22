'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * CH00 ocean-atmosphere — Step 1A (living-ocean motion, DOM/CSS only).
 *
 * A dark-ocean still layered BEHIND the transparent WebGL canvas (z = -1), shown
 * only on the homepage and only during CH00. Step 1A adds extremely restrained,
 * CSS-only motion — two ocean layers drifting/breathing at different very slow
 * speeds (depth parallax) plus a faint luminance breath — so the water feels
 * slowly alive without ever reading as a video loop.
 *
 * It fades out as CH00 hands off to CH01 via a small passive scroll listener (the
 * same pattern Header.tsx uses). It does NOT touch GSAP / Lenis / ScrollTrigger /
 * scrollStore, Stage.tsx, the WebGL particle system, or any chapter logic.
 *
 * Respects prefers-reduced-motion (falls back to the static still).
 *
 * Fully additive and reversible: delete this file and its <OceanBackdrop /> line in
 * app/layout.tsx to remove it entirely. If the image is ever missing it degrades to
 * the existing html gradient (no regression).
 */

// All motion lives here so the whole effect is self-contained and deletable.
// Magnitudes are deliberately tiny (sub-1% translate, ~3% scale) over long,
// non-harmonic periods + alternate easing — felt more than noticed, no visible loop.
const OCEAN_CSS = `
.ap-ocean-img {
  position: absolute;
  inset: 0;
  background-image: url(/media/ch00-ocean.webp);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
  backface-visibility: hidden;
}
/* Front layer — the main ocean, gentle breathing swell + slow lateral drift */
.ap-ocean-a {
  animation: ap-ocean-drift-a 34s ease-in-out infinite alternate;
}
/* Back layer — mirrored, softened, slower & opposite: reads as deeper water */
.ap-ocean-b {
  opacity: 0.55;
  filter: blur(3px) brightness(0.82);
  animation: ap-ocean-drift-b 50s ease-in-out infinite alternate;
}
/* Luminance breath — a faint cool lift that slowly rises and falls, like light
   shifting on water. Kept very low + screen-blended so it never shimmers. */
.ap-ocean-lum {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 64% 48% at 50% 44%,
    rgba(120,160,190,0.085) 0%, rgba(120,160,190,0) 70%);
  mix-blend-mode: screen;
  will-change: opacity;
  animation: ap-ocean-lum 42s ease-in-out infinite;
}
/* Step 1A.3 — motion raised again: ~15% more amplitude + ~20% faster cycles vs
   1A.2, so the water reads as alive at a glance while staying slow and premium.
   Translate maxima stay inside the scale bleed margin (no frame reveal). */
@keyframes ap-ocean-drift-a {
  from { transform: scale(1.12) translate3d(-1.25%, 0.8%, 0); }
  to   { transform: scale(1.17) translate3d(1.45%, -1.0%, 0); }
}
@keyframes ap-ocean-drift-b {
  from { transform: scaleX(-1) scale(1.18) translate3d(1.2%, -0.7%, 0); }
  to   { transform: scaleX(-1) scale(1.245) translate3d(-1.3%, 0.95%, 0); }
}
@keyframes ap-ocean-lum {
  0%, 100% { opacity: 0.2; }
  50%      { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .ap-ocean-a, .ap-ocean-b, .ap-ocean-lum { animation: none !important; }
}
`

export default function OceanBackdrop() {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pathname !== '/') return
    const el = ref.current
    if (!el) return

    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight || 1
      // CH00 copy exits by ~0.48vh (16% of the first 300vh film section). Hold the
      // ocean at full through the whole CH00 beat (until 0.45vh), then fade so it is
      // gone by 1.30vh — comfortably before the CH01 divider/statement (~2vh) and
      // every later chapter. (Step 1A: held longer so it no longer fades too early.)
      const start = 0.45 * vh
      const end = 1.3 * vh
      const t = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)))
      const s = t * t * (3 - 2 * t) // smootherstep
      el.style.opacity = String(1 - s)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  if (pathname !== '/') return null

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        willChange: 'opacity',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: OCEAN_CSS }} />

      {/* Deeper water (back) — softened + mirrored, slow opposite drift for parallax */}
      <div className="ap-ocean-img ap-ocean-b" />
      {/* The dark-ocean still (front) — gentle breathing swell + slow drift */}
      <div className="ap-ocean-img ap-ocean-a" />
      {/* Luminance breath — faint cool lift rising and falling on the water */}
      <div className="ap-ocean-lum" />

      {/* Edge vignette — dissolves the frame into abyss (no horizon, keeps it mysterious).
          Step 1A.3 darkness pass: deepened the surround (~+13% at the edge, 0.75 → 0.88)
          and pulled it slightly inward with a smooth mid-stop so the ocean emerges from
          abyss instead of tiling the frame. Centre (to 40%) is untouched, so the water
          highlights and CH00 text are preserved — no harsh ring, no flat-black crush. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 82% 78% at 50% 48%, rgba(4,18,26,0) 40%, rgba(4,18,26,0.48) 72%, rgba(4,18,26,0.88) 100%)',
        }}
      />
      {/* Uniform recede + soft centre pool — pushes the ocean behind the particle
          field and keeps the CH00 text legible. The flat wash mutes the brightest
          ripples so the vessel points read on top; the centre pool darkens the text. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 50% 38% at 50% 48%, rgba(4,18,26,0.40) 0%, rgba(4,18,26,0) 74%), linear-gradient(rgba(4,18,26,0.20), rgba(4,18,26,0.20))',
        }}
      />
    </div>
  )
}
