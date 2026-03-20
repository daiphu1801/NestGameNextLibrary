import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './auth.css';
import { metadata as siteMetadata } from '@/config/site';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { Footer } from '@/components/layout/Footer';
import { MobileWarning } from '@/components/layout/MobileWarning';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AppProvider } from '@/components/providers/AppProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  ...siteMetadata,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7C3AED" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NestGame" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={inter.className}>
        <AppProvider>
          <LoadingScreen />
          <div className="flex min-h-screen flex-col relative">
            <MobileWarning />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <PWAInstallPrompt />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
