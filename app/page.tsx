'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollStore } from '@/lib/scrollStore'

gsap.registerPlugin(ScrollTrigger)

// ─── Split title text into individually animatable char spans ─────────────
function SplitTitle({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char"
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const filmRef   = useRef<HTMLDivElement>(null)
  const film02Ref = useRef<HTMLDivElement>(null)
  const film03Ref = useRef<HTMLDivElement>(null)
  const film04Ref = useRef<HTMLDivElement>(null)
  const film05Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const film   = filmRef.current
    const film02 = film02Ref.current
    const film03 = film03Ref.current
    const film04 = film04Ref.current
    const film05 = film05Ref.current
    if (!film || !film02 || !film03 || !film04 || !film05) return

    // Grab elements via ref so there's no global selector ambiguity
    const chars    = Array.from(film.querySelectorAll<HTMLElement>('.ch01-title .char'))
    const ch00El   = film.querySelector<HTMLElement>('.ch00-content')
    const dividerEl = film.querySelector<HTMLElement>('.ch01-divider')
    const subEl    = film.querySelector<HTMLElement>('.ch01-sub')

    // Initial hidden states via inline style (avoids GSAP/hydration race)
    chars.forEach((c) => {
      c.style.opacity = '0'
      c.style.transform = 'translateY(24px)'
      c.style.filter = 'blur(6px)'
    })
    if (dividerEl) { dividerEl.style.opacity = '0'; dividerEl.style.transform = 'scaleX(0)' }
    if (subEl)     { subEl.style.opacity = '0';     subEl.style.transform = 'translateY(12px)' }

    // Smootherstep — S-curve with faster lock at ends
    function sm(t: number) {
      const c = Math.max(0, Math.min(1, t))
      return c * c * (3 - 2 * c)
    }

    // ── Single master drives EVERYTHING from self.progress (0→1)
    // No child ScrollTriggers — eliminates all percentage-offset ambiguity.
    const master = ScrollTrigger.create({
      trigger: film,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2.5,
      onUpdate(self) {
        const p = self.progress
        scrollStore.progress = p

        // CH00: exit in first 16% of progress
        if (ch00El) {
          const t = sm(p / 0.16)
          ch00El.style.opacity = String(1 - t)
          ch00El.style.transform = `translateY(${-40 * t}px)`
        }

        // CH01 title: staggered chars across 72–93% of progress
        const N = chars.length
        const raw = (p - 0.72) / 0.21  // normalised within [0.72, 0.93]
        chars.forEach((char, i) => {
          // Each char starts slightly later (stagger = 1 char-width per char)
          const t = sm(raw * N - i)
          char.style.opacity = String(t)
          char.style.transform = `translateY(${24 * (1 - t)}px)`
          char.style.filter = `blur(${6 * (1 - t)}px)`
        })

        // CH01 divider: 82–90%
        if (dividerEl) {
          const t = sm((p - 0.82) / 0.08)
          dividerEl.style.opacity = String(t)
          dividerEl.style.transform = `scaleX(${t})`
          dividerEl.style.transformOrigin = 'left center'
        }

        // CH01 sub: 87–97%
        if (subEl) {
          const t = sm((p - 0.87) / 0.10)
          subEl.style.opacity = String(t)
          subEl.style.transform = `translateY(${12 * (1 - t)}px)`
        }
      },
    })

    // ── CH02: data fragments + text reveals driven by ch02Progress (0→1)
    const fragments = Array.from(film02.querySelectorAll<HTMLElement>('.data-fragment'))
    const ch02TextA = film02.querySelector<HTMLElement>('.ch02-text-a')
    const ch02TextB = film02.querySelector<HTMLElement>('.ch02-text-b')

    fragments.forEach((f) => { f.style.opacity = '0' })
    if (ch02TextA) { ch02TextA.style.opacity = '0'; ch02TextA.style.transform = 'translateY(18px)' }
    if (ch02TextB) { ch02TextB.style.opacity = '0'; ch02TextB.style.transform = 'translateY(18px)' }

    // Precomputed unit vectors from each fragment's natural position toward screen centre.
    // Derived from CSS top/right/bottom/left values — frag-1…frag-8 in DOM order.
    const pullDirs: [number, number][] = [
      [ 0.77,  0.64],  // frag-1  top-left
      [-0.72,  0.70],  // frag-2  top-right
      [-0.98,  0.22],  // frag-3  right
      [ 0.99,  0.09],  // frag-4  left
      [-0.89, -0.44],  // frag-5  bottom-right
      [-0.85, -0.53],  // frag-6  bottom-right
      [ 0.85,  0.53],  // frag-7  top-left
      [ 0.88, -0.48],  // frag-8  bottom-left
    ]

    // Convergence offset — written by scroll onUpdate, read by drift ticker
    const convX = new Array<number>(fragments.length).fill(0)
    const convY = new Array<number>(fragments.length).fill(0)

    // Field-driven drift — runs every frame so motion continues between scroll events.
    // Two frequency layers give spatial coherence; per-fragment phase/amplitude
    // variation breaks perfect rotational symmetry without introducing random jitter.
    function driftTick() {
      if (scrollStore.ch02Progress <= 0) return
      const t = performance.now() * 0.001
      fragments.forEach((f, i) => {
        const angle = (i / fragments.length) * Math.PI * 2
        // Deterministic per-fragment modulation (prime-like multipliers avoid repetition)
        const phaseV = Math.sin(i * 1.87) * 0.72
        const ampV   = 1 + Math.sin(i * 2.31) * 0.16
        const fx = (Math.cos(t * 0.14 + angle * 0.55 + phaseV)      * 5.5
                 +  Math.sin(t * 0.09 + angle * 1.10 + phaseV * 0.6) * 3.0) * ampV
        const fy = (Math.sin(t * 0.11 + angle * 0.70 + phaseV * 0.8) * 4.0
                 +  Math.cos(t * 0.07 + angle * 1.25 + phaseV * 0.4) * 2.5) * ampV
        f.style.transform = `translate(${fx + convX[i]}px,${fy + convY[i]}px)`
      })
    }
    gsap.ticker.add(driftTick)

    const ch02Master = ScrollTrigger.create({
      trigger: film02,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2.5,
      onUpdate(self) {
        const p = self.progress
        scrollStore.ch02Progress = p

        fragments.forEach((f, i) => {
          // Entrance: stagger in across 0–40% of ch02
          const enterT = sm((p - i * 0.038) / 0.30)

          // Per-fragment timing offset — desynchronises absorption so it feels organic
          const fragOffset = Math.sin(i * 1.94) * 0.04 + (i % 3) * 0.016
          const rawConv = Math.max(0, Math.min(1, (p - 0.70 - fragOffset) / 0.30))
          const conv = rawConv * rawConv * rawConv  // ease-in³: gravity-like acceleration

          // Zone of intelligence: brightness bell-curves as fragment enters vessel field.
          // Peaks at ~50% convergence (approaching), then fades as it's absorbed.
          const approachT = Math.min(1, conv / 0.65)
          const inZone    = Math.sin(approachT * Math.PI)            // 0 → peak → 0
          const absorb    = 1 - Math.max(0, (conv - 0.62) / 0.38)   // fade 62–100% conv
          f.style.opacity = String(Math.min(0.90, enterT * (0.62 + inZone * 0.30) * absorb))
          f.style.filter  = `brightness(${(1 + inZone * 0.45).toFixed(3)})`

          // Path deviation rotates each fragment's pull direction slightly off-centre
          // so convergence paths feel field-driven, not radially symmetric
          const dir      = pullDirs[i] ?? [0, 0]
          const devAngle = Math.sin(i * 1.73) * 0.09
          const rc = Math.cos(devAngle)
          const rs = Math.sin(devAngle)
          convX[i] = (dir[0] * rc - dir[1] * rs) * conv * 85
          convY[i] = (dir[0] * rs + dir[1] * rc) * conv * 60
        })

        // Text line A: 52–66%
        if (ch02TextA) {
          const t = sm((p - 0.52) / 0.14)
          ch02TextA.style.opacity = String(t)
          ch02TextA.style.transform = `translateY(${18 * (1 - t)}px)`
        }
        // Text line B: 61–76%
        if (ch02TextB) {
          const t = sm((p - 0.61) / 0.15)
          ch02TextB.style.opacity = String(t)
          ch02TextB.style.transform = `translateY(${18 * (1 - t)}px)`
        }
      },
    })

    // ── CH03: AnchorVoyage — system emergence
    const ch03modules = Array.from(film03.querySelectorAll<HTMLElement>('.ch03-module'))
    const ch03wordmark = film03.querySelector<HTMLElement>('.ch03-wordmark')

    // Initial hidden state
    ch03modules.forEach((m) => { m.style.opacity = '0'; m.style.transform = 'translate(0px,0px)' })
    if (ch03wordmark) {
      ch03wordmark.style.opacity = '0'
      ch03wordmark.style.transform = 'translateX(-50%)'  // resolves in place — no entrance
    }

    // Unit vectors FROM each module's stable position TOWARD centre.
    // Adjusted for the asymmetric CSS positions (top 17/21%, bottom 16/20%).
    const modFromCentre: [number, number][] = [
      [ 0.79,  0.61],  // mod-voyage-route: top:17% left:7%
      [-0.82,  0.57],  // mod-economics:    top:21% right:8%
      [ 0.80, -0.60],  // mod-eta-intel:    bottom:16% left:6%
      [-0.83, -0.56],  // mod-risk-layer:   bottom:20% right:7%
    ]

    // Non-uniform arrival timing — field alignment, not mechanical stagger
    const modTiming = [
      { start: 0.02, dur: 0.30 },   // voyage route: earliest, steady pace
      { start: 0.07, dur: 0.33 },   // economics: slight offset, slower lock
      { start: 0.04, dur: 0.27 },   // ETA intel: medium delay, faster snap
      { start: 0.10, dur: 0.32 },   // risk layer: last, deliberate
    ]

    const ch03Master = ScrollTrigger.create({
      trigger: film03,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2.5,
      onUpdate(self) {
        const p = self.progress
        scrollStore.ch03Progress = p

        // Modules radiate outward from the hero vessel — each has its own pace
        ch03modules.forEach((m, i) => {
          const { start, dur } = modTiming[i]
          const modT = sm((p - start) / dur)
          m.style.opacity = String(modT * 0.85)
          const dir = modFromCentre[i] ?? [0, 0]
          // Displacement starts large (near hero) and collapses to zero (stable position)
          const dx = dir[0] * (1 - modT) * 120
          const dy = dir[1] * (1 - modT) * 82
          m.style.transform = `translate(${dx}px,${dy}px)`
        })

        // Silent operational moment: p ~0.42–0.88 — system is fully active, unnamed.
        // AnchorVoyage resolves last as recognition, not label. No motion, just clarity.
        if (ch03wordmark) {
          const t = sm((p - 0.88) / 0.12)
          ch03wordmark.style.opacity = String(t * 0.65)
          ch03wordmark.style.transform = 'translateX(-50%)'
        }
      },
    })

    // ── CH04: Anchor AI — Live Intelligence Layer
    const ch04reveal = film04.querySelector<HTMLElement>('.anchor-ai-reveal')
    const ch04sigA   = film04.querySelector<HTMLElement>('.ai-sig-a')
    const ch04sigB   = film04.querySelector<HTMLElement>('.ai-sig-b')
    const ch04sigC   = film04.querySelector<HTMLElement>('.ai-sig-c')
    const ch04sigD   = film04.querySelector<HTMLElement>('.ai-sig-d')
    const ch04footer = film04.querySelector<HTMLElement>('.ai-footer-bar')

    if (ch04reveal) { ch04reveal.style.opacity = '0'; ch04reveal.style.transform = 'translate(-50%, -16px)' }
    if (ch04sigA)   { ch04sigA.style.opacity   = '0'; ch04sigA.style.transform   = 'translateX(-8px)' }
    if (ch04sigB)   { ch04sigB.style.opacity   = '0'; ch04sigB.style.transform   = 'translateX(8px)' }
    if (ch04sigC)   { ch04sigC.style.opacity   = '0'; ch04sigC.style.transform   = 'translateX(-8px)' }
    if (ch04sigD)   { ch04sigD.style.opacity   = '0'; ch04sigD.style.transform   = 'translateX(8px)' }
    if (ch04footer) { ch04footer.style.opacity = '0' }

    const ch04Master = ScrollTrigger.create({
      trigger: film04,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2.5,
      onUpdate(self) {
        const p = self.progress
        scrollStore.ch04Progress = p

        // Peak activation — bell over mid/end of CH04: the intelligence layer briefly
        // reaches full processing state, then settles. Shared with Stage.tsx (same curve).
        const peak = Math.sin(Math.max(0, Math.min(1, (p - 0.40) / 0.50)) * Math.PI)
        const sigBright = (1 + peak * 0.32).toFixed(3)

        // Anchor AI wordmark — major reveal, first to arrive
        if (ch04reveal) {
          const t = sm((p - 0.04) / 0.16)
          ch04reveal.style.opacity = String(t * 0.95)
          ch04reveal.style.transform = `translate(-50%, ${-16 * (1 - t)}px)`
        }
        // Signals fade in spatially staggered — AI reads different field zones
        if (ch04sigA) {
          const t = sm((p - 0.16) / 0.18)
          ch04sigA.style.opacity = String(t * 0.92)
          ch04sigA.style.transform = `translateX(${-8 * (1 - t)}px)`
          ch04sigA.style.filter = `brightness(${sigBright})`
        }
        if (ch04sigB) {
          const t = sm((p - 0.22) / 0.18)
          ch04sigB.style.opacity = String(t * 0.92)
          ch04sigB.style.transform = `translateX(${8 * (1 - t)}px)`
          ch04sigB.style.filter = `brightness(${sigBright})`
        }
        if (ch04sigC) {
          const t = sm((p - 0.28) / 0.18)
          ch04sigC.style.opacity = String(t * 0.92)
          ch04sigC.style.transform = `translateX(${-8 * (1 - t)}px)`
          ch04sigC.style.filter = `brightness(${sigBright})`
        }
        if (ch04sigD) {
          const t = sm((p - 0.34) / 0.18)
          ch04sigD.style.opacity = String(t * 0.92)
          ch04sigD.style.transform = `translateX(${8 * (1 - t)}px)`
          ch04sigD.style.filter = `brightness(${sigBright})`
        }
        // Footer — last, lifts to full presence and brightens subtly at peak
        if (ch04footer) {
          const t = sm((p - 0.44) / 0.16)
          ch04footer.style.opacity = String(t * (0.74 + peak * 0.14))
          ch04footer.style.filter = `brightness(${sigBright})`
        }
      },
    })

    // ── CH05: Anchor Point — the operating system reveal
    // AnchorVoyage + Anchor AI dock into one framework, then the parent system is named.
    const ch05modAV   = film05.querySelector<HTMLElement>('.mod-av')
    const ch05modAI   = film05.querySelector<HTMLElement>('.mod-ai')
    const ch05link    = film05.querySelector<HTMLElement>('.ch05-link')
    const ch05futL    = film05.querySelector<HTMLElement>('.ch05-fut-l')
    const ch05futR    = film05.querySelector<HTMLElement>('.ch05-fut-r')
    const ch05eyebrow = film05.querySelector<HTMLElement>('.ch05-eyebrow')
    const ch05word    = film05.querySelector<HTMLElement>('.ch05-wordmark')
    const ch05tag     = film05.querySelector<HTMLElement>('.ch05-tagline')
    const ch05status  = film05.querySelector<HTMLElement>('.ch05-status')
    const ch05scrim   = film05.querySelector<HTMLElement>('.ch05-scrim')

    if (ch05modAV)   { ch05modAV.style.opacity = '0';   ch05modAV.style.transform = 'translateX(-40px)' }
    if (ch05modAI)   { ch05modAI.style.opacity = '0';   ch05modAI.style.transform = 'translateX(40px)' }
    if (ch05link)    { ch05link.style.opacity = '0';    ch05link.style.transform = 'scaleX(0)' }
    if (ch05futL)    { ch05futL.style.opacity = '0' }
    if (ch05futR)    { ch05futR.style.opacity = '0' }
    if (ch05eyebrow) { ch05eyebrow.style.opacity = '0' }
    if (ch05word)    { ch05word.style.opacity = '0'; ch05word.style.transform = 'translateY(14px)'; ch05word.style.filter = 'blur(8px)' }
    if (ch05tag)     { ch05tag.style.opacity = '0' }
    if (ch05status)  { ch05status.style.opacity = '0' }
    if (ch05scrim)   { ch05scrim.style.opacity = '0' }

    const ch05Master = ScrollTrigger.create({
      trigger: film05,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 2.5,
      onUpdate(self) {
        const p = self.progress
        scrollStore.ch05Progress = p

        // System-lock bell (~0.5) — shared with Stage.tsx. Calm, inevitable alignment,
        // peaking as the boundary seals and the modules connect, just before the name.
        const lock = Math.sin(Math.max(0, Math.min(1, (p - 0.25) / 0.45)) * Math.PI)
        const lockBright = (1 + lock * 0.30).toFixed(3)

        // 1 — Modules dock inward: the two layers converge into one framework
        if (ch05modAV) {
          const t = sm((p - 0.06) / 0.24)
          ch05modAV.style.opacity = String(t * 0.90)
          ch05modAV.style.transform = `translateX(${-40 * (1 - t)}px)`
          ch05modAV.style.filter = `brightness(${lockBright})`
        }
        if (ch05modAI) {
          const t = sm((p - 0.12) / 0.24)
          ch05modAI.style.opacity = String(t * 0.90)
          ch05modAI.style.transform = `translateX(${40 * (1 - t)}px)`
          ch05modAI.style.filter = `brightness(${lockBright})`
        }
        // 2 — Connector draws between them once docked (boundary seals in WebGL here)
        if (ch05link) {
          const t = sm((p - 0.26) / 0.16)
          ch05link.style.opacity = String(t * 0.7)
          ch05link.style.transform = `scaleX(${t})`
          ch05link.style.filter = `brightness(${lockBright})`
        }
        // Faint locked nodes — expansion potential, never named
        if (ch05futL) ch05futL.style.opacity = String(sm((p - 0.34) / 0.20) * 0.22)
        if (ch05futR) ch05futR.style.opacity = String(sm((p - 0.40) / 0.20) * 0.22)

        // 3 — Eyebrow, then 4 — ANCHOR POINT resolves: only after unification is earned.
        // Scrim arrives just ahead of the letters so they read cleanly over the routes.
        if (ch05scrim) {
          const t = sm((p - 0.44) / 0.20)
          ch05scrim.style.opacity = String(t)
        }
        if (ch05eyebrow) {
          const t = sm((p - 0.40) / 0.12)
          ch05eyebrow.style.opacity = String(t * 0.55)
        }
        if (ch05word) {
          const t = sm((p - 0.48) / 0.22)
          ch05word.style.opacity = String(t * 0.96)
          ch05word.style.transform = `translateY(${14 * (1 - t)}px)`
          ch05word.style.filter = `blur(${8 * (1 - t)}px)`
        }
        // 5 — Tagline, 6 — Status. All settled by ~0.84, leaving a held final frame.
        if (ch05tag) {
          const t = sm((p - 0.64) / 0.12)
          ch05tag.style.opacity = String(t * 0.62)
        }
        if (ch05status) {
          const t = sm((p - 0.72) / 0.12)
          ch05status.style.opacity = String(t * (0.62 + lock * 0.15))
        }
      },
    })

    // Force Lenis + GSAP to recalculate scroll limit and all trigger positions
    window.dispatchEvent(new Event('resize'))
    ScrollTrigger.refresh()

    // Re-register the full multi-section height after first paint. The synchronous
    // refresh above can run before sticky layout settles, leaving Lenis capping the
    // scroll limit at a stale height (the new last section becomes unreachable).
    const rafRefresh = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
      ScrollTrigger.refresh()
    })
    const lateRefresh = window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
      ScrollTrigger.refresh()
    }, 600)

    return () => {
      cancelAnimationFrame(rafRefresh)
      clearTimeout(lateRefresh)
      master.kill()
      ch02Master.kill()
      ch03Master.kill()
      ch04Master.kill()
      ch05Master.kill()
      gsap.ticker.remove(driftTick)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <>
    <div ref={filmRef} className="scroll-film">
      <div className="sticky-stage">
        {/* Atmospheric depth — top/bottom vignettes + radial edge haze */}
        <div className="stage-fog" />

        {/* CH00 — The Dark Sea */}
        <div className="ch00-content">
          <p className="ch00-lead">
            42,000 vessels are moving right now.
          </p>
          <p className="ch00-secondary">
            Almost none of them can see each other.
          </p>
          <p className="ch00-scroll-hint">
            Scroll to make sense of it
          </p>
        </div>

        {/* CH01 — Orientation (emerges from the bottom-left as routes resolve) */}
        <div className="ch01-content">
          <h1 className="ch01-title">
            <SplitTitle text="Anchor Point" />
          </h1>
          <div className="ch01-divider" />
          <p className="ch01-sub">
            The intelligence layer for global shipping.
          </p>
        </div>

      </div>
    </div>

    {/* CH02 - The Problem Has A Shape */}
    <div ref={film02Ref} className="scroll-film-ch02">
      <div className="sticky-stage">
        <div className="stage-fog" />

        {/* Ghost data fragments — eight incompatible systems surrounding one vessel */}
        <div className="data-fragment frag-1">
          <div className="data-fragment-inner">
            <div className="frag-label">WX · Signal</div>
            <div className="frag-value">SWELL HT ↑ 4.2m<br/>BEAM SEA · 285°</div>
          </div>
        </div>

        <div className="data-fragment frag-2">
          <div className="data-fragment-inner">
            <div className="frag-label">Port Status</div>
            <div className="frag-value">JEBEL ALI · STS<br/>WAIT EST: +14h</div>
          </div>
        </div>

        <div className="data-fragment frag-3">
          <div className="data-fragment-inner">
            <div className="frag-label">ETA · Calc</div>
            <div className="frag-value">PIRAEUS Δ +26h<br/>CONF ░░░░ 43%</div>
          </div>
        </div>

        <div className="data-fragment frag-4">
          <div className="data-fragment-inner">
            <div className="frag-label">TD3C Spot</div>
            <div className="frag-value">$18,400 / DAY<br/>↑ 2.1% VS PREV</div>
          </div>
        </div>

        <div className="data-fragment frag-5">
          <div className="data-fragment-inner">
            <div className="frag-label">Bunker · HFO</div>
            <div className="frag-value">$520 / MT<br/>386 MT GSM REQ.</div>
          </div>
        </div>

        <div className="data-fragment frag-6">
          <div className="data-fragment-inner">
            <div className="frag-label">Route Analysis</div>
            <div className="frag-value">DELAY: HIGH<br/>ALT +340 NM</div>
          </div>
        </div>

        <div className="data-fragment frag-7">
          <div className="data-fragment-inner">
            <div className="frag-label">Vessel Draft</div>
            <div className="frag-value">19.2m · LADEN<br/>AIR DRAFT 58m</div>
          </div>
        </div>

        <div className="data-fragment frag-8">
          <div className="data-fragment-inner">
            <div className="frag-label">Doc Status</div>
            <div className="frag-value">3 DOCS MISSING<br/>PORT STATE: PENDING</div>
          </div>
        </div>

        {/* Text reveal — the recognition moment */}
        <div className="ch02-text">
          <p className="ch02-text-a">The answers already exist.</p>
          <p className="ch02-text-b">They just don't speak the same language.</p>
        </div>

      </div>
    </div>

    {/* CH03 - AnchorVoyage */}
    <div ref={film03Ref} className="scroll-film-ch03">
      <div className="ch03-stage">

        {/* Module: Voyage Route — top-left */}
        <div className="ch03-module mod-voyage-route">
          <div className="mod-tag">Active System</div>
          <div className="mod-title">Voyage Route</div>
        </div>

        {/* Module: Economics — top-right */}
        <div className="ch03-module mod-economics">
          <div className="mod-tag">Live Feed</div>
          <div className="mod-title">Economics</div>
        </div>

        {/* Module: ETA Intelligence — bottom-left */}
        <div className="ch03-module mod-eta-intel">
          <div className="mod-tag">Computed</div>
          <div className="mod-title">ETA Intelligence</div>
        </div>

        {/* Module: Risk Layer — bottom-right */}
        <div className="ch03-module mod-risk-layer">
          <div className="mod-tag">Monitoring</div>
          <div className="mod-title">Risk Layer</div>
        </div>

        {/* AnchorVoyage wordmark — resolves last, below the hero vessel */}
        <div className="ch03-wordmark">
          <span className="wordmark-name">AnchorVoyage</span>
          <span className="wordmark-sub">Unified Maritime Intelligence</span>
        </div>

      </div>
    </div>

    {/* CH04 - Anchor AI */}
    <div ref={film04Ref} className="scroll-film-ch04" style={{ position: 'relative', height: '300vh' }}>
      <div className="ch04-stage">

        {/* Anchor AI — the intelligence layer activates (banner above the field) */}
        <div className="anchor-ai-reveal">
          <div className="ai-wordmark">Anchor AI</div>
          <div className="ai-scanline"><div className="ai-scanline-sweep" /></div>
          <div className="ai-subline">Live Intelligence Layer</div>
        </div>

        {/* Signal: Route Optimisation — upper left */}
        <div className="ai-signal ai-sig-a">
          <div className="ai-sig-head">
            <span className="ai-sig-dot" />
            <span className="ai-sig-label">Route Optimisation</span>
          </div>
          <div className="ai-sig-value">Active</div>
          <div className="ai-sig-line" />
        </div>

        {/* Signal: Risk Assessment — upper right */}
        <div className="ai-signal ai-sig-b">
          <div className="ai-sig-head">
            <span className="ai-sig-dot" />
            <span className="ai-sig-label">Risk Assessment</span>
          </div>
          <div className="ai-sig-value">Processing</div>
          <div className="ai-sig-line" />
        </div>

        {/* Signal: ETA Precision — lower left */}
        <div className="ai-signal ai-sig-c">
          <div className="ai-sig-head">
            <span className="ai-sig-dot" />
            <span className="ai-sig-label">ETA Precision</span>
          </div>
          <div className="ai-sig-value">Refining</div>
          <div className="ai-sig-line" />
        </div>

        {/* Signal: Market Intelligence — lower right */}
        <div className="ai-signal ai-sig-d">
          <div className="ai-sig-head">
            <span className="ai-sig-dot" />
            <span className="ai-sig-label">Market Intelligence</span>
          </div>
          <div className="ai-sig-value">Reading</div>
          <div className="ai-sig-line" />
        </div>

        {/* Bottom: intelligence status indicator */}
        <div className="ai-footer-bar">
          <span className="ai-active-pill"><span className="ai-pill-dot" />Active</span>
          <span className="ai-footer-text">Maritime Intelligence Field Processing</span>
        </div>

      </div>
    </div>

    {/* CH05 - Anchor Point — the operating system reveal */}
    <div ref={film05Ref} className="scroll-film-ch05" style={{ position: 'relative', height: '300vh' }}>
      <div className="ch05-stage">

        {/* Two layers dock into one framework */}
        <div className="ch05-modules">
          <div className="ch05-module mod-av">
            <span className="ch05-mod-dot" />
            <div className="ch05-mod-name">AnchorVoyage</div>
            <div className="ch05-mod-layer">Operational Layer</div>
          </div>
          <div className="ch05-link" />
          <div className="ch05-module mod-ai">
            <span className="ch05-mod-dot" />
            <div className="ch05-mod-name">Anchor AI</div>
            <div className="ch05-mod-layer">Intelligence Layer</div>
          </div>
        </div>

        {/* Faint locked nodes — room to expand, nothing claimed */}
        <div className="ch05-future ch05-fut-l">
          <span className="ch05-fut-dot" />
          <span className="ch05-fut-label">Locked</span>
        </div>
        <div className="ch05-future ch05-fut-r">
          <span className="ch05-fut-dot" />
          <span className="ch05-fut-label">Locked</span>
        </div>

        {/* Soft scrim — lifts the wordmark off the route lines passing behind it */}
        <div className="ch05-scrim" />

        {/* Parent system — revealed only after the unification is felt */}
        <div className="ch05-reveal">
          <div className="ch05-eyebrow">One unified system</div>
          <div className="ch05-wordmark">Anchor Point</div>
          <div className="ch05-tagline">The operating system for maritime intelligence.</div>
        </div>

        {/* Quiet operating status */}
        <div className="ch05-status">
          <span className="ch05-status-dot" />
          <span>System unified · Online</span>
        </div>

      </div>
    </div>
    </>
  )
}
