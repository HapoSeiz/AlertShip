import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'AlertShip',
  description: 'AlertShip - Real-time outage alerts and smart notifications.',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={playfair.variable}>
      <head>
        <link rel="icon" type="image/png" href="/alertshipfinallogo.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
