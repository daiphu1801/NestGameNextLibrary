'use client';

import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Zap, ZapOff, BookOpen, Gamepad2, X, Star, ArrowUp, Menu, Home } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { debounce, cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
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
              <NavLink href="/favorites" active={pathname === '/favorites'}>
                <span className="flex items-center gap-1.5">
                  <Star className="w-3 h-3" />
                  {t('nav.favorites')}
                </span>
              </NavLink>
              <NavLink href="/docs" active={pathname === '/docs'}>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" />
                  {t('nav.docs')}
                </span>
              </NavLink>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Search Button - Only on Library page */}
              {isLibraryPage && (
                <button
                  onClick={toggleSearch}
                  className="group flex items-center h-10 rounded-full hover:bg-white/5 transition-all duration-300 ease-out overflow-hidden"
                >
                  <div className={cn(
                    "w-10 h-10 flex-shrink-0 flex items-center justify-center transition-all duration-300",
                    isSearchOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                  )}>
                    {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                  </div>
                  {/* Expanding Text - Pushes to the right */}
                  {!isSearchOpen && (
                    <div className="overflow-hidden max-w-0 group-hover:max-w-[100px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                      <span className="pr-3 whitespace-nowrap text-xs font-semibold text-primary uppercase tracking-wider">
                        {t('header.search')}
                      </span>
                    </div>
                  )}
                </button>
              )}

              {/* Language Toggle - Shows on all screens */}
              <button
                onClick={toggleLanguage}
                className="px-2 sm:px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-xs font-bold font-mono-tech uppercase flex items-center gap-1.5 sm:gap-2"
              >
                <span className={locale === 'en' ? 'text-primary' : 'text-muted-foreground'}>EN</span>
                <div className="w-[1px] h-3 bg-white/10" />
                <span className={locale === 'vi' ? 'text-primary' : 'text-muted-foreground'}>VI</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all hover:scale-105 active:scale-95"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-400" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cyan-400" />
              </button>

              {/* Performance Mode Toggle Button */}
              <PerformanceToggleButton />

              {/* Mobile Menu Button - Right side */}
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
    </>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-300",
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

// Performance Toggle Button Component
function PerformanceToggleButton() {
  const { isLowPerformanceMode, togglePerformanceMode } = usePerformance();
  const { t } = useLanguage();

  return (
    <button
      onClick={togglePerformanceMode}
      className={cn(
        "hidden sm:flex group relative px-5 py-2 rounded-full font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95",
        isLowPerformanceMode
          ? "shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40"
          : "shadow-lg shadow-primary/25 hover:shadow-primary/40"
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
  );
}
