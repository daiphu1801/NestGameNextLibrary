'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { GameGrid } from '@/components/game/GameGrid';
import { JavaFilterBar, J2ME_PUBLISHERS } from '@/components/search/JavaFilterBar';
import { gameService } from '@/services/gameService';
import { Smartphone } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Game, SortOption } from '@/types';

export default function JavaPortalPage() {
  const { t } = useLanguage();
  const [allJ2meGames, setAllJ2meGames] = useState<Game[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [sort, setSort] = useState<SortOption>('name-asc');
  const [publisher, setPublisher] = useState('');

  const gamesPerPage = 25;

  // Load ALL J2ME games once (they're only ~299 games, small enough)
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      try {
        const result = await gameService.loadGamesPaginated({
          page: 0,
          size: 9999, // load all J2ME games at once
          system: 'j2me',
          sortBy: 'name',
          sortDir: 'asc',
        });
        setAllJ2meGames(result.games);
      } catch (error) {
        console.error('Failed to load J2ME games:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  // Client-side filtering by publisher keywords + sort
  const filteredGames = useMemo(() => {
    let games = [...allJ2meGames];

    // Publisher keyword filter
    if (publisher) {
      const pub = J2ME_PUBLISHERS.find(p => p.id === publisher);
      if (pub && 'keywords' in pub && pub.keywords) {
        const keywords = (pub as any).keywords as string[];
        games = games.filter(g =>
          keywords.some(kw => g.name.toLowerCase().includes(kw.toLowerCase()))
        );
      }
    }

    // Sort
    const [sortBy, sortDir] = sort.split('-');
    games.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name, 'vi');
      } else if (sortBy === 'rating') {
        cmp = (a.rating || 0) - (b.rating || 0);
      } else if (sortBy === 'year') {
        cmp = (a.year || 0) - (b.year || 0);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return games;
  }, [allJ2meGames, publisher, sort]);

  // Pagination
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const paginatedGames = useMemo(() => {
    const start = (page - 1) * gamesPerPage;
    return filteredGames.slice(start, start + gamesPerPage);
  }, [filteredGames, page, gamesPerPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePublisherChange = (pub: string) => {
    setPublisher(pub);
    setPage(1);
  };

  const resetAllFilters = () => {
    setSort('name-asc');
    setPublisher('');
    setPage(1);
  };

  const hasActiveFilters = sort !== 'name-asc' || publisher !== '';

  if (isLoading && allJ2meGames.length === 0) {
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
      <div className="fixed inset-0 bg-background -z-20" />
      <Header />

      {/* Background Effects */}
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
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
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
          <div className="mt-2 sm:mt-3 flex items-center gap-2">
            <span className="text-teal-400 font-tech text-xl sm:text-2xl font-bold">{filteredGames.length}</span>
            <span className="text-muted-foreground font-tech uppercase text-xs sm:text-base">{t('javaPortal.items')}</span>
          </div>
        </div>

        {/* ── Java Filter Bar ──────────────────────────────────── */}
        <div className="mb-4 sm:mb-6">
          <JavaFilterBar
            publisher={publisher}
            sort={sort}
            onPublisherChange={handlePublisherChange}
            onSortChange={handleSortChange}
            onReset={resetAllFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Game Grid */}
        <GameGrid
          games={paginatedGames}
          totalGames={filteredGames.length}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
}
