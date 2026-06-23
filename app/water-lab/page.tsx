import type { Metadata } from 'next'
import WaterSurface from '@/components/experimental/WaterSurface'

export const metadata: Metadata = {
  title: 'Water Lab — Anchor Point',
  description: 'Internal dark-water interaction prototype.',
}

export default function WaterLabPage() {
  return <WaterSurface />
}
