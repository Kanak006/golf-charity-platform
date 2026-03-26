// app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Golf for Good — Play. Win. Give.',
  description: 'A subscription golf platform combining performance tracking, monthly prize draws, and charitable giving.',
  openGraph: {
    title: 'Golf for Good',
    description: 'Play. Win. Give.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}