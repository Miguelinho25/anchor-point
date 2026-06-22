import Link from 'next/link'

// The doors opening after the film. Sits in normal flow directly below CH05, so
// it rises as the held "Anchor Point" final frame completes. Opaque background
// (transparent → abyss) lets the last WebGL frame bleed in, then seals to the
// site. Action-led, no marketing prose, no claims — only the invitation.
export default function FinalCTA() {
  return (
    <section className="final-cta" aria-label="Enter the system">
      <div className="final-cta-inner">
        <span className="final-cta-eyebrow">Enter the system</span>
        <Link href="/contact" className="final-cta-primary">
          Request Access
        </Link>
        <div className="final-cta-secondary">
          <Link href="/anchor-voyage" className="final-cta-link">Explore AnchorVoyage</Link>
          <span className="final-cta-sep" aria-hidden="true">·</span>
          <Link href="/anchor-ai" className="final-cta-link">Explore Anchor AI</Link>
          <span className="final-cta-sep" aria-hidden="true">·</span>
          <Link href="/contact" className="final-cta-link">Contact</Link>
        </div>
      </div>
    </section>
  )
}
