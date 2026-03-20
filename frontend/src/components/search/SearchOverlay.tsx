'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Loader2, Gamepad2, Play, Star } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useSearchGame } from '@/features/games/hooks/useSearchGame';
import { cn } from '@/lib/utils';

interface SearchOverlayProps {
  searchData: ReturnType<typeof useSearchGame>;
}

export function SearchOverlay({ searchData }: SearchOverlayProps) {
  const { t } = useLanguage();
  const {
    searchValue,
    setSearchValue,
    isSearchOpen,
    setIsSearchOpen,
    suggestions,
    isSearching,
    handleInputChange,
    handleHotKeywordClick,
    handleSubmitSearch
  } = searchData;

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle "Click Outside" to close search overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isSearchOpen) return;
      if (searchContainerRef.current && searchContainerRef.current.contains(event.target as Node)) {
        return;
      }
      setIsSearchOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
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
              onChange={(e) => handleInputChange(e.target.value)}
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
                  <p className="text-muted-foreground text-sm">Không tìm thấy tựa game nào phù hợp với &quot;{searchValue}&quot;</p>
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
                {t('search.hot') || 'Khám phá'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Mario', 'Contra', 'Tetris', 'Zelda', 'Mega Man', 'Pokemon', 'Metroid'].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleHotKeywordClick(keyword)}
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
  );
}
