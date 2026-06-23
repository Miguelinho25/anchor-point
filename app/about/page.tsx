import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — Anchor Point',
  description:
    'Anchor Point was founded by three university students building a clearer intelligence layer for global shipping.',
}

// Founding team — initials only (no invented bios, no photos, no titles beyond Co-Founder).
const FOUNDERS = [
  { name: 'Miguel Morett', initials: 'MM' },
  { name: 'Argenis Omaña', initials: 'AO' },
  { name: 'Ansh Sahadew', initials: 'AS' },
]

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-shell">
        {/* 1 — Hero */}
        <header className="about-hero">
          <span className="about-eyebrow">About Anchor Point</span>
          <h1 className="about-title">Built from a shared maritime vision.</h1>
          <p className="about-lead">
            Anchor Point was founded by three university students bringing together
            shipping, technology, and ambition — with one belief: that maritime
            intelligence can be clearer, faster, and more connected.
          </p>
        </header>

        {/* 2 — How it started */}
        <section className="about-section">
          <span className="about-section-label">How it started</span>
          <div className="about-prose">
            <p>
              Anchor Point began as a shared idea between Miguel Morett, Argenis Omaña,
              and Ansh Sahadew — three university students who set out to bring a new
              generation&rsquo;s perspective to maritime intelligence.
            </p>
            <p>
              The early vision was simple: connect voyage planning, market understanding,
              and AI-driven insight into one clearer operating layer — instead of leaving
              critical shipping decisions trapped between fragmented data, outdated
              workflows, and disconnected tools.
            </p>
          </div>
        </section>

        {/* 3 — Meet the team */}
        <section className="about-section">
          <span className="about-section-label">Meet the team</span>
          <div className="about-team">
            {FOUNDERS.map((f) => (
              <article className="about-card" key={f.name}>
                <span className="about-monogram" aria-hidden="true">
                  {f.initials}
                </span>
                <div className="about-card-name">{f.name}</div>
                <div className="about-card-role">Co-Founder</div>
              </article>
            ))}
          </div>
        </section>

        {/* 4 — Our vision */}
        <section className="about-section">
          <span className="about-section-label">Our vision</span>
          <div className="about-prose">
            <p>
              Anchor Point is being built to become the intelligence layer for global
              shipping — connecting the real maritime world with clearer operational
              tools and smarter decision-making.
            </p>
            <p className="about-prose-quiet">
              We are early in that journey, and building it deliberately.
            </p>
          </div>
        </section>

        {/* 5 — CTA */}
        <section className="about-cta">
          <p className="about-cta-line">
            Want to understand where Anchor Point is heading?
          </p>
          <Link href="/contact" className="about-cta-button">
            Request Access
          </Link>
        </section>
      </div>
    </main>
  )
}
