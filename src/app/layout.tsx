import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { LanguageProvider } from '@/components/providers/LanguageProvider';
import { metadata as siteMetadata } from '@/config/site';

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <QueryProvider>{children}</QueryProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
