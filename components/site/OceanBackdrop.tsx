'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * CH00 ocean-atmosphere — living ocean + cursor wake.
 *
 * A dark-ocean still layered BEHIND the transparent WebGL canvas (z = -1), shown
 * only on the homepage and only during CH00. It fades out as CH00 hands off to CH01
 * via a small passive scroll listener. It does NOT touch GSAP / Lenis / ScrollTrigger
 * / scrollStore, Stage.tsx, the WebGL particle system, or any chapter logic.
 *
 * Two renderers, picked at runtime:
 *  • DESKTOP (fine pointer + motion allowed): an isolated raw-WebGL pass renders the
 *    ocean texture with the autonomous 1A.3 breathing/drift PLUS a localized cursor
 *    "wake" — a decaying disturbance field (a soft trail stamped along the cursor path
 *    that fades every frame, NOT expanding rings) bends the ocean texture's UVs locally,
 *    so it feels like the cursor is traversing the water. Away from the path = calm.
 *  • FALLBACK (touch / coarse pointer / reduced-motion / no-WebGL): the approved 1A.3
 *    DOM/CSS ocean (breathing/drift layers). No wake. prefers-reduced-motion → static.
 *
 * Fully additive and reversible: delete this file and its <OceanBackdrop /> line in
 * app/layout.tsx to remove it entirely. If the image is missing it degrades to the
 * existing html gradient (no regression).
 */

// ── Wake tuning (all in one place for easy adjustment) ───────────────────────
const FIELD_W = 200          // disturbance-field resolution (low-res is plenty)
const FIELD_H = 120
const DECAY = 0.05           // trail fade per frame — higher = shorter wake (~1–1.5s)
const STAMP = 0.085          // brush radius as a fraction of field width
const DISP_GRAD = 0.022      // how hard the wake bends the ocean texture
const DISP_VEL = 0.012       // extra smear along the direction of cursor motion
const WAKE_SHADE = 0.1       // subtle darkening on wake slopes (no brightening)
const RENDER_SCALE_MAX = 1.5 // cap canvas DPR for fill-rate

const VERT_SRC = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG_SRC = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uOcean;
uniform sampler2D uField;
uniform float uTime;
uniform float uCanvasAspect;
uniform float uImageAspect;
uniform vec2  uVel;
uniform float uTexel;
uniform float uDispGrad;
uniform float uDispVel;
uniform float uWakeShade;

// background-size: cover mapping
vec2 coverUV(vec2 uv) {
  float ratio = uCanvasAspect / uImageAspect;
  vec2 t = uv;
  if (ratio > 1.0) t.y = (uv.y - 0.5) / ratio + 0.5;
  else             t.x = (uv.x - 0.5) * ratio + 0.5;
  return t;
}

void main() {
  // Disturbance field is sampled in screen space (y flipped vs the GL quad).
  vec2 fuv = vec2(vUv.x, 1.0 - vUv.y);
  float f  = texture2D(uField, fuv).r;
  float fx = texture2D(uField, fuv + vec2(uTexel, 0.0)).r - texture2D(uField, fuv - vec2(uTexel, 0.0)).r;
  float fy = texture2D(uField, fuv + vec2(0.0, uTexel)).r - texture2D(uField, fuv - vec2(0.0, uTexel)).r;
  vec2 grad = vec2(fx, -fy);

  // Local displacement: bend around the wake + a little smear along motion.
  vec2 disp = grad * uDispGrad + vec2(uVel.x, -uVel.y) * f * uDispVel;

  // Base ocean UV with the autonomous breathing swell + slow drift (1A.3 feel).
  vec2 cuv = coverUV(vUv);
  float breathe = 1.0 + 0.018 * sin(uTime * 0.093);
  vec2 drift = vec2(0.012 * sin(uTime * 0.061), 0.010 * sin(uTime * 0.043));
  cuv = (cuv - 0.5) / breathe + 0.5 + drift;

  // Front layer + mirrored, softened back layer for depth (matches 1A.3).
  vec3 col  = texture2D(uOcean, cuv + disp).rgb;
  vec3 back = texture2D(uOcean, vec2(1.0 - cuv.x, cuv.y) + disp * 0.5).rgb * 0.82;
  col = mix(back, col, 0.62);

  // Wake reads through subtle darkening of the steep slopes — never brightening.
  col *= 1.0 - clamp(length(grad) * 3.0, 0.0, uWakeShade);

  gl_FragColor = vec4(col, 1.0);
}
`

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
/* WebGL ocean (desktop wake renderer) — hidden until a first frame has rendered,
   then it covers the DOM ocean layers above. */
.ap-ocean-gl {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: none;
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

  // ── Scroll fade (CH00-only confinement) ─────────────────────────────────────
  useEffect(() => {
    if (pathname !== '/') return
    const el = ref.current
    if (!el) return

    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight || 1
      // Hold the ocean at full through the whole CH00 beat (until 0.45vh), then fade
      // so it is gone by 1.30vh — before the CH01 divider/statement (~2vh).
      const start = 0.45 * vh
      const end = 1.3 * vh
      const t = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)))
      const s = t * t * (3 - 2 * t)
      el.style.opacity = String(1 - s)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  // ── Desktop WebGL ocean + cursor wake ───────────────────────────────────────
  useEffect(() => {
    if (pathname !== '/') return
    const el = ref.current
    if (!el) return

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return // fallback: DOM/CSS ocean handles it

    const canvas = el.querySelector<HTMLCanvasElement>('.ap-ocean-gl')
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false })
    if (!gl) return // no WebGL → DOM fallback stays visible

    // ── Shader program ──
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('[OceanBackdrop] shader error:', gl.getShaderInfoLog(sh))
        gl.deleteShader(sh)
        return null
      }
      return sh
    }
    const vs = compile(gl.VERTEX_SHADER, VERT_SRC)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[OceanBackdrop] link error:', gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)

    // Fullscreen quad
    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const U = (n: string) => gl.getUniformLocation(prog, n)
    const uOcean = U('uOcean'), uField = U('uField'), uTime = U('uTime')
    const uCanvasAspect = U('uCanvasAspect'), uImageAspect = U('uImageAspect')
    const uVel = U('uVel'), uTexel = U('uTexel')
    gl.uniform1i(uOcean, 0)
    gl.uniform1i(uField, 1)
    gl.uniform1f(uTexel, 1 / FIELD_W)
    gl.uniform1f(U('uDispGrad'), DISP_GRAD)
    gl.uniform1f(U('uDispVel'), DISP_VEL)
    gl.uniform1f(U('uWakeShade'), WAKE_SHADE)

    // ── Disturbance field (offscreen 2D canvas) + soft brush ──
    const field = document.createElement('canvas')
    field.width = FIELD_W; field.height = FIELD_H
    const fctx = field.getContext('2d')!
    fctx.fillStyle = '#000'; fctx.fillRect(0, 0, FIELD_W, FIELD_H)

    const brushR = Math.round(STAMP * FIELD_W)
    const brush = document.createElement('canvas')
    brush.width = brush.height = brushR * 2
    const bctx = brush.getContext('2d')!
    const bg = bctx.createRadialGradient(brushR, brushR, 0, brushR, brushR, brushR)
    bg.addColorStop(0, 'rgba(255,255,255,1)')
    bg.addColorStop(1, 'rgba(255,255,255,0)')
    bctx.fillStyle = bg
    bctx.fillRect(0, 0, brushR * 2, brushR * 2)

    // ── GL textures ──
    const fieldTex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, fieldTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const oceanTex = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, oceanTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    // 1px placeholder until the image loads
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([4, 18, 26, 255]))

    let imageAspect = 1672 / 941
    let ready = false
    const img = new Image()
    img.onload = () => {
      imageAspect = img.naturalWidth / img.naturalHeight
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, oceanTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      ready = true
      canvas.style.display = 'block'
      // Hide the DOM ocean layers — the GL pass now owns the water.
      el.querySelectorAll<HTMLElement>('.ap-ocean-img').forEach((n) => { n.style.display = 'none' })
    }
    img.src = '/media/ch00-ocean.webp'

    // ── Resize ──
    let cssW = 0, cssH = 0
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, RENDER_SCALE_MAX)
      cssW = canvas.clientWidth || window.innerWidth
      cssH = canvas.clientHeight || window.innerHeight
      canvas.width = Math.max(1, Math.round(cssW * scale))
      canvas.height = Math.max(1, Math.round(cssH * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // ── Pointer → field ──
    // px/py: latest cursor in 0..1 (y top-down). lx/ly: last stamped point.
    let px = 0.5, py = 0.5, lx = 0.5, ly = 0.5, hasNew = false, seeded = false
    let vx = 0, vy = 0
    const onPointerMove = (e: PointerEvent) => {
      px = e.clientX / (window.innerWidth || 1)
      py = e.clientY / (window.innerHeight || 1)
      if (!seeded) { lx = px; ly = py; seeded = true }
      hasNew = true
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const stamp = (x: number, y: number, a: number) => {
      fctx.globalAlpha = a
      fctx.drawImage(brush, x * FIELD_W - brushR, y * FIELD_H - brushR, brushR * 2, brushR * 2)
    }

    // ── Render loop ──
    const start = performance.now()
    let praf = 0
    const frame = (now: number) => {
      praf = requestAnimationFrame(frame)
      if (document.hidden) return

      // 1) decay the whole field a little (the wake's tail)
      fctx.globalCompositeOperation = 'source-over'
      fctx.fillStyle = `rgba(0,0,0,${DECAY})`
      fctx.fillRect(0, 0, FIELD_W, FIELD_H)

      // 2) stamp the new cursor segment (interpolated for continuity)
      fctx.globalCompositeOperation = 'lighter'
      if (hasNew) {
        const dx = px - lx, dy = py - ly
        const dist = Math.hypot(dx, dy)
        const intensity = Math.min(0.7, 0.16 + dist * 4.5)
        const steps = Math.max(1, Math.min(24, Math.round(dist * FIELD_W)))
        for (let i = 1; i <= steps; i++) {
          stamp(lx + dx * (i / steps), ly + dy * (i / steps), intensity / steps + 0.04)
        }
        vx = dx; vy = dy
        lx = px; ly = py; hasNew = false
      } else {
        vx *= 0.86; vy *= 0.86
      }
      fctx.globalAlpha = 1

      // 3) skip the GPU draw while scrolled past CH00 (field still decays cheaply)
      const op = parseFloat(el.style.opacity || '1')
      if (!ready || op < 0.01) return

      // 4) upload field + draw
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, fieldTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, field)

      gl.useProgram(prog)
      gl.uniform1f(uTime, (now - start) / 1000)
      gl.uniform1f(uCanvasAspect, cssW / Math.max(1, cssH))
      gl.uniform1f(uImageAspect, imageAspect)
      gl.uniform2f(uVel, vx * 12, vy * 12)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    praf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(praf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(quad)
      gl.deleteTexture(fieldTex)
      gl.deleteTexture(oceanTex)
      const lose = gl.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
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

      {/* DOM ocean (fallback for touch / reduced-motion / no-WebGL; hidden once GL runs) */}
      <div className="ap-ocean-img ap-ocean-b" />
      <div className="ap-ocean-img ap-ocean-a" />
      {/* Desktop WebGL ocean with cursor wake */}
      <canvas className="ap-ocean-gl" />
      {/* Luminance breath — faint cool lift rising and falling on the water */}
      <div className="ap-ocean-lum" />

      {/* Edge vignette — dissolves the frame into abyss (no horizon, keeps it mysterious). */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 82% 78% at 50% 48%, rgba(4,18,26,0) 40%, rgba(4,18,26,0.48) 72%, rgba(4,18,26,0.88) 100%)',
        }}
      />
      {/* Uniform recede + soft centre pool — pushes the ocean behind the particle
          field and keeps the CH00 text legible. */}
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
