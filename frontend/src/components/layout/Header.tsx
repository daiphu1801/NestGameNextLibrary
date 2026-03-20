'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Moon, Sun, Zap, ZapOff, BookOpen, Gamepad2, X, Star, ArrowUp, Menu, Home, Trophy, Heart, Dices, Sparkles, ChevronDown, Crown, Play, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGameStore } from '@/features/games/store/gameStore';
import { debounce, cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Game } from '@/types';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { UserDropdown } from '@/components/auth';
import { USFlag, VietnamFlag } from '@/components/ui/Flags';
import { useSearchGame } from '@/features/games/hooks/useSearchGame';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { DisclaimerBanner } from '@/components/layout/DisclaimerBanner';
import { Navigation } from '@/components/layout/Navigation';
import { MobileMenu } from '@/components/layout/MobileMenu';
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { user, logout, openLoginModal } = useAuth();
  const searchData = useSearchGame();

  // Other States
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Check if first visit — show disclaimer banner + welcome popup
  useEffect(() => {
    const dismissed = localStorage.getItem('nestgame-disclaimer-dismissed');
    if (!dismissed) setShowDisclaimer(true);
    const welcomed = localStorage.getItem('nestgame-welcome-seen');
    if (!welcomed) {
      const timer = setTimeout(() => setShowWelcomePopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissDisclaimer = () => {
    setShowDisclaimer(false);
    localStorage.setItem('nestgame-disclaimer-dismissed', 'true');
  };

  const dismissWelcome = () => {
    setShowWelcomePopup(false);
    localStorage.setItem('nestgame-welcome-seen', 'true');
  };

  // Auth Modal States (Register and ForgotPassword still use local state)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const { allGames } = useGameStore();

  // Determine if we're on landing page or library pages
  const isLandingPage = pathname === '/';
  const isLibraryPage = pathname === '/library';

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'vi' : 'en');
  };

  return (
    <>
      {/* Guide Banner */}
      <DisclaimerBanner show={showDisclaimer} onDismiss={dismissDisclaimer} />

      <header className={cn(
        "sticky z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        showDisclaimer ? 'top-[37px] sm:top-[37px]' : 'top-0'
      )}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity shrink-0 min-w-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/game-console.png"
                  alt="NestGame Logo"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black tracking-tight font-tech leading-none">
                  <span className="bg-gradient-cyan bg-clip-text text-transparent">NEST</span>
                  <span className="text-foreground">GAME</span>
                </span>
                <span className="hidden sm:block text-[8px] text-muted-foreground tracking-[0.2em] uppercase font-medium">
                  Classic NES Emulator
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <Navigation
              pathname={pathname}
              showWelcomePopup={showWelcomePopup}
              dismissWelcome={dismissWelcome}
            />

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {/* Search (Global) */}
              <button
                onClick={searchData.toggleSearch}
                className="group flex items-center h-9 w-9 rounded-full hover:bg-white/5 transition-all duration-300 justify-center"
                title={t('header.search')}
              >
                <div className={cn(
                  "flex-shrink-0 flex items-center justify-center transition-all duration-300",
                  searchData.isSearchOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )}>
                  {searchData.isSearchOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Search className="h-4 w-4 sm:h-5 sm:w-5" />}
                </div>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
                title={mounted ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : 'Toggle theme'}
                suppressHydrationWarning
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-400" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cyan-400" />
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                title={locale === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
              >
                {/* Mobile: single active flag only (no text) */}
                <div className="sm:hidden flex items-center px-2 py-1.5">
                  {locale === 'en'
                    ? <USFlag className="w-4 h-4 rounded-[2px]" />
                    : <VietnamFlag className="w-4 h-4 rounded-[2px]" />
                  }
                </div>
                {/* Desktop: both flags */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-tech uppercase">
                  <div className={cn("flex items-center gap-1.5", locale === 'en' ? 'text-primary opacity-100' : 'text-muted-foreground opacity-50 hover:opacity-100 transition-opacity')}>
                    <USFlag className="w-3.5 h-3.5 rounded-[2px] object-cover shadow-sm" />
                    <span>EN</span>
                  </div>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <div className={cn("flex items-center gap-1.5", locale === 'vi' ? 'text-primary opacity-100' : 'text-muted-foreground opacity-50 hover:opacity-100 transition-opacity')}>
                    <VietnamFlag className="w-3.5 h-3.5 rounded-[2px] object-cover shadow-sm" />
                    <span>VI</span>
                  </div>
                </div>
              </button>

              {/* Performance Toggle (hidden on mobile) */}
              <PerformanceToggleButton />

              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-white/10 mx-0.5" />

              {/* User */}
              <UserDropdown
                user={user}
                onLogin={openLoginModal}
                onLogout={logout}
              />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition-all"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Spotlight Search Overlay */}
          <SearchOverlay searchData={searchData} />
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pathname={pathname}
        showDisclaimer={showDisclaimer}
      />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary/90 text-white shadow-lg shadow-primary/30 flex items-center justify-center transition-all duration-300 hover:bg-primary hover:scale-110 active:scale-95",
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>



    </>
  );
}


// Performance Toggle Button Component with First-time Tooltip
function PerformanceToggleButton() {
  const { isLowPerformanceMode, togglePerformanceMode } = usePerformance();
  const { t } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(true); // Default true to avoid flash

  // Check if user has seen the tooltip before
  useEffect(() => {
    const seen = localStorage.getItem('nestgame-perf-tooltip-seen');
    if (!seen) {
      // Show tooltip after a short delay
      const timer = setTimeout(() => setShowTooltip(true), 2000);
      setHasSeenTooltip(false);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClick = () => {
    togglePerformanceMode();
    // Hide tooltip and mark as seen
    if (showTooltip) {
      setShowTooltip(false);
      localStorage.setItem('nestgame-perf-tooltip-seen', 'true');
    }
  };

  const dismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    localStorage.setItem('nestgame-perf-tooltip-seen', 'true');
  };

  return (
    <div className="relative hidden sm:block">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Arrow */}
          <div className="absolute -top-2 right-6 w-4 h-4 bg-card rotate-45 border-l border-t border-white/10" />

          {/* Tooltip Content */}
          <div className="relative bg-card border border-white/10 rounded-2xl p-5 shadow-2xl w-80">
            <button
              onClick={dismissTooltip}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-lg"
            >
              ×
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 pr-4">
                <h4 className="font-bold text-base text-foreground mb-1.5">
                  {t('performance.tooltipTitle') || 'Tối ưu trải nghiệm'}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('performance.tooltipDesc') || 'Bật chế độ Tiết kiệm để giảm hiệu ứng hình ảnh, giúp giao diện phản hồi nhanh hơn.'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleClick}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 text-primary text-sm font-semibold hover:from-primary/30 hover:to-accent/30 transition-all"
              >
                {t('performance.tryIt') || 'Thử ngay'}
              </button>
              <button
                onClick={dismissTooltip}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-muted-foreground text-sm font-medium hover:bg-white/10 transition-colors"
              >
                {t('performance.dismiss') || 'Để sau'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleClick}
        className={cn(
          "group relative px-5 py-2 rounded-full font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95",
          isLowPerformanceMode
            ? "shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40"
            : "shadow-lg shadow-primary/25 hover:shadow-primary/40",
          showTooltip && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
        title={isLowPerformanceMode
          ? (t('performance.modeOn') || 'Low Performance Mode: ON')
          : (t('performance.modeOff') || 'Low Performance Mode: OFF')
        }
      >
        {/* Gradient Border */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r bg-[length:200%_auto]",
          isLowPerformanceMode
            ? "from-yellow-500 via-orange-500 to-yellow-500"
            : "from-primary via-accent to-primary animate-gradient"
        )} />
        {/* Inner Background */}
        <div className="absolute inset-[1px] rounded-full bg-background" />
        {/* Content */}
        <span className={cn(
          "relative flex items-center gap-2 uppercase tracking-wider text-xs transition-colors",
          isLowPerformanceMode
            ? "text-yellow-400"
            : "bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent group-hover:text-primary"
        )}>
          {isLowPerformanceMode ? (
            <ZapOff className="w-3.5 h-3.5 text-yellow-400" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
          )}
          {isLowPerformanceMode
            ? (t('performance.lowMode') || 'Tiết kiệm')
            : (t('performance.normalMode') || 'Hiệu ứng')
          }
        </span>
      </button>
    </div>
  );
}

