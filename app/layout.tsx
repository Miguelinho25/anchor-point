import type { Metadata } from 'next'
import { Josefin_Sans } from 'next/font/google'
import './globals.css'
import LenisProvider from '@/components/providers/LenisProvider'
import Stage from '@/components/Stage/Stage'

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '600'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Anchor Point',
  description: 'The intelligence layer for global shipping.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={josefin.variable} style={{ fontFamily: 'var(--font-display), sans-serif' }}>
      <body>
        <LenisProvider>
          {/* WebGL canvas — fixed behind everything, persists across route changes */}
          <Stage />
          {/* DOM content — z-index above canvas */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  )
}
