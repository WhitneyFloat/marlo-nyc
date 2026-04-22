import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'marlo — NYC Youth Activity Matching',
  description: "Marlo's got it. AI-powered youth activity discovery for NYC families.",
  manifest: '/manifest.json',
  openGraph: {
    title: 'marlo',
    description: "AI-powered youth activity discovery for NYC families.",
    siteName: 'marlo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'marlo',
    description: "AI-powered youth activity discovery for NYC families.",
  },
}

export const viewport: Viewport = {
  themeColor: '#C4603A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
