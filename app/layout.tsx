import type { Metadata, Viewport } from 'next'
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const syne = Syne({ 
  subsets: ["latin"],
  variable: '--font-heading',
  weight: ['500', '600', '700', '800']
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700']
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-mono',
  weight: ['400', '500', '600']
})

export const metadata: Metadata = {
  title: 'SubSlash - AI Subscription Manager',
  description: 'Take control of your subscriptions. Track spending, discover savings, and slash unnecessary costs with AI-powered insights.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background`}>
        <div className="fixed inset-0 grid-pattern pointer-events-none" />
        <div className="fixed inset-0 noise-overlay pointer-events-none" />
        {children}
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: 'oklch(0.12 0.015 260)',
              border: '1px solid oklch(0.22 0.02 260)',
              color: 'oklch(0.96 0.01 260)',
              fontFamily: 'var(--font-sans)'
            }
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
