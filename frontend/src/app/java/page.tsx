'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { GameGrid } from '@/components/game/GameGrid';
import { gameService } from '@/services/gameService';
import { Smartphone } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Game } from '@/types';

export default function JavaPortalPage() {
  const { t } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const gamesPerPage = 25;

  const loadPage = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const result = await gameService.loadGamesPaginated({
        page: pageNum - 1, // API is 0-indexed
        size: gamesPerPage,
        system: 'j2me',
        sortBy: 'name',
        sortDir: 'asc',
      });
      setGames(result.games);
      setTotalPages(result.totalPages);
      setTotalGames(result.totalElements);
    } catch (error) {
      console.error('Failed to load J2ME games:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gamesPerPage]);

  useEffect(() => {
    loadPage(page);
  }, [page, loadPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading && games.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-teal-500/30 blur-3xl rounded-full" />
          <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto relative z-10" />
          <p className="text-base font-medium text-teal-400 animate-pulse relative z-10 font-tech uppercase tracking-wider">
            {t('game.loading')}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-foreground selection:bg-teal-500/30 relative">
      {/* Base background */}
      <div className="fixed inset-0 bg-background -z-20" />

      <Header />

      {/* Background Effects — teal-tinted like the library page */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.25) 0%, rgba(16, 185, 129, 0.1) 30%, transparent 70%)',
            filter: 'blur(40px)',
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.18) 0%, rgba(20, 184, 166, 0.08) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '5s',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '60px 60px',
            backgroundImage: `
              linear-gradient(to right, rgba(20, 184, 166, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(20, 184, 166, 0.06) 1px, transparent 1px)
            `,
          }}
        />
      </div>

      <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Page Header — simple, like /library */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-3 mb-1 sm:mb-2">
            <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-teal-400" />
            <h1 className="text-2xl sm:text-4xl font-black font-tech uppercase tracking-wider">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Java</span>{' '}
              <span className="text-foreground">Classics</span>
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('javaPortal.subtitle')}
          </p>
          <div className="mt-2 sm:mt-4 flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-teal-400 font-tech text-xl sm:text-2xl font-bold">{totalGames}</span>
              <span className="text-muted-foreground font-tech uppercase text-xs sm:text-base">{t('javaPortal.items')}</span>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <GameGrid
          games={games}
          totalGames={totalGames}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
}
