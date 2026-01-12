import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { PerformanceProvider } from '@/components/providers/PerformanceProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { metadata as siteMetadata } from '@/config/site';

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <PerformanceProvider>
              <AuthProvider>
                <QueryProvider>
                  <ToastProvider>
                    <div className="flex min-h-screen flex-col relative">
                      <MobileWarning />
                      <div className="flex-1">
                        {children}
                      </div>
                      <Footer />
                    </div>
                  </ToastProvider>
                </QueryProvider>
              </AuthProvider>
            </PerformanceProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
