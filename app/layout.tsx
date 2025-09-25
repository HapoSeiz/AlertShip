import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { GooglePlacesProvider } from '@/contexts/GooglePlacesContext';
import NProgressProvider from "@/components/nprogress-provider";
import BackToTop from "@/components/back-to-top";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";

export const metadata: Metadata = {
  title: 'AlertShip',
  description: 'AlertShip - Real-time outage alerts and smart notifications.',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <link rel="icon" type="image/png" href="/alertshipfinallogo.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
