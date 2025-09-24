import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { GooglePlacesProvider } from '@/contexts/GooglePlacesContext';
import NProgressProvider from "@/components/nprogress-provider";
import BackToTop from "@/components/back-to-top";
import { MobileMenuProvider } from "@/contexts/MobileMenuContext";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

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

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale || 'en'} className={playfair.variable} dir={locale === 'ur' ? 'rtl' : 'ltr'}>
      <head>
        <link rel="icon" type="image/png" href="/alertshipfinallogo.png" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <GooglePlacesProvider>
              <MobileMenuProvider>
                <NProgressProvider />
                {children}
                <BackToTop />
              </MobileMenuProvider>
            </GooglePlacesProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
