'use client';

import { useState, useEffect } from 'react';
import { Search, Moon, Sun, Zap, BookOpen, Gamepad2, X, Star, ArrowUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { debounce, cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
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
              <NavLink href="/" active={pathname === '/'}>{t('nav.home')}</NavLink>
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
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95",
                    isSearchOpen ? "bg-primary/20 text-primary" : "hover:bg-white/5"
                  )}
                >
                  {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                </button>
              )}

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-xs font-bold font-mono-tech uppercase hidden sm:flex items-center gap-2"
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

              {/* CTA Button */}
              <Link
                href="/library"
                className="hidden sm:flex group relative px-5 py-2 rounded-full font-bold text-sm overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient" />
                <div className="absolute inset-[1px] rounded-full bg-background" />
                <span className="relative flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent group-hover:text-primary transition-colors uppercase tracking-wider text-xs">
                  <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                  {isLandingPage ? (t('landing.exploreNow') || 'Khám Phá') : (t('header.play') || 'Play Now')}
                </span>
              </Link>
            </div>
          </div>

          {/* Search Bar - Expandable on Library page */}
          {isLibraryPage && isSearchOpen && (
            <div className="pb-4 animate-in slide-in-from-top-2 duration-200">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchValue}
                  onChange={handleInputChange}
                  autoFocus
                  className="w-full pl-12 pr-4 h-12 rounded-full bg-secondary/50 border border-white/10 focus:border-primary/50 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
              {/* Hot Keywords */}
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('search.hot')}:</span>
                <div className="flex gap-2">
                  {['Mario', 'Contra', 'Tetris', 'Zelda', 'Mega Man'].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => handleHotKeywordClick(keyword)}
                      className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

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
