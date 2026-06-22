import type { Metadata } from 'next'
import PlaceholderPage from '@/components/site/PlaceholderPage'

export const metadata: Metadata = {
  title: 'AnchorVoyage — Anchor Point',
  description: 'Unified maritime intelligence.',
}

export default function AnchorVoyagePage() {
  return (
    <PlaceholderPage
      eyebrow="Operational Layer"
      title="AnchorVoyage"
      sub="Unified maritime intelligence."
      cta={{ label: 'Request Access', href: '/contact' }}
    />
  )
}
