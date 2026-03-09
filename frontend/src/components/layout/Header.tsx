'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Moon, Sun, Zap, ZapOff, BookOpen, Gamepad2, X, Star, ArrowUp, Menu, Home, Trophy, Heart, Dices, Sparkles, ChevronDown, Crown, Play, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { debounce, cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Game } from '@/types';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { UserDropdown } from '@/components/auth';
import { USFlag, VietnamFlag } from '@/components/ui/Flags';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const { user, logout, openLoginModal } = useAuth();

  // Search State
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Other States
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);

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

  // Handle live search
  const fetchSuggestions = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      const results = gameService.searchGames(allGames, query);
      setSuggestions(results);
      setIsSearching(false);
    }, 300),
    [allGames]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsSearching(true);
    fetchSuggestions(value);
  };

  const handleSubmitSearch = () => {
    if (!searchValue.trim()) return;
    setIsSearchOpen(false);

    setSearchQuery(searchValue);

    if (pathname === '/library' || pathname === '/featured') {
      let filtered = gameService.searchGames(allGames, searchValue);
      filtered = gameService.filterByCategory(filtered, currentCategory);
      filtered = gameService.filterByRegion(filtered, currentRegion);
      filtered = gameService.sortGames(filtered, currentSort);
      setFilteredGames(filtered);
    } else {
      router.push('/library');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'vi' : 'en');
  };

  const handleHotKeywordClick = (keyword: string) => {
    setSearchValue(keyword);
    setIsSearching(true);
    fetchSuggestions(keyword);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchValue('');
    }
  };

  // ---------------------------------------------------------------------------
  // NATIVE BROWSER EVENT: Handle "Click Outside" to close search overlay
  // ---------------------------------------------------------------------------
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Bỏ qua nếu khung Tìm Kiếm đang ĐÓNG
      if (!isSearchOpen) return;

      // Bỏ qua nếu người dùng click CHUỘT VÀO BêN TRONG `searchContainerRef`
      if (searchContainerRef.current && searchContainerRef.current.contains(event.target as Node)) {
        return;
      }

      // Click Chuột RA NGOÀI vùng Container -> ĐÓNG KHUNG tìm kiếm
      setIsSearchOpen(false);
    };

    // Đăng ký Event Listener Native
    document.addEventListener('mousedown', handleClickOutside);

    // Dọn dẹp listener khi component Unmount hoặc Dependencies (isSearchOpen) thay đổi
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

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
                <span className="text-base sm:text-lg font-black tracking-tight font-mono-tech leading-none">
                  <span className="text-gradient-cyan">NEST</span>
                  <span className="text-foreground">GAME</span>
                </span>
                <span className="hidden sm:block text-[8px] text-muted-foreground tracking-[0.2em] uppercase font-medium">
                  Classic NES Emulator
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
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

              <NavLink href="/featured" active={pathname === '/featured'}>
                <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Crown className="w-3 h-3" />
                  {t('nav.featured', undefined, 'Nổi Bật')}
                </span>
              </NavLink>

              <div
                className="relative"
                onMouseEnter={() => setIsExploreOpen(true)}
                onMouseLeave={() => setIsExploreOpen(false)}
              >
                <button
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap flex items-center gap-1",
                    (pathname === '/random' || pathname === '/leaderboard')
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  {t('nav.explore')}
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    isExploreOpen && "rotate-180"
                  )} />
                </button>

                {/* Dropdown Menu */}
                {isExploreOpen && (
                  <div className="absolute top-full left-0 pt-1 w-48 z-[200]">
                    <div className="bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/random"
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-primary/10",
                          pathname === '/random' ? "text-primary bg-primary/5" : "text-foreground"
                        )}
                      >
                        <Dices className="w-4 h-4" />
                        <span>{t('nav.random')}</span>
                      </Link>
                      <div className="h-px bg-white/5" />
                      <Link
                        href="/leaderboard"
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-primary/10",
                          pathname === '/leaderboard' ? "text-primary bg-primary/5" : "text-foreground"
                        )}
                      >
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>{t('nav.leaderboard')}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Link
                  href="/docs"
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap inline-flex",
                    pathname === '/docs'
                      ? "bg-primary/10"
                      : "hover:bg-white/5"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-primary" />
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text font-black" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {t('nav.docs')}
                    </span>
                  </span>
                </Link>
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
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
              {/* Search (Global) */}
              <button
                onClick={toggleSearch}
                className="group flex items-center h-9 w-9 rounded-full hover:bg-white/5 transition-all duration-300 justify-center"
                title={t('header.search')}
              >
                <div className={cn(
                  "flex-shrink-0 flex items-center justify-center transition-all duration-300",
                  isSearchOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )}>
                  {isSearchOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Search className="h-4 w-4 sm:h-5 sm:w-5" />}
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
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono-tech uppercase">
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
          {isSearchOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300"
                onMouseDown={() => setIsSearchOpen(false)}
              />

              {/* Search Container */}
              <div
                ref={searchContainerRef}
                className="relative w-full max-w-3xl animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300 flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Box */}
                <div className={cn(
                  "relative bg-secondary/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-primary/10 transition-all duration-300 shrink-0",
                  searchValue.trim() ? "rounded-t-2xl border-b-white/5" : "rounded-2xl"
                )}>
                  {/* Search Input */}
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 h-6 w-6 text-primary" />
                    <input
                      type="text"
                      placeholder={t('header.searchPlaceholder') || "Tìm kiếm game..."}
                      value={searchValue}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmitSearch();
                        }
                        if (e.key === 'Escape') {
                          setIsSearchOpen(false);
                        }
                      }}
                      autoFocus
                      className="w-full pl-16 pr-32 py-5 bg-transparent text-xl font-medium placeholder:text-muted-foreground/50 focus:outline-none text-foreground"
                    />
                    <div className="absolute right-4 flex items-center gap-2">
                      {/* Loading Spinner */}
                      {isSearching && (
                        <Loader2 className="w-5 h-5 animate-spin text-primary opacity-70 mr-1" />
                      )}

                      {/* Clear Button */}
                      {searchValue && !isSearching && (
                        <button
                          onClick={() => {
                            setSearchValue('');
                            setSuggestions([]);
                          }}
                          className="px-2 py-1 flex items-center gap-1 rounded-md bg-white/5 hover:bg-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                        >
                          <X className="h-3 w-3" />
                          Xóa
                        </button>
                      )}
                      <kbd className="hidden sm:inline-flex px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-muted-foreground">
                        ESC
                      </kbd>
                    </div>
                  </div>
                </div>

                {/* Live Search Results Dropdown */}
                {searchValue.trim() && (
                  <div className="bg-secondary/95 backdrop-blur-xl border border-t-0 border-white/10 rounded-b-2xl shadow-2xl overflow-hidden flex flex-col flex-1 min-h-0">
                    <div className="overflow-y-auto p-2 custom-scrollbar">
                      {suggestions.length > 0 ? (
                        <div className="space-y-1">
                          {suggestions.slice(0, 5).map((game) => (
                            <Link
                              key={game.id}
                              href={`/games/${game.id}/play`}
                              onClick={() => setIsSearchOpen(false)}
                              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200"
                            >
                              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black/50 shrink-0 border border-white/5">
                                {game.thumbnail ? (
                                  <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-muted-foreground/50" /></div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-5 h-5 fill-white text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{game.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                  <span className="capitalize">{game.categoryName || game.category}</span>
                                  {game.playCount !== undefined && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                                      <span>{game.playCount.toLocaleString()} lượt chơi</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}

                          {suggestions.length > 5 && (
                            <button
                              onClick={handleSubmitSearch}
                              className="w-full mt-2 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:text-primary-focus bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors"
                            >
                              <Search className="w-4 h-4" />
                              Xem tất cả {suggestions.length} kết quả
                            </button>
                          )}
                        </div>
                      ) : !isSearching ? (
                        <div className="px-6 py-12 text-center flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <Search className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                          <p className="text-muted-foreground text-sm">Không tìm thấy tựa game nào phù hợp với "{searchValue}"</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Hot Keywords (Only show when search is empty) */}
                {!searchValue.trim() && (
                  <div className="bg-secondary/95 backdrop-blur-xl border border-t-0 border-white/10 rounded-b-2xl shadow-2xl p-4">
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
                            setSearchValue(keyword);
                            setIsSearching(true);
                            fetchSuggestions(keyword);
                          }}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 text-sm font-medium transition-all duration-200 hover:scale-105"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>

                    {/* Hint */}
                    <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↵</kbd>
                        {t('header.searchHint') || 'để tìm kiếm'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div
            className="container mx-auto px-4 pb-8 overflow-y-auto h-full"
            style={{ paddingTop: showDisclaimer ? '148px' : '104px' }}
          >
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
                href="/featured"
                icon={<Crown className="w-5 h-5 text-amber-500" />}
                active={pathname === '/featured'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.featured', undefined, 'Nổi Bật')}
              </MobileNavLink>

              {/* Explore Section */}
              <div className="my-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('nav.explore')}</span>
                </div>
                <div className="ml-4 flex flex-col gap-1">
                  <MobileNavLink
                    href="/random"
                    icon={<Dices className="w-4 h-4" />}
                    active={pathname === '/random'}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.random')}
                  </MobileNavLink>
                  <MobileNavLink
                    href="/leaderboard"
                    icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                    active={pathname === '/leaderboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.leaderboard')}
                  </MobileNavLink>
                </div>
              </div>

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
        "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap",
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

