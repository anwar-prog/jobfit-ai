import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BewerbAI',
  description: 'Craft, tailor and apply — AI-powered CV rewriting and cover letter generation.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
