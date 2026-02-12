'use client';

import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Zap, ZapOff, BookOpen, Gamepad2, X, Star, ArrowUp, Menu, Home, Trophy, Heart, Dices, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { debounce, cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { LoginModal, RegisterModal, ForgotPasswordModal, UserDropdown } from '@/components/auth';

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { user, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

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

  const {
    allGames,
    currentCategory,
    currentRegion,
    currentSort,
    setSearchQuery,
    setFilteredGames
  } = useGameStore();

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

  const handleSearch = debounce((query: string) => {
    setSearchQuery(query);

    let filtered = gameService.searchGames(allGames, query);
    filtered = gameService.filterByCategory(filtered, currentCategory);
    filtered = gameService.filterByRegion(filtered, currentRegion);
    filtered = gameService.sortGames(filtered, currentSort);

    setFilteredGames(filtered);
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    handleSearch(value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'vi' : 'en');
  };

  const handleHotKeywordClick = (keyword: string) => {
    setSearchValue(keyword);
    handleSearch(keyword);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchValue('');
    }
  };

  return (
    <>
      {/* Guide Banner */}
      {showDisclaimer && (
        <div className="sticky top-0 z-[51] w-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20 backdrop-blur-xl">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-between gap-3 py-2">
              <Link href="/docs" className="flex items-center gap-2.5 flex-1 min-w-0 group" onClick={dismissDisclaimer}>
                <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs sm:text-sm text-foreground/80 truncate">
                  <span className="font-semibold text-primary">Hướng dẫn:</span>{' '}
                  <span className="group-hover:text-primary transition-colors">Tìm hiểu cách chơi, cấu hình phím và các tính năng của NestGame →</span>
                </p>
              </Link>
              <button
                onClick={dismissDisclaimer}
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all flex-shrink-0 cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <header className={cn(
        "sticky z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        showDisclaimer ? 'top-[37px] sm:top-[37px]' : 'top-0'
      )}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0">
              <div className="relative w-12 h-12 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/game-console.png"
                  alt="NestGame Logo"
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight font-mono-tech leading-none">
                  <span className="text-gradient-cyan">NEST</span>
                  <span className="text-foreground">GAME</span>
                </span>
                <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase font-medium">
                  Classic NES Emulator
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <NavLink href="/" active={pathname === '/'}>
                <span className="flex items-center gap-1.5">
                  <Home className="w-3 h-3" />
                  {t('nav.home')}
                </span>
              </NavLink>
              <NavLink href="/library" active={pathname === '/library'}>
                <span className="flex items-center gap-1.5">
                  <Gamepad2 className="w-3 h-3" />
                  {t('nav.library')}
                </span>
              </NavLink>
              <NavLink href="/leaderboard" active={pathname === '/leaderboard'}>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  {t('nav.leaderboard')}
                </span>
              </NavLink>
              <NavLink href="/random" active={pathname === '/random'}>
                <span className="flex items-center gap-1.5">
                  <Dices className="w-3 h-3 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:text-primary transition-all font-black">
                    {t('nav.random')}
                  </span>
                </span>
              </NavLink>
              <div className="relative">
                <NavLink href="/docs" active={pathname === '/docs'}>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" />
                    {t('nav.docs')}
                  </span>
                </NavLink>
                {/* Small welcome tooltip */}
                {showWelcomePopup && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card rotate-45 border-l border-t border-primary/30" />
                    <div className="relative bg-card/95 backdrop-blur-xl border border-primary/30 rounded-xl shadow-lg shadow-primary/10 px-4 py-3 w-[220px]">
                      <button
                        onClick={dismissWelcome}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-xs font-bold text-foreground">{t('header.welcomeTooltip.title')}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {t('header.welcomeTooltip.content')}
                      </p>
                      <Link
                        href="/docs"
                        onClick={dismissWelcome}
                        className="mt-2 flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold transition-all"
                      >
                        <BookOpen className="w-3 h-3" />
                        {t('header.welcomeTooltip.action')}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              {/* Group 1: Search + Keyboard */}
              {isLibraryPage && (
                <button
                  onClick={toggleSearch}
                  className="group flex items-center h-10 rounded-full hover:bg-white/5 transition-all duration-300 ease-out overflow-hidden"
                  title={t('header.search')}
                >
                  <div className={cn(
                    "w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all duration-300",
                    isSearchOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                  </div>
                </button>
              )}

              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-white/10 mx-0.5" />

              {/* Group 2: Theme + Language */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-400" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cyan-400" />
              </button>

              <button
                onClick={toggleLanguage}
                className="px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-xs font-bold font-mono-tech uppercase flex items-center gap-1.5 sm:gap-2"
              >
                <span className={locale === 'en' ? 'text-primary' : 'text-muted-foreground'}>EN</span>
                <div className="w-[1px] h-3 bg-white/10" />
                <span className={locale === 'vi' ? 'text-primary' : 'text-muted-foreground'}>VI</span>
              </button>

              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-white/10 mx-0.5" />

              {/* Group 3: Performance */}
              <PerformanceToggleButton />

              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-white/10 mx-0.5" />

              {/* Group 4: User */}
              <UserDropdown
                user={user}
                onLogin={openLoginModal}
                onLogout={logout}
              />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Spotlight Search Overlay */}
          {isLibraryPage && isSearchOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={() => setIsSearchOpen(false)}
              />

              {/* Search Container */}
              <div className="relative w-full max-w-2xl animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300">
                {/* Search Box */}
                <div className="relative bg-secondary/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
                  {/* Search Input */}
                  <div className="relative flex items-center">
                    <Search className="absolute left-5 h-6 w-6 text-primary" />
                    <input
                      type="text"
                      placeholder={t('header.searchPlaceholder')}
                      value={searchValue}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(searchValue);
                          setIsSearchOpen(false);
                        }
                        if (e.key === 'Escape') {
                          setIsSearchOpen(false);
                        }
                      }}
                      autoFocus
                      className="w-full pl-14 pr-32 py-5 bg-transparent text-xl font-medium placeholder:text-muted-foreground/50 focus:outline-none"
                    />
                    <div className="absolute right-4 flex items-center gap-2">
                      {/* Clear Button */}
                      {searchValue && (
                        <button
                          onClick={() => setSearchValue('')}
                          className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Xóa
                        </button>
                      )}
                      <kbd className="hidden sm:inline-flex px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-muted-foreground">
                        ESC
                      </kbd>
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                  {/* Hot Keywords */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Star className="w-3 h-3" />
                        {t('search.hot')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Mario', 'Contra', 'Tetris', 'Zelda', 'Mega Man', 'Pokemon', 'Metroid'].map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => {
                            handleHotKeywordClick(keyword);
                            setIsSearchOpen(false);
                          }}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 text-sm font-medium transition-all duration-200 hover:scale-105"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hint */}
                  <div className="px-4 pb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↵</kbd>
                      {t('header.searchHint') || 'để tìm kiếm'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <nav className="flex flex-col gap-2">
              <MobileNavLink
                href="/"
                icon={<Home className="w-5 h-5" />}
                active={pathname === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </MobileNavLink>
              <MobileNavLink
                href="/library"
                icon={<Gamepad2 className="w-5 h-5" />}
                active={pathname === '/library'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.library')}
              </MobileNavLink>
              <MobileNavLink
                href="/favorites"
                icon={<Star className="w-5 h-5" />}
                active={pathname === '/favorites'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.favorites')}
              </MobileNavLink>
              <MobileNavLink
                href="/docs"
                icon={<BookOpen className="w-5 h-5" />}
                active={pathname === '/docs'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.docs')}
              </MobileNavLink>
            </nav>

            {/* Mobile CTA */}
            <div className="mt-8">
              <Link
                href="/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg shadow-primary/30"
              >
                <Zap className="w-5 h-5" />
                {t('header.play')}
              </Link>
            </div>
          </div>
        </div>
      )}

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

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={() => {
          closeLoginModal();
          setIsRegisterOpen(true);
        }}
        onForgotPassword={() => {
          closeLoginModal();
          setIsForgotPasswordOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          openLoginModal();
        }}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onBackToLogin={() => {
          setIsForgotPasswordOpen(false);
          openLoginModal();
        }}
      />

    </>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap",
        active
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  icon,
  active,
  onClick
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-bold transition-all",
        active
          ? "text-primary bg-primary/10"
          : "text-foreground hover:bg-white/5"
      )}
    >
      <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
      {children}
    </Link>
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

