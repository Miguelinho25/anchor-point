'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

// Product layers + the manifesto. The cinematic homepage *is* the Vision, so
// that item returns to the film; the wordmark also returns home (brand mark).
const NAV = [
  { label: 'AnchorVoyage', href: '/anchor-voyage' },
  { label: 'Anchor AI', href: '/anchor-ai' },
  { label: 'Vision', href: '/' },
  { label: 'About', href: '/about' },
]

// Minimal cinematic header. It does not sit *on top of* the film — it gets out
// of the way while you scroll down into the journey and returns, with a faint
// scrim for legibility, when you scroll up. No library, no heavy animation:
// a single CSS transform/opacity transition toggled by scroll direction.
export default function Header() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY
    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY.current
        if (y < 64) {
          // Very top (CH00 opening frame): always present, fully transparent.
          setHidden(false)
          setScrolled(false)
        } else {
          setScrolled(true)
          // Ignore sub-pixel jitter; only react to deliberate movement.
          if (Math.abs(delta) > 6) setHidden(delta > 0)
        }
        lastY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`site-header${hidden ? ' is-hidden' : ''}${scrolled ? ' is-scrolled' : ''}`}
    >
      <div className="site-header-inner">
        <Link href="/" className="site-wordmark" aria-label="Anchor Point — home">
          Anchor Point
        </Link>
        <nav className="site-nav" aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} className="site-nav-link">
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="site-nav-cta">
            Request Access
          </Link>
        </nav>
      </div>
    </header>
  )
}
