'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const SIM_SIZE = 256
const MAX_PIXEL_RATIO = 1.5
const POINTER_RADIUS = 0.018
const POINTER_STRENGTH = 0.026
const WAVE_SPEED = 0.18
const DAMPING = 0.986
const SPECULAR_STRENGTH = 0.18

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

varying vec2 vUv;

void main() {
  vec4 state = texture2D(uState, vUv);
  float h = state.r;
  float v = state.g;

  float hL = texture2D(uState, vUv - vec2(uTexel.x, 0.0)).r;
  float hR = texture2D(uState, vUv + vec2(uTexel.x, 0.0)).r;
  float hD = texture2D(uState, vUv - vec2(0.0, uTexel.y)).r;
  float hU = texture2D(uState, vUv + vec2(0.0, uTexel.y)).r;

  float laplacian = (hL + hR + hD + hU - 4.0 * h);
  v += laplacian * uWaveSpeed;

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

varying vec2 vUv;

vec3 abyss = vec3(0.0157, 0.0706, 0.1020);
vec3 deep = vec3(0.0392, 0.1647, 0.2275);
vec3 haze = vec3(0.3529, 0.5255, 0.6510);
vec3 ice = vec3(0.7490, 0.8392, 0.9020);

void main() {
  float hL = texture2D(uState, vUv - vec2(uTexel.x, 0.0)).r;
  float hR = texture2D(uState, vUv + vec2(uTexel.x, 0.0)).r;
  float hD = texture2D(uState, vUv - vec2(0.0, uTexel.y)).r;
  float hU = texture2D(uState, vUv + vec2(0.0, uTexel.y)).r;
  vec2 grad = vec2(hR - hL, hU - hD);

  vec2 slowDrift = vec2(sin(uTime * 0.032), cos(uTime * 0.027)) * 0.003;
  vec2 distortedUv = vUv + grad * 0.034 + slowDrift;
  vec3 base = texture2D(uBase, distortedUv).rgb;
  base = mix(abyss, base * 0.34 + deep * 0.22, 0.58);

  vec3 normal = normalize(vec3(-grad.x * 34.0, 1.0, -grad.y * 34.0));
  vec3 lightDir = normalize(vec3(-0.28, 0.62, 0.73));
  float light = max(dot(normal, lightDir), 0.0);
  float slope = length(grad) * 20.0;
  float ridge = smoothstep(0.04, 0.24, slope);
  float spec = pow(light, 10.0) * ridge * uSpecular;
  float fresnel = pow(max(0.0, 1.0 - normal.y), 1.5) * 0.14;
  float breath = 0.5 + 0.5 * sin(uTime * 0.18);

  vec2 centre = vUv - vec2(0.5);
  float vignette = smoothstep(0.34, 0.83, length(centre * vec2(1.0, 1.08)));
  float centrePool = 1.0 - smoothstep(0.0, 0.52, length(centre * vec2(1.15, 1.0)));

  vec3 colour = base;
  colour += ice * spec;
  colour += haze * fresnel * 0.16;
  colour += haze * breath * centrePool * 0.025;
  colour = mix(colour, abyss * 0.75, vignette * 0.82);
  colour = mix(colour, colour * 0.72, centrePool * 0.16);

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

export default function WaterSurface() {
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
      setFallback('Reduced motion is enabled. Showing the accepted static ocean base.')
      return
    }
    if (!finePointer) {
      setFallback('Pointer interaction is disabled on this device. Showing the accepted static ocean base.')
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
    let sourceTarget = createRenderTarget(SIM_SIZE)
    let destinationTarget = createRenderTarget(SIM_SIZE)
    const pointer = new THREE.Vector2(0.5, 0.5)
    const nextPointer = new THREE.Vector2(0.5, 0.5)
    let lastMove = 0
    let pendingImpulse = 0
    let frames = 0
    let fpsLast = performance.now()

    const renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x04121a, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
    mount.appendChild(renderer.domElement)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const quadGeometry = new THREE.PlaneGeometry(2, 2)
    const simScene = new THREE.Scene()
    const renderScene = new THREE.Scene()
    const texel = new THREE.Vector2(1 / SIM_SIZE, 1 / SIM_SIZE)

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
      },
    })

    simScene.add(new THREE.Mesh(quadGeometry, simMaterial))
    renderScene.add(new THREE.Mesh(quadGeometry, renderMaterial))

    renderer.setRenderTarget(sourceTarget)
    renderer.clear()
    renderer.setRenderTarget(destinationTarget)
    renderer.clear()
    renderer.setRenderTarget(null)

    const textureLoader = new THREE.TextureLoader()
    const baseTexture = textureLoader.load(
      '/media/ch00-ocean.webp',
      () => {
        if (!disposed) setReady(true)
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

    const resize = () => {
      const width = Math.max(1, mount.clientWidth)
      const height = Math.max(1, mount.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
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
      const impulseAge = now - lastMove
      const impulse = impulseAge < 120 ? pendingImpulse : 0
      pendingImpulse *= 0.62

      for (let i = 0; i < 2; i++) {
        simMaterial.uniforms.uState.value = sourceTarget.texture
        simMaterial.uniforms.uPointer.value = pointer
        simMaterial.uniforms.uImpulse.value = i === 0 ? impulse : 0
        renderer.setRenderTarget(destinationTarget)
        renderer.render(simScene, camera)
        swapTargets()
      }

      renderMaterial.uniforms.uState.value = sourceTarget.texture
      renderMaterial.uniforms.uTime.value = timer.getElapsed()
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

    resize()
    window.addEventListener('resize', resize)
    renderer.domElement.addEventListener('pointermove', injectPointer, { passive: true })
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      renderer.domElement.removeEventListener('pointermove', injectPointer)
      sourceTarget.dispose()
      destinationTarget.dispose()
      quadGeometry.dispose()
      simMaterial.dispose()
      renderMaterial.dispose()
      baseTexture.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <section className="water-lab" aria-label="Internal dark-water interaction experiment">
      <style dangerouslySetInnerHTML={{ __html: LAB_CSS }} />
      {fallback ? <div className="water-lab-fallback" /> : null}
      <div ref={mountRef} className="water-lab-mount" aria-hidden />
      <div className="water-lab-vignette" aria-hidden />

      {fallback ? (
        <div className="water-lab-fallback-note">{fallback}</div>
      ) : (
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
      )}
    </section>
  )
}
