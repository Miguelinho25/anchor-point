import type { Metadata } from 'next'
import PlaceholderPage from '@/components/site/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Anchor AI — Anchor Point',
  description: 'Live intelligence layer.',
}

export default function AnchorAIPage() {
  return (
    <PlaceholderPage
      eyebrow="Intelligence Layer"
      title="Anchor AI"
      sub="Live intelligence layer."
      cta={{ label: 'Request Access', href: '/contact' }}
    />
  )
}
