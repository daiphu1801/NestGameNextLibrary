'use client';

import { useRouter } from 'next/navigation';
import { GameCard } from './GameCard';
import { Game } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PERFORMANCE_CONFIG } from '@/config/categories';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GameGridProps {
  games: Game[];
  totalGames: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function GameGrid({ games, totalGames, currentPage, totalPages, onPageChange }: GameGridProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handlePlayClick = (game: Game) => {
    router.push(`/games/${game.id}/play`);
  };

  const handleDetailsClick = (game: Game) => {
    router.push(`/games/${game.id}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (totalGames === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center animate-bounce">
          <span className="text-6xl">👾</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{t('search.noResults')}</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {t('search.tryOther')}
          </p>
        </div>
        <Button
          className="rounded-full"
          onClick={() => onPageChange(1)}
        >
          {t('search.clearSearch')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-muted-foreground gap-1 flex">
          {t('pagination.showing')} <span className="text-foreground">{games.length}</span> {t('pagination.of')}{' '}
          <span className="text-foreground">{totalGames}</span> {t('pagination.games')}
        </p>

        {totalPages > 1 && (
          <p className="text-sm text-muted-foreground gap-1 flex">
            {t('pagination.page')} <span className="font-semibold text-foreground">{currentPage}</span> {t('pagination.of')}{' '}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => handleDetailsClick(game)}
            onPlayClick={() => handlePlayClick(game)}
            onDetailsClick={() => handleDetailsClick(game)}
            priority={index < PERFORMANCE_CONFIG.IMAGE_PRIORITY_COUNT}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 pt-8 pb-4">
          {/* Page info */}
          <p className="text-sm text-muted-foreground">
            {t('pagination.showing')} <span className="text-primary font-semibold">{(currentPage - 1) * 25 + 1}-{Math.min(currentPage * 25, totalGames)}</span> {t('pagination.of')} <span className="text-foreground font-semibold">{totalGames}</span> {t('pagination.games')}
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
            {/* First Page Button — hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onPageChange(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className="hidden sm:flex rounded-lg bg-card hover:bg-white/10 disabled:opacity-30 w-10 h-10 sm:w-12 sm:h-12"
              title="First page"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-3" />
            </Button>

            {/* Previous Page Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="rounded-lg bg-card hover:bg-white/10 disabled:opacity-30 w-10 h-10 sm:w-12 sm:h-12"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {(() => {
                const pages: number[] = [];
                const showPages = 3; // Show 3 page numbers

                let start = Math.max(1, currentPage - 1);
                let end = Math.min(totalPages, start + showPages - 1);

                // Adjust start if end is at max
                if (end === totalPages) {
                  start = Math.max(1, end - showPages + 1);
                }

                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }

                return (
                  <>
                    {pages.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          onPageChange(pageNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300",
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                            : "bg-card hover:bg-white/10 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Ellipsis and Last Page */}
                    {end < totalPages && (
                      <>
                        <span className="w-6 sm:w-8 h-10 sm:h-12 flex items-center justify-center text-muted-foreground font-semibold text-xs sm:text-sm">
                          ...
                        </span>
                        <button
                          onClick={() => {
                            onPageChange(totalPages);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={cn(
                            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300",
                            currentPage === totalPages
                              ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                              : "bg-card hover:bg-white/10 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Next Page Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-card hover:bg-white/10 disabled:opacity-30 w-10 h-10 sm:w-12 sm:h-12"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Last Page Button — hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onPageChange(totalPages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className="hidden sm:flex rounded-lg bg-card hover:bg-white/10 disabled:opacity-30 w-10 h-10 sm:w-12 sm:h-12"
              title="Last page"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
