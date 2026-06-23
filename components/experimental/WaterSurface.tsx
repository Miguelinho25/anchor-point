'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const SIM_SIZE = 256
const BACKDROP_SIM_SIZE = 192
const MAX_PIXEL_RATIO = 1.5
const BACKDROP_MAX_PIXEL_RATIO = 1
const POINTER_RADIUS = 0.018
const POINTER_STRENGTH = 0.026
const WAVE_SPEED = 0.18
const DAMPING = 0.986
const SPECULAR_STRENGTH = 0.18
const AMBIENT_WAVE_STRENGTH = 0.032
const AMBIENT_WAVE_SPEED = 0.12
const AMBIENT_WAVE_SCALE = 2.05
const AMBIENT_SOURCE_STRENGTH = 0.006
const AMBIENT_RENDER_STRENGTH = 0.018
const AMBIENT_RELIEF_STRENGTH = 0.18
const AMBIENT_SHADOW_STRENGTH = 0.62
const AMBIENT_WAVE_DIRECTION = new THREE.Vector2(-1, 0.12).normalize()
const BACKDROP_AMBIENT_WAVE_STRENGTH = 0.044
const BACKDROP_AMBIENT_WAVE_SPEED = 0.15
const BACKDROP_AMBIENT_WAVE_SCALE = 1.72
const BACKDROP_AMBIENT_SOURCE_STRENGTH = 0.009
const BACKDROP_AMBIENT_RENDER_STRENGTH = 0.03
const BACKDROP_AMBIENT_RELIEF_STRENGTH = 0.32
const BACKDROP_AMBIENT_SHADOW_STRENGTH = 0.74

const LAB_CSS = `
.water-lab {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: var(--white);
  background:
    radial-gradient(ellipse 72% 58% at 50% 42%, rgba(10, 42, 58, 0.48) 0%, rgba(4, 18, 26, 0.92) 72%),
    var(--abyss);
}
.water-lab-mount,
.water-lab-fallback {
  position: fixed;
  inset: 0;
}
.water-lab-mount canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.water-lab-fallback {
  background:
    radial-gradient(ellipse 82% 78% at 50% 48%, rgba(4,18,26,0) 36%, rgba(4,18,26,0.52) 74%, rgba(4,18,26,0.92) 100%),
    linear-gradient(rgba(4,18,26,0.28), rgba(4,18,26,0.34)),
    url(/media/ch00-ocean.webp) center / cover no-repeat;
  transform: scale(1.08);
}
.water-lab--backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  background: transparent;
  pointer-events: none;
}
.water-lab--backdrop .water-lab-mount,
.water-lab--backdrop .water-lab-fallback,
.water-lab--backdrop .water-lab-vignette {
  position: absolute;
}
.water-lab--backdrop .water-lab-vignette {
  display: none;
}
.water-lab-vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 54% 46% at 50% 46%, rgba(4,18,26,0.18) 0%, rgba(4,18,26,0) 62%),
    radial-gradient(ellipse 94% 86% at 50% 50%, rgba(4,18,26,0) 34%, rgba(4,18,26,0.58) 78%, rgba(4,18,26,0.94) 100%),
    linear-gradient(to bottom, rgba(4,18,26,0.72) 0%, rgba(4,18,26,0.08) 34%, rgba(4,18,26,0.36) 100%);
}
.water-lab-panel {
  position: fixed;
  left: clamp(22px, 4vw, 58px);
  bottom: clamp(22px, 5vh, 48px);
  z-index: 3;
  max-width: min(420px, calc(100vw - 44px));
  pointer-events: none;
}
.water-lab-kicker,
.water-lab-status {
  font-family: "Inter", var(--font-ui), system-ui, sans-serif;
  font-size: 0.625rem;
  font-weight: 400;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--haze);
}
.water-lab-kicker {
  margin-bottom: 18px;
}
.water-lab-title {
  font-family: var(--font-display), sans-serif;
  font-size: clamp(1.55rem, 4vw, 3.25rem);
  font-weight: 200;
  letter-spacing: -0.005em;
  line-height: 1.06;
  color: var(--white);
  margin-bottom: 18px;
}
.water-lab-copy {
  font-family: "Inter", var(--font-ui), system-ui, sans-serif;
  font-size: clamp(0.82rem, 1.2vw, 0.98rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.55;
  color: rgba(191, 214, 230, 0.78);
  max-width: 42ch;
}
.water-lab-status {
  position: fixed;
  right: clamp(20px, 4vw, 56px);
  bottom: clamp(20px, 5vh, 48px);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: none;
  color: rgba(90, 134, 166, 0.86);
}
.water-lab-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(191, 214, 230, 0.68);
  box-shadow: 0 0 14px rgba(191, 214, 230, 0.22);
}
.water-lab-fallback-note {
  position: fixed;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  font-family: "Inter", var(--font-ui), system-ui, sans-serif;
  color: rgba(191, 214, 230, 0.76);
  letter-spacing: 0.04em;
  line-height: 1.5;
}
@media (max-width: 720px) {
  .water-lab-status {
    display: none;
  }
}
`

const FULLSCREEN_VERTEX = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const SIM_FRAGMENT = `
precision highp float;

uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec2 uPointer;
uniform float uImpulse;
uniform float uRadius;
uniform float uWaveSpeed;
uniform float uDamping;
uniform float uTime;
uniform float uAmbientStrength;
uniform float uAmbientSpeed;
uniform float uAmbientScale;
uniform float uAmbientSourceStrength;
uniform float uStartupFade;
uniform vec2 uAmbientDirection;

varying vec2 vUv;

vec2 safeUv(vec2 uv) {
  return clamp(uv, uTexel * 0.5, 1.0 - uTexel * 0.5);
}

void main() {
  vec4 state = texture2D(uState, safeUv(vUv));
  float h = state.r;
  float v = state.g;

  float hL = texture2D(uState, safeUv(vUv - vec2(uTexel.x, 0.0))).r;
  float hR = texture2D(uState, safeUv(vUv + vec2(uTexel.x, 0.0))).r;
  float hD = texture2D(uState, safeUv(vUv - vec2(0.0, uTexel.y))).r;
  float hU = texture2D(uState, safeUv(vUv + vec2(0.0, uTexel.y))).r;

  float laplacian = (hL + hR + hD + hU - 4.0 * h);
  v += laplacian * uWaveSpeed;

  vec2 ambientDirA = normalize(uAmbientDirection);
  vec2 ambientDirB = normalize(vec2(-0.70, -0.24));
  float phaseA = (dot(vUv, ambientDirA) * uAmbientScale - uTime * uAmbientSpeed) * 6.28318530718;
  float phaseB = (dot(vUv, ambientDirB) * uAmbientScale * 0.52 - uTime * uAmbientSpeed * 0.58 + 0.38) * 6.28318530718;
  float broadSwell = sin(phaseA) * 0.68 + sin(phaseB + 1.7) * 0.32;
  float edgeMask =
    smoothstep(0.02, 0.16, vUv.x) *
    smoothstep(0.02, 0.16, vUv.y) *
    smoothstep(0.02, 0.16, 1.0 - vUv.x) *
    smoothstep(0.02, 0.16, 1.0 - vUv.y);
  float startup = smoothstep(0.0, 1.0, uStartupFade);
  v += ((broadSwell * uAmbientStrength) - h) * uAmbientSourceStrength * edgeMask * startup;

  if (uImpulse > 0.0) {
    float d = distance(vUv, uPointer);
    float disturbance = exp(-(d * d) / max(0.00001, uRadius * uRadius));
    v += disturbance * uImpulse;
  }

  v *= uDamping;
  h += v;
  h *= 0.997;

  gl_FragColor = vec4(h, v, 0.0, 1.0);
}
`

const RENDER_FRAGMENT = `
precision highp float;

uniform sampler2D uState;
uniform sampler2D uBase;
uniform vec2 uTexel;
uniform float uTime;
uniform float uSpecular;
uniform float uAmbientStrength;
uniform float uAmbientSpeed;
uniform float uAmbientScale;
uniform float uAmbientReliefStrength;
uniform float uAmbientShadowStrength;
uniform float uStartupFade;
uniform vec2 uAmbientDirection;

varying vec2 vUv;

vec3 abyss = vec3(0.0157, 0.0706, 0.1020);
vec3 deep = vec3(0.0392, 0.1647, 0.2275);
vec3 haze = vec3(0.3529, 0.5255, 0.6510);
vec3 ice = vec3(0.7490, 0.8392, 0.9020);

vec2 safeUv(vec2 uv) {
  return clamp(uv, uTexel * 0.5, 1.0 - uTexel * 0.5);
}

void main() {
  float hL = texture2D(uState, safeUv(vUv - vec2(uTexel.x, 0.0))).r;
  float hR = texture2D(uState, safeUv(vUv + vec2(uTexel.x, 0.0))).r;
  float hD = texture2D(uState, safeUv(vUv - vec2(0.0, uTexel.y))).r;
  float hU = texture2D(uState, safeUv(vUv + vec2(0.0, uTexel.y))).r;
  vec2 grad = vec2(hR - hL, hU - hD);
  float startup = smoothstep(0.0, 1.0, uStartupFade);
  float ambientStrength = uAmbientStrength * startup;
  float reliefStrength = uAmbientReliefStrength * startup;
  float shadowStrength = uAmbientShadowStrength * startup;

  vec2 ambientDirA = normalize(uAmbientDirection);
  vec2 ambientDirB = normalize(vec2(-0.72, -0.22));
  float phaseA = (dot(vUv, ambientDirA) * uAmbientScale - uTime * uAmbientSpeed) * 6.28318530718;
  float phaseB = (dot(vUv, ambientDirB) * uAmbientScale * 0.58 - uTime * uAmbientSpeed * 0.63 + 0.31) * 6.28318530718;
  float waveA = sin(phaseA);
  float waveB = sin(phaseB + 1.7);
  vec2 ambientGrad =
    ambientDirA * cos(phaseA) * ambientStrength +
    ambientDirB * cos(phaseB + 1.7) * ambientStrength * 0.46;
  vec2 ambientDrift =
    ambientDirA * waveA * ambientStrength * 0.72 +
    ambientDirB * waveB * ambientStrength * 0.34;
  float ambientShadow = smoothstep(0.18, 0.92, 0.5 + 0.5 * (waveA * 0.62 + waveB * 0.38));
  vec2 waterGrad = grad + ambientGrad;

  vec2 slowDrift = vec2(sin(uTime * 0.032), cos(uTime * 0.027)) * 0.003;
  vec2 distortedUv = safeUv(vUv + waterGrad * 0.034 + ambientDrift + slowDrift);
  vec3 base = texture2D(uBase, distortedUv).rgb;
  base = mix(abyss, base * 0.24 + deep * 0.14, 0.52);

  vec3 normal = normalize(vec3(-waterGrad.x * 34.0, 1.0, -waterGrad.y * 34.0));
  vec3 lightDir = normalize(vec3(-0.28, 0.62, 0.73));
  float light = max(dot(normal, lightDir), 0.0);
  float slope = length(waterGrad) * 20.0;
  float ridge = smoothstep(0.04, 0.24, slope);
  float spec = pow(light, 10.0) * ridge * uSpecular;
  float fresnel = pow(max(0.0, 1.0 - normal.y), 1.5) * 0.14;
  float breath = 0.5 + 0.5 * sin(uTime * 0.18);

  vec2 centre = vUv - vec2(0.5);
  float vignette = smoothstep(0.34, 0.83, length(centre * vec2(1.0, 1.08)));
  float centrePool = 1.0 - smoothstep(0.0, 0.52, length(centre * vec2(1.15, 1.0)));
  float fieldMask = 1.0 - vignette * 0.74;
  float reliefField = 0.5 + 0.5 * (waveA * 0.62 + waveB * 0.38);
  float broadCrest = smoothstep(0.52, 0.88, reliefField);
  float broadTrough = smoothstep(0.54, 0.90, 1.0 - reliefField);

  vec3 colour = base;
  colour += ice * spec;
  colour += haze * fresnel * 0.16;
  colour += haze * breath * centrePool * 0.025;
  colour += deep * broadCrest * reliefStrength * fieldMask;
  colour = mix(colour, abyss * 0.78, broadTrough * shadowStrength * 0.22 * fieldMask);
  colour = mix(colour, colour * 0.78, ambientShadow * shadowStrength * 0.55);
  colour = mix(colour, abyss * 0.75, vignette * 0.82);
  colour = mix(colour, colour * 0.72, centrePool * 0.16);

  float currentPhase = (vUv.y * 7.5 + vUv.x * 1.15 - uTime * uAmbientSpeed * 1.8) * 6.28318530718;
  float currentBand = smoothstep(0.58, 0.96, 0.5 + 0.5 * sin(currentPhase + waveA * 0.55));
  float readableMask = fieldMask * (0.48 + centrePool * 0.52);
  colour += deep * currentBand * reliefStrength * 0.5 * readableMask;
  colour = mix(colour, abyss * 0.76, broadTrough * shadowStrength * 0.08 * readableMask);

  gl_FragColor = vec4(colour, 1.0);
}
`

function isHalfFloatSupported(gl: WebGL2RenderingContext) {
  return Boolean(gl.getExtension('EXT_color_buffer_float'))
}

function createRenderTarget(size: number) {
  return new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  })
}

type WaterSurfaceProps = {
  mode?: 'lab' | 'backdrop'
}

export default function WaterSurface({ mode = 'lab' }: WaterSurfaceProps) {
  const isLab = mode === 'lab'
  const simSize = isLab ? SIM_SIZE : BACKDROP_SIM_SIZE
  const maxPixelRatio = isLab ? MAX_PIXEL_RATIO : BACKDROP_MAX_PIXEL_RATIO
  const ambientWaveStrength = isLab ? AMBIENT_WAVE_STRENGTH : BACKDROP_AMBIENT_WAVE_STRENGTH
  const ambientWaveSpeed = isLab ? AMBIENT_WAVE_SPEED : BACKDROP_AMBIENT_WAVE_SPEED
  const ambientWaveScale = isLab ? AMBIENT_WAVE_SCALE : BACKDROP_AMBIENT_WAVE_SCALE
  const ambientSourceStrength = isLab ? AMBIENT_SOURCE_STRENGTH : BACKDROP_AMBIENT_SOURCE_STRENGTH
  const ambientRenderStrength = isLab ? AMBIENT_RENDER_STRENGTH : BACKDROP_AMBIENT_RENDER_STRENGTH
  const ambientReliefStrength = isLab ? AMBIENT_RELIEF_STRENGTH : BACKDROP_AMBIENT_RELIEF_STRENGTH
  const ambientShadowStrength = isLab ? AMBIENT_SHADOW_STRENGTH : BACKDROP_AMBIENT_SHADOW_STRENGTH
  const startupDuration = isLab ? 1400 : 1050
  const mountRef = useRef<HTMLDivElement>(null)
  const fpsRef = useRef<HTMLSpanElement>(null)
  const [fallback, setFallback] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches

    if (reduceMotion) {
      setFallback(isLab ? 'Reduced motion is enabled. Showing the accepted static ocean base.' : 'Reduced motion is enabled.')
      return
    }
    if (!finePointer) {
      setFallback(isLab ? 'Pointer interaction is disabled on this device. Showing the accepted static ocean base.' : 'Pointer interaction is disabled.')
      return
    }

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    })

    if (!gl || !isHalfFloatSupported(gl)) {
      setFallback('This browser/GPU does not expose the half-float render targets needed for the water lab.')
      return
    }

    let disposed = false
    let raf = 0
    let started = false
    let startTime = 0
    let sourceTarget = createRenderTarget(simSize)
    let destinationTarget = createRenderTarget(simSize)
    const pointer = new THREE.Vector2(0.5, 0.5)
    const nextPointer = new THREE.Vector2(0.5, 0.5)
    let hasPointer = false
    let lastMove = 0
    let pendingImpulse = 0
    let frames = 0
    let fpsLast = performance.now()
    let baseTexture: THREE.Texture | null = null

    const renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x04121a, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio))
    renderer.domElement.style.opacity = '0'
    renderer.domElement.style.transition = isLab ? 'opacity 520ms ease' : 'opacity 300ms ease'
    mount.appendChild(renderer.domElement)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const quadGeometry = new THREE.PlaneGeometry(2, 2)
    const simScene = new THREE.Scene()
    const renderScene = new THREE.Scene()
    const texel = new THREE.Vector2(1 / simSize, 1 / simSize)

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: SIM_FRAGMENT,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uState: { value: sourceTarget.texture },
        uTexel: { value: texel },
        uPointer: { value: pointer },
        uImpulse: { value: 0 },
        uRadius: { value: POINTER_RADIUS },
        uWaveSpeed: { value: WAVE_SPEED },
        uDamping: { value: DAMPING },
        uTime: { value: 0 },
        uAmbientStrength: { value: ambientWaveStrength },
        uAmbientSpeed: { value: ambientWaveSpeed },
        uAmbientScale: { value: ambientWaveScale },
        uAmbientSourceStrength: { value: ambientSourceStrength },
        uStartupFade: { value: 0 },
        uAmbientDirection: { value: AMBIENT_WAVE_DIRECTION },
      },
    })

    const renderMaterial = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: RENDER_FRAGMENT,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uState: { value: sourceTarget.texture },
        uBase: { value: null },
        uTexel: { value: texel },
        uTime: { value: 0 },
        uSpecular: { value: SPECULAR_STRENGTH },
        uAmbientStrength: { value: ambientRenderStrength },
        uAmbientSpeed: { value: ambientWaveSpeed },
        uAmbientScale: { value: ambientWaveScale },
        uAmbientReliefStrength: { value: ambientReliefStrength },
        uAmbientShadowStrength: { value: ambientShadowStrength },
        uStartupFade: { value: 0 },
        uAmbientDirection: { value: AMBIENT_WAVE_DIRECTION },
      },
    })

    simScene.add(new THREE.Mesh(quadGeometry, simMaterial))
    renderScene.add(new THREE.Mesh(quadGeometry, renderMaterial))

    const clearSimulationTargets = () => {
      const clearColour = new THREE.Color()
      renderer.getClearColor(clearColour)
      const clearAlpha = renderer.getClearAlpha()

      renderer.setClearColor(0x000000, 0)
      renderer.setRenderTarget(sourceTarget)
      renderer.clear(true, false, false)
      renderer.setRenderTarget(destinationTarget)
      renderer.clear(true, false, false)
      renderer.setRenderTarget(null)
      renderer.setClearColor(clearColour, clearAlpha)
    }

    clearSimulationTargets()

    const resize = () => {
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio))
      renderer.setSize(width, height, false)
    }

    const swapTargets = () => {
      const temp = sourceTarget
      sourceTarget = destinationTarget
      destinationTarget = temp
    }

    const injectPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      nextPointer.set(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
      )

      const now = performance.now()
      const dt = Math.max(16, now - (lastMove || now))
      const distance = pointer.distanceTo(nextPointer)
      const speed = distance / (dt / 1000)

      if (!hasPointer) {
        pointer.copy(nextPointer)
        hasPointer = true
        lastMove = now
        pendingImpulse = 0
        return
      }

      pointer.copy(nextPointer)
      lastMove = now
      if (distance > 0.0015) {
        pendingImpulse = Math.max(pendingImpulse, Math.min(0.032, 0.005 + speed * POINTER_STRENGTH))
      }
    }

    const timer = new THREE.Timer()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      timer.update()

      const now = performance.now()
      const elapsed = timer.getElapsed()
      const startupFade = Math.min(1, (now - startTime) / startupDuration)
      const impulseAge = now - lastMove
      const impulse = impulseAge < 120 ? pendingImpulse : 0
      pendingImpulse *= 0.62

      for (let i = 0; i < 2; i++) {
        simMaterial.uniforms.uState.value = sourceTarget.texture
        simMaterial.uniforms.uPointer.value = pointer
        simMaterial.uniforms.uImpulse.value = i === 0 ? impulse : 0
        simMaterial.uniforms.uTime.value = elapsed
        simMaterial.uniforms.uStartupFade.value = startupFade
        renderer.setRenderTarget(destinationTarget)
        renderer.render(simScene, camera)
        swapTargets()
      }

      renderMaterial.uniforms.uState.value = sourceTarget.texture
      renderMaterial.uniforms.uTime.value = elapsed
      renderMaterial.uniforms.uStartupFade.value = startupFade
      renderer.setRenderTarget(null)
      renderer.render(renderScene, camera)

      frames += 1
      if (now - fpsLast > 700) {
        if (fpsRef.current) {
          fpsRef.current.textContent = `${Math.round((frames * 1000) / (now - fpsLast))} FPS`
        }
        frames = 0
        fpsLast = now
      }
    }

    const start = () => {
      if (started || disposed) return

      started = true
      startTime = performance.now()
      fpsLast = startTime
      frames = 0
      clearSimulationTargets()
      resize()
      window.addEventListener('resize', resize)
      if (isLab) {
        renderer.domElement.addEventListener('pointermove', injectPointer, { passive: true })
      } else {
        window.addEventListener('pointermove', injectPointer, { passive: true })
      }
      animate()

      requestAnimationFrame(() => {
        if (disposed) return
        renderer.domElement.style.opacity = '1'
        setReady(true)
      })
    }

    const textureLoader = new THREE.TextureLoader()
    baseTexture = textureLoader.load(
      '/media/ch00-ocean.webp',
      () => {
        if (!disposed) start()
      },
      undefined,
      () => {
        if (!disposed) setFallback('The CH00 ocean texture could not be loaded. Falling back to the static base.')
      },
    )
    baseTexture.colorSpace = THREE.SRGBColorSpace
    baseTexture.wrapS = THREE.ClampToEdgeWrapping
    baseTexture.wrapT = THREE.ClampToEdgeWrapping
    baseTexture.minFilter = THREE.LinearFilter
    baseTexture.magFilter = THREE.LinearFilter
    renderMaterial.uniforms.uBase.value = baseTexture

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      if (started) {
        window.removeEventListener('resize', resize)
        if (isLab) {
          renderer.domElement.removeEventListener('pointermove', injectPointer)
        } else {
          window.removeEventListener('pointermove', injectPointer)
        }
      }
      sourceTarget.dispose()
      destinationTarget.dispose()
      quadGeometry.dispose()
      simMaterial.dispose()
      renderMaterial.dispose()
      baseTexture?.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  const className = isLab ? 'water-lab' : 'water-lab water-lab--backdrop'

  return (
    <section className={className} aria-label={isLab ? 'Internal dark-water interaction experiment' : 'CH00 dark-water surface'}>
      <style dangerouslySetInnerHTML={{ __html: LAB_CSS }} />
      {fallback ? <div className="water-lab-fallback" /> : null}
      <div ref={mountRef} className="water-lab-mount" aria-hidden />
      <div className="water-lab-vignette" aria-hidden />

      {isLab && fallback ? (
        <div className="water-lab-fallback-note">{fallback}</div>
      ) : isLab ? (
        <>
          <div className="water-lab-panel">
            <div className="water-lab-kicker">Internal water lab</div>
            <h1 className="water-lab-title">Dark surface physics.</h1>
            <p className="water-lab-copy">
              Move across the water. This isolated prototype tests whether local heightfield
              disturbance can feel physical, restrained, and premium enough for Anchor Point.
            </p>
          </div>

          <div className="water-lab-status">
            <span className="water-lab-dot" />
            <span>{ready ? 'Heightfield active' : 'Preparing surface'}</span>
            <span ref={fpsRef}>-- FPS</span>
          </div>
        </>
      ) : null}
    </section>
  )
}
