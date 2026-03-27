'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { GameGrid } from '@/components/game/GameGrid';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { validateEnv } from '@/config/env';
import { Zap } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function FlashPortalPage() {
  const { allGames, isLoading: isGamesLoading, setGames } = useGameStore();
  const { t } = useLanguage();

  useEffect(() => {
    validateEnv();
    const loadGames = async () => {
      const games = await gameService.loadGames();
      setGames(games);
    };
    loadGames();
  }, [setGames]);

  const filteredGames = useMemo(() => allGames.filter(g => g.system === 'flash'), [allGames]);
  const [page, setPage] = useState(1);
  const gamesPerPage = 25;

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const paginatedGames = useMemo(() => {
    const start = (page - 1) * gamesPerPage;
    return filteredGames.slice(start, start + gamesPerPage);
  }, [filteredGames, page, gamesPerPage]);

  const isLoading = isGamesLoading && allGames.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full" />
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto relative z-10" />
          <p className="text-base font-medium text-orange-400 animate-pulse relative z-10 font-tech uppercase tracking-wider">
            {t('game.loading')}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-foreground selection:bg-orange-500/30 relative">
      {/* Base background */}
      <div className="fixed inset-0 bg-background -z-20" />

      <Header />

      {/* Background Effects — orange-tinted */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(234, 88, 12, 0.25) 0%, rgba(225, 29, 72, 0.1) 30%, transparent 70%)',
            filter: 'blur(40px)',
            animationDuration: '4s',
          }}
        />
        <div
          className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(234, 88, 12, 0.08) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '5s',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: '60px 60px',
            backgroundImage: `
              linear-gradient(to right, rgba(234, 88, 12, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(234, 88, 12, 0.06) 1px, transparent 1px)
            `,
          }}
        />
      </div>

      <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Page Header — simple, like /library */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-3 mb-1 sm:mb-2">
            <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400 fill-orange-400" />
            <h1 className="text-2xl sm:text-4xl font-black font-tech uppercase tracking-wider">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Flash</span>{' '}
              <span className="text-foreground">Classics</span>
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('flashPortal.subtitle')}
          </p>
          <div className="mt-2 sm:mt-4 flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-orange-400 font-tech text-xl sm:text-2xl font-bold">{filteredGames.length}</span>
              <span className="text-muted-foreground font-tech uppercase text-xs sm:text-base">{t('flashPortal.items')}</span>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <GameGrid
          games={paginatedGames}
          totalGames={filteredGames.length}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </main>
  );
}
