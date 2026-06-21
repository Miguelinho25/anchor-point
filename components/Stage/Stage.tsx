'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { scrollStore } from '@/lib/scrollStore'

// ─── Shipping lane definitions (XZ plane, camera above) ───────────────────
// Simplified major global routes. CatmullRom will smooth these into curves.
const ROUTE_DEFS = [
  // Trans-Pacific (Asia → North America)
  [[-12, 0, 1.5], [-6, 0, 0.5], [0, 0, -0.5], [6, 0, 0], [12, 0, 1.5]],
  // Asia–Europe via Suez
  [[12, 0, -2], [6, 0, -1], [2, 0, 0], [-2, 0, 1], [-7, 0, 0], [-12, 0, -1]],
  // North Atlantic (Europe → North America)
  [[-1, 0, 3.5], [-4, 0, 2], [-7, 0, 0.5], [-10, 0, -0.5], [-12, 0, -1]],
  // Indian Ocean / Cape of Good Hope
  [[10, 0, 3], [5, 0, 5], [0, 0, 5.5], [-4, 0, 4], [-8, 0, 1.5]],
  // Intra-Asia short loop
  [[8, 0, -3.5], [10, 0, -1.5], [11, 0, 0.5]],
  // Americas east coast
  [[-7, 0, -2.5], [-8.5, 0, 0], [-7.5, 0, 3]],
]

const VESSEL_COUNT = 1800
const VESSELS_PER_ROUTE = Math.floor(VESSEL_COUNT / ROUTE_DEFS.length)

// ─── Shaders ──────────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
  attribute vec3 aTarget;
  attribute float aRandom;
  uniform float uProgress;
  uniform float uTime;

  varying vec2 vWorldXZ;

  // Spatially-coherent ocean flow — nearby vessels share drift direction,
  // creating the feel of ocean currents rather than independent random motion.
  // Three layers mirror gyre / eddy / local turbulence scales.
  vec2 oceanFlow(vec2 p, float t, float seed) {
    float a1 = p.x * 0.06 + p.y * 0.04 + t * 0.04;
    vec2 l1 = vec2(cos(a1), sin(a1)) * 1.2;

    float eddy = sin(p.x * 0.18 + t * 0.07) * cos(p.y * 0.22 + t * 0.055);
    vec2 l2 = vec2(-sin(eddy * 2.4), cos(eddy * 2.4)) * 0.7;

    float turb = sin(p.x * 0.35 + p.y * 0.28 + t * 0.13 + seed * 6.2832);
    vec2 l3 = vec2(cos(turb), sin(turb * 1.3)) * 0.4;

    return l1 + l2 + l3;
  }

  void main() {
    float driftStrength = 1.0 - smoothstep(0.0, 0.6, uProgress);
    vec2 flow = oceanFlow(position.xz, uTime, aRandom) * driftStrength * 1.6;
    vec3 driftedPos = position + vec3(flow.x, 0.0, flow.y);

    // Each vessel breathes at its own rate during chaos
    float breathe = sin(uTime * (0.6 + aRandom * 0.5) + aRandom * 6.2832) * 0.5 + 0.5;

    // Snap starts late (38%) so chaos fully plays; smootherstep gives faster final lock
    float snapT = smoothstep(0.38, 0.98, uProgress);
    float snap = snapT * snapT * (3.0 - 2.0 * snapT);
    vec3 finalPos = mix(driftedPos, aTarget, snap);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float baseSize = 1.5 + aRandom * 1.4;
    gl_PointSize = mix(
      baseSize + breathe * (1.0 - snap) * 1.0,
      baseSize + 3.0,
      snap
    );

    vWorldXZ = finalPos.xz;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uProgress;
  uniform float uCh02Progress;
  uniform float uCh04Progress;
  uniform float uCh04Peak;
  uniform float uTime;
  varying vec2 vWorldXZ;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.12, 0.5, d);

    float edgeDist = length(vWorldXZ) / 15.0;
    float fog = 1.0 - smoothstep(0.22, 1.05, edgeDist);

    vec3 steel  = vec3(0.176, 0.384, 0.549);
    vec3 signal = vec3(0.094, 0.878, 1.0);
    float t = smoothstep(0.4, 1.0, uProgress);
    vec3 col = mix(steel, signal, t);
    col += col * t * 0.55;

    // CH04: dual radial scan waves — outward read + inward data return
    float dist    = length(vWorldXZ);
    float scanOut = mod(uTime * 0.20, 9.5);
    float glowOut = exp(-(dist - scanOut) * (dist - scanOut) * 1.8) * 0.45;
    float scanIn  = 8.5 - mod(uTime * 0.14, 8.5);
    float glowIn  = exp(-(dist - scanIn)  * (dist - scanIn)  * 2.5) * 0.28;
    col += signal * (glowOut + glowIn) * uCh04Progress * (1.0 + uCh04Peak * 0.9);

    // CH04: ghost floor rises as AI processes more of the maritime world (0.04 → 0.12)
    float crowdFloor = 0.04 + uCh04Progress * 0.08;
    float crowdFade = clamp(1.0 - smoothstep(0.0, 0.28, uCh02Progress), crowdFloor, 1.0);

    gl_FragColor = vec4(col, alpha * fog * (0.42 + t * 0.52) * crowdFade);
  }
`

// ─── Component ────────────────────────────────────────────────────────────
export default function Stage() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0) // transparent — CSS holds the bg colour
    mount.appendChild(renderer.domElement)

    // ── Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    )
    // Slightly angled top-down: cinematic, not sterile
    camera.position.set(0, 14, 7)
    camera.lookAt(0, 0, 0)

    // ── Build route curves
    const curves = ROUTE_DEFS.map(
      (pts) =>
        new THREE.CatmullRomCurve3(
          pts.map(([x, y, z]) => new THREE.Vector3(x, y, z))
        )
    )

    // ── Vessel geometry: chaos positions + route targets + per-vessel seed
    const chaosArr  = new Float32Array(VESSEL_COUNT * 3)
    const targetArr = new Float32Array(VESSEL_COUNT * 3)
    const randomArr = new Float32Array(VESSEL_COUNT)

    let idx = 0
    curves.forEach((curve) => {
      const pts = curve.getPoints(VESSELS_PER_ROUTE)
      pts.forEach((pt) => {
        if (idx >= VESSEL_COUNT) return
        chaosArr[idx * 3]     = (Math.random() - 0.5) * 26
        chaosArr[idx * 3 + 1] = 0
        chaosArr[idx * 3 + 2] = (Math.random() - 0.5) * 16
        targetArr[idx * 3]     = pt.x
        targetArr[idx * 3 + 1] = pt.y
        targetArr[idx * 3 + 2] = pt.z
        randomArr[idx]          = Math.random()
        idx++
      })
    })

    const vesselGeo = new THREE.BufferGeometry()
    vesselGeo.setAttribute('position', new THREE.BufferAttribute(chaosArr, 3))
    vesselGeo.setAttribute('aTarget',  new THREE.BufferAttribute(targetArr, 3))
    vesselGeo.setAttribute('aRandom',  new THREE.BufferAttribute(randomArr, 1))

    const vesselMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress:     { value: 0 },
        uTime:         { value: 0 },
        uCh02Progress: { value: 0 },
        uCh04Progress: { value: 0 },
        uCh04Peak:     { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    })

    const vessels = new THREE.Points(vesselGeo, vesselMat)
    scene.add(vessels)

    // ── Route lines — drawn progressively from start point (routes revealed, not snapped)
    const ROUTE_PTS = 200
    const routeLines: THREE.Line[] = []
    // Per-line buffers for CH04 live recalculation: pristine base positions +
    // in-plane normals (XZ) so we can bend each route sideways without losing its shape.
    const routeBasePos: Float32Array[] = []
    const routeNormals: Float32Array[] = []  // (nx, nz) per vertex
    curves.forEach((curve) => {
      const pts = curve.getPoints(ROUTE_PTS)
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      geo.setDrawRange(0, 0)

      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
      routeBasePos.push(Float32Array.from(posAttr.array as Float32Array))

      // Per-vertex in-plane normal = perpendicular of local tangent (next - prev)
      const n = pts.length
      const normals = new Float32Array(n * 2)
      for (let i = 0; i < n; i++) {
        const prev = pts[Math.max(0, i - 1)]
        const next = pts[Math.min(n - 1, i + 1)]
        let tx = next.x - prev.x
        let tz = next.z - prev.z
        const len = Math.hypot(tx, tz) || 1
        tx /= len; tz /= len
        normals[i * 2]     = -tz   // rotate tangent 90° in XZ plane
        normals[i * 2 + 1] =  tx
      }
      routeNormals.push(normals)

      // Vertex colours (white base → material.color shows normally; scan boosts toward white)
      geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3))

      const mat = new THREE.LineBasicMaterial({
        color: 0x18e0ff,
        transparent: true,
        opacity: 0,
        vertexColors: true,
      })
      const line = new THREE.Line(geo, mat)
      scene.add(line)
      routeLines.push(line)
    })

    // ── CH02: hero vessel (glowing focal point at scene centre)
    const heroCanvas = document.createElement('canvas')
    heroCanvas.width = 64; heroCanvas.height = 64
    const hctx = heroCanvas.getContext('2d')!
    const grad = hctx.createRadialGradient(32, 32, 1, 32, 32, 32)
    grad.addColorStop(0,   'rgba(24,224,255,1.0)')
    grad.addColorStop(0.2, 'rgba(24,224,255,0.8)')
    grad.addColorStop(0.5, 'rgba(24,224,255,0.2)')
    grad.addColorStop(1.0, 'rgba(24,224,255,0.0)')
    hctx.fillStyle = grad
    hctx.beginPath(); hctx.arc(32, 32, 32, 0, Math.PI * 2); hctx.fill()

    const heroTex = new THREE.CanvasTexture(heroCanvas)
    const heroGeo = new THREE.BufferGeometry()
    heroGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3))
    const heroMat = new THREE.PointsMaterial({
      map: heroTex,
      size: 96,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const hero = new THREE.Points(heroGeo, heroMat)
    scene.add(hero)

    // ── CH02: pulse rings around hero
    function makeRing(radius: number) {
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 80; i++) {
        const a = (i / 80) * Math.PI * 2
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      const mat = new THREE.LineBasicMaterial({ color: 0x18e0ff, transparent: true, opacity: 0 })
      return new THREE.Line(geo, mat)
    }
    const ring1 = makeRing(0.55)
    const ring2 = makeRing(1.05)
    scene.add(ring1); scene.add(ring2)

    // ── CH04: sonar pulse rings — expand outward as AI scans the maritime field
    const sonarRings: THREE.Line[] = [0, 1, 2].map(() => makeRing(1))
    sonarRings.forEach(r => scene.add(r))

    // ── CH04: scanner arc — short bright arc orbiting the hero vessel
    const scanPts: THREE.Vector3[] = []
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 2 * 0.14
      scanPts.push(new THREE.Vector3(Math.cos(a) * 1.62, 0, Math.sin(a) * 1.62))
    }
    const scanArcGeo = new THREE.BufferGeometry().setFromPoints(scanPts)
    const scanArcMat = new THREE.LineBasicMaterial({ color: 0x18e0ff, transparent: true, opacity: 0 })
    const scanArc = new THREE.Line(scanArcGeo, scanArcMat)
    scene.add(scanArc)

    // ── RAF loop (THREE.Timer replaces deprecated THREE.Clock in r184+)
    const timer = new THREE.Timer()
    let rafId: number
    let routeDeformed = false  // tracks whether route geometry is currently bent (CH04)

    function animate() {
      rafId = requestAnimationFrame(animate)
      timer.update()

      const elapsed   = timer.getElapsed()
      const progress  = scrollStore.progress
      const ch02p     = scrollStore.ch02Progress
      const ch03p     = scrollStore.ch03Progress
      const ch04p     = scrollStore.ch04Progress
      // Peak activation — bell over mid/end of CH04 (same curve as page.tsx DOM layer).
      // The intelligence layer briefly reaches full processing state, then settles.
      const ch04peak  = Math.sin(Math.max(0, Math.min(1, (ch04p - 0.40) / 0.50)) * Math.PI)

      vesselMat.uniforms.uTime.value         = elapsed
      vesselMat.uniforms.uProgress.value     = progress
      vesselMat.uniforms.uCh02Progress.value = ch02p
      vesselMat.uniforms.uCh04Progress.value = ch04p
      vesselMat.uniforms.uCh04Peak.value     = ch04peak

      // CH01: route lines draw in, fade through CH02, ghost back in CH03.
      // CH04: AI actively recalculates — routes bend between fixed ports, and
      // segments brighten as the scan wave (same formula as the vessel field) sweeps through.
      const lineProgress = Math.max(0, (progress - 0.28) / 0.72)
      const lineFade     = Math.max(0, 1 - ch02p * 2.5) + ch03p * 0.10
      const aiActive     = ch04p > 0.001
      // Radial scan fronts — identical to the vessel fragment shader so field + routes sync
      const scanOut = (elapsed * 0.20) % 9.5
      const scanIn  = 8.5 - ((elapsed * 0.14) % 8.5)

      routeLines.forEach((line, li) => {
        const baseRange  = Math.max(2, Math.floor((ROUTE_PTS + 1) * lineProgress))
        const scanOffset = aiActive
          ? Math.floor(Math.sin(elapsed * 0.35 + li * 1.73) * 4 * ch04p)
          : 0
        line.geometry.setDrawRange(0, Math.max(2, baseRange + scanOffset))
        const aiGlow = ch04p * (0.06 + Math.sin(elapsed * 0.55 + li * 2.09) * 0.025) + ch04peak * 0.05
        ;(line.material as THREE.LineBasicMaterial).opacity =
          Math.min(lineProgress * 1.4, 0.8) * lineFade + aiGlow

        const geom = line.geometry
        const posA = geom.getAttribute('position') as THREE.BufferAttribute
        const colA = geom.getAttribute('color') as THREE.BufferAttribute
        const base = routeBasePos[li]
        const norm = routeNormals[li]
        const vCount = posA.count

        if (aiActive) {
          // Two low-frequency bend layers per line, each at its own rate/phase →
          // routes feel re-optimised, not jittered. sin(u·π) window pins both ports.
          const amp = 0.24 * ch04p * (1 + ch04peak * 0.45)
          const ph  = elapsed * (0.13 + li * 0.017)
          for (let i = 0; i < vCount; i++) {
            const u   = i / (vCount - 1)
            const win = Math.sin(u * Math.PI)
            const bend =
              Math.sin(u * Math.PI * (1.4 + li * 0.5) + ph + li * 1.7) * 0.62 +
              Math.sin(u * Math.PI * (2.7 + li * 0.3) + ph * 1.3 + li * 0.9) * 0.30
            const disp = bend * win * amp
            const bx = base[i * 3], bz = base[i * 3 + 2]
            posA.setXYZ(i, bx + norm[i * 2] * disp, base[i * 3 + 1], bz + norm[i * 2 + 1] * disp)

            // Scan-wave segment brightness — vertices on the wavefront brighten toward white
            const d  = Math.hypot(bx, bz)
            const go = Math.exp(-(d - scanOut) * (d - scanOut) * 1.8) * 0.45
            const gi = Math.exp(-(d - scanIn)  * (d - scanIn)  * 2.5) * 0.28
            const c  = 1 + (go + gi) * ch04p * (1.6 + ch04peak * 0.9)
            colA.setXYZ(i, c, c, c)
          }
          posA.needsUpdate = true
          colA.needsUpdate = true
          routeDeformed = true
        } else if (routeDeformed) {
          // Leaving CH04 (scrolling up): restore pristine geometry + colours once
          for (let i = 0; i < vCount; i++) {
            posA.setXYZ(i, base[i * 3], base[i * 3 + 1], base[i * 3 + 2])
            colA.setXYZ(i, 1, 1, 1)
          }
          posA.needsUpdate = true
          colA.needsUpdate = true
        }
      })
      if (!aiActive) routeDeformed = false

      // Hero vessel: pulse slows and steadies as system locks into operation
      const pulseHz   = 1.6 * (1 - ch03p * 0.52)
      const pulseAmp  = 0.06 - ch03p * 0.03
      const heroPulse = Math.sin(elapsed * pulseHz) * pulseAmp + (1 - pulseAmp)
      heroMat.opacity = Math.min(1, ch02p * 5) * heroPulse
      heroMat.size    = 90 + ch02p * 60 + Math.sin(elapsed * 0.8) * 4 * ch04p
      heroMat.needsUpdate = true

      // Inner ring: scanner rotation starts in CH04 — system actively interpreting
      const pulse1 = Math.sin(elapsed * (1.4 - ch03p * 0.5)) * 0.5 + 0.5
      ring1.rotation.y = elapsed * 0.22 * ch04p
      ;(ring1.material as THREE.LineBasicMaterial).opacity =
        (ch02p * (0.85 - ch03p * 0.18) + ch04p * 0.08 + ch04peak * 0.05) * (0.40 + pulse1 * 0.60)
      ring1.scale.setScalar((1 + pulse1 * 0.06 * ch02p) * (1 + ch03p * 0.20))

      // Outer ring: expands further in CH04 as AI maps the wider maritime field
      const pulse2 = Math.sin(elapsed * (0.75 - ch03p * 0.25) + 1.2) * 0.5 + 0.5
      ;(ring2.material as THREE.LineBasicMaterial).opacity =
        (ch02p * (0.48 - ch03p * 0.10) + ch04p * 0.14 + ch04peak * 0.06) * (0.25 + pulse2 * 0.75)
      ring2.scale.setScalar(
        (1 + pulse2 * 0.10 * ch02p + ch02p * 0.06) * (1 + ch03p * 0.32 + ch04p * 0.18)
      )

      // CH04: sonar pulse rings expand from vessel core — AI reads the maritime field
      const sonarPeriod = 3.5
      sonarRings.forEach((ring, i) => {
        const phase = i / 3
        const st = ((elapsed / sonarPeriod + phase) % 1)
        ring.scale.setScalar(0.2 + st * 7.5)
        const fade = (1 - st) * (1 - st)
        ;(ring.material as THREE.LineBasicMaterial).opacity = fade * ch04p * (0.24 + ch04peak * 0.12)
      })

      // CH04: scanner arc orbits hero vessel — active inference loop (faster sweep at peak)
      scanArcMat.opacity = ch04p * (0.52 + Math.sin(elapsed * 1.9) * 0.14) * (1 + ch04peak * 0.35)
      scanArc.rotation.y = elapsed * (0.90 + ch04peak * 0.45)

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup
    return () => {
      cancelAnimationFrame(rafId)
      timer.dispose()
      window.removeEventListener('resize', onResize)
      vesselGeo.dispose()
      vesselMat.dispose()
      routeLines.forEach((l) => {
        l.geometry.dispose()
        ;(l.material as THREE.LineBasicMaterial).dispose()
      })
      heroGeo.dispose(); heroMat.dispose(); heroTex.dispose()
      ;[ring1, ring2, ...sonarRings].forEach((r) => {
        r.geometry.dispose()
        ;(r.material as THREE.LineBasicMaterial).dispose()
      })
      scanArcGeo.dispose()
      scanArcMat.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
