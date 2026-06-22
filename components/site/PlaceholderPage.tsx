import Link from 'next/link'

type Cta = { label: string; href: string }

// Shared minimal page for routes that exist to make navigation functional and
// prepare the architecture — not full product pages. Brand-consistent: eyebrow,
// display title, one restrained line, an honest "in development" status (reusing
// the film's status-indicator language), and a single quiet action.
export default function PlaceholderPage({
  eyebrow,
  title,
  sub,
  cta,
}: {
  eyebrow: string
  title: string
  sub: string
  cta?: Cta
}) {
  return (
    <main className="placeholder-page">
      <div className="placeholder-inner">
        <span className="placeholder-eyebrow">{eyebrow}</span>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-sub">{sub}</p>
        <div className="placeholder-status">
          <span className="placeholder-status-dot" />
          <span>In development</span>
        </div>
        {cta ? (
          <Link href={cta.href} className="placeholder-cta">{cta.label}</Link>
        ) : null}
      </div>
    </main>
  )
}
