import type { Metadata } from 'next'
import PlaceholderPage from '@/components/site/PlaceholderPage'

export const metadata: Metadata = {
  title: 'Contact — Anchor Point',
  description: 'Request access to the Anchor Point system.',
}

export default function ContactPage() {
  return (
    <PlaceholderPage
      eyebrow="Get in touch"
      title="Contact"
      sub="Request access to the Anchor Point system."
      cta={{ label: 'Back to homepage', href: '/' }}
    />
  )
}
