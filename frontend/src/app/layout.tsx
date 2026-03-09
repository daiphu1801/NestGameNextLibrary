import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { PerformanceProvider } from '@/components/providers/PerformanceProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { FavoritesProvider } from '@/components/providers/FavoritesProvider';
import { metadata as siteMetadata } from '@/config/site';
import { PWARegister } from '@/components/providers/PWARegister';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  ...siteMetadata,
};

import { Footer } from '@/components/layout/Footer';
import { MobileWarning } from '@/components/layout/MobileWarning';

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
        <PWARegister />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <PerformanceProvider>
              <AuthProvider>
                <FavoritesProvider>
                  <QueryProvider>
                    <ToastProvider>
                      <div className="flex min-h-screen flex-col relative">
                        <MobileWarning />
                        <div className="flex-1">
                          {children}
                        </div>
                        <Footer />
                        <PWAInstallPrompt />
                      </div>
                    </ToastProvider>
                  </QueryProvider>
                </FavoritesProvider>
              </AuthProvider>
            </PerformanceProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
