import { useState } from 'react';
import { Search, Moon, Sun, Rocket, Zap, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { debounce } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const {
    allGames,
    currentCategory,
    setSearchQuery,
    setFilteredGames
  } = useGameStore();

  const handleSearch = debounce((query: string) => {
    setSearchQuery(query);

    let filtered = gameService.searchGames(allGames, query);
    filtered = gameService.filterByCategory(filtered, currentCategory);

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

  const scrollToLibrary = () => {
    // Smooth scroll to library
    const librarySection = document.getElementById('library');
    if (librarySection) {
      librarySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayNow = scrollToLibrary;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      scrollToLibrary();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Rocket className="w-5 h-5 fill-current" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tight font-mono-tech flex flex-col leading-none">
              <span className="text-gradient-cyan">NEST</span>
              <span className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase">Emulator</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active>{t('nav.home')}</NavLink>
            <NavLink href="/#library">{t('nav.library')}</NavLink>
            <NavLink href="/favorites">{t('nav.favorites')}</NavLink>
            <NavLink href="/docs">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                {t('nav.docs')}
              </span>
            </NavLink>
          </nav>

          {/* Search - Desktop */}
          <div className="hidden lg:flex flex-col flex-1 max-w-sm gap-2">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 h-10 rounded-full bg-secondary/30 border border-white/5 focus:border-primary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            {/* Hot Keywords */}
            <div className="flex items-center gap-2 px-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hot:</span>
              <div className="flex gap-1.5">
                {['Mario', 'Contra', 'Tetris', 'Zelda'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => {
                      setSearchValue(keyword);
                      handleSearch(keyword);
                      scrollToLibrary();
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase tracking-wide font-medium"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
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

            {/* Play CTA Button */}
            <button
              onClick={handlePlayNow}
              className="hidden sm:flex group relative px-6 py-2.5 rounded-full font-bold text-sm overflow-hidden shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient" />
              <div className="absolute inset-[1px] rounded-full bg-background" />
              <span className="relative flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent group-hover:text-primary transition-colors uppercase tracking-wider">
                <Zap className="w-4 h-4 text-primary fill-primary group-hover:animate-bounce" />
                {t('header.play')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`
        px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all duration-300
        ${active
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
        }
      `}
    >
      {children}
    </Link>
  );
}
