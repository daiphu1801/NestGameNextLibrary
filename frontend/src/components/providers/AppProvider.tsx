'use client';

import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { LanguageProvider } from './LanguageProvider';
import { PerformanceProvider } from './PerformanceProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import { FavoritesProvider } from './FavoritesProvider';
import { LoadingProvider } from './LoadingProvider';
import { PWARegister } from './PWARegister';
import { ErrorBoundary } from './ErrorBoundary';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <PWARegister />
      <LoadingProvider>
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
                      {children}
                    </ToastProvider>
                  </QueryProvider>
                </FavoritesProvider>
              </AuthProvider>
            </PerformanceProvider>
          </LanguageProvider>
        </ThemeProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}
