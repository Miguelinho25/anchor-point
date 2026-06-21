'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      // stronger expo-out: heavier momentum, more expensive deceleration
      easing: (t: number) => 1 - Math.pow(2, -12 * t),
      smoothWheel: true,
    })

    // Drive Lenis from GSAP's ticker so both share the same clock
    function onTick(time: number) {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // Keep ScrollTrigger in sync with Lenis scroll position
    lenis.on('scroll', () => ScrollTrigger.update())

    return () => {
      lenis.destroy()
      gsap.ticker.remove(onTick)
    }
  }, [])

  return <>{children}</>
}
