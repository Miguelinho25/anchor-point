'use client'

import { usePathname } from 'next/navigation'
import WaterSurface from '@/components/experimental/WaterSurface'

const WATER_ROUTES = new Set(['/anchor-voyage', '/anchor-ai', '/about', '/contact'])

export default function StaticWaterBackdrop() {
  const pathname = usePathname()

  if (!WATER_ROUTES.has(pathname)) return null

  return (
    <div className="ap-ocean-webgl-test static-water-backdrop" aria-hidden>
      <div className="ap-ocean-webgl-base" />
      <div className="ap-ocean-img ap-ocean-b" />
      <div className="ap-ocean-img ap-ocean-a" />
      <div className="ap-ocean-lum" />
      <WaterSurface mode="backdrop" />
      <div className="static-water-vignette" />
      <div className="static-water-readability" />
    </div>
  )
}
