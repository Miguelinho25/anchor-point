import Link from 'next/link'

// Restrained site footer — instrument-panel quiet. Brand + tagline (existing
// copy) on the left, product/contact links right, a thin legal base below.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="site-footer-wordmark">Anchor Point</div>
          <p className="site-footer-line">
            The operating system for maritime intelligence.
          </p>
        </div>
        <nav className="site-footer-nav" aria-label="Footer">
          <Link href="/anchor-voyage" className="site-footer-link">AnchorVoyage</Link>
          <Link href="/anchor-ai" className="site-footer-link">Anchor AI</Link>
          <Link href="/contact" className="site-footer-link">Contact</Link>
        </nav>
      </div>
      <div className="site-footer-base">
        <span className="site-footer-legal">© 2026 Anchor Point</span>
        <span className="site-footer-legal site-footer-legal-muted">Legal</span>
      </div>
    </footer>
  )
}
