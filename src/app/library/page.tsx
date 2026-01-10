'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { Header } from '@/components/layout/Header';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { FilterToolbar } from '@/components/search/FilterToolbar';
import { GameGrid } from '@/components/game/GameGrid';
import { GameModal } from '@/components/game/GameModal';
import { validateEnv } from '@/config/env';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useState } from 'react';
import { Game } from '@/types';
import { X, Search, RotateCcw } from 'lucide-react';

// Search Indicator Component - Shows when filters are active
function SearchIndicator() {
    const { t } = useLanguage();
    const {
        searchQuery,
        currentCategory,
        currentRegion,
        allGames,
        setSearchQuery,
        setCategory,
        setRegion,
        setSort,
        setFilteredGames
    } = useGameStore();

    const hasActiveFilters = searchQuery || currentCategory !== 'all' || currentRegion !== 'all';

    if (!hasActiveFilters) return null;

    const resetAllFilters = () => {
        setSearchQuery('');
        setCategory('all');
        setRegion('all');
        setSort('name-asc');
        setFilteredGames(gameService.sortGames(allGames, 'name-asc'));
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search Query Badge */}
            {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
                    <Search className="w-3 h-3 text-primary" />
                    <span className="text-sm font-medium text-primary">"{searchQuery}"</span>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            // Re-apply other filters without search
                            let filtered = allGames;
                            filtered = gameService.filterByCategory(filtered, currentCategory);
                            filtered = gameService.filterByRegion(filtered, currentRegion);
                            setFilteredGames(filtered);
                        }}
                        className="w-4 h-4 rounded-full bg-primary/30 hover:bg-primary/50 flex items-center justify-center transition-colors"
                    >
                        <X className="w-2.5 h-2.5 text-primary" />
                    </button>
                </div>
            )}

            {/* Category Badge */}
            {currentCategory !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                    <span className="text-sm font-medium text-cyan-400">{currentCategory}</span>
                    <button
                        onClick={() => {
                            setCategory('all');
                            let filtered = allGames;
                            filtered = gameService.searchGames(filtered, searchQuery);
                            filtered = gameService.filterByRegion(filtered, currentRegion);
                            setFilteredGames(filtered);
                        }}
                        className="w-4 h-4 rounded-full bg-cyan-500/30 hover:bg-cyan-500/50 flex items-center justify-center transition-colors"
                    >
                        <X className="w-2.5 h-2.5 text-cyan-400" />
                    </button>
                </div>
            )}

            {/* Region Badge */}
            {currentRegion !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30">
                    <span className="text-sm font-medium text-orange-400">{currentRegion}</span>
                    <button
                        onClick={() => {
                            setRegion('all');
                            let filtered = allGames;
                            filtered = gameService.searchGames(filtered, searchQuery);
                            filtered = gameService.filterByCategory(filtered, currentCategory);
                            setFilteredGames(filtered);
                        }}
                        className="w-4 h-4 rounded-full bg-orange-500/30 hover:bg-orange-500/50 flex items-center justify-center transition-colors"
                    >
                        <X className="w-2.5 h-2.5 text-orange-400" />
                    </button>
                </div>
            )}

            {/* Reset All Button */}
            <button
                onClick={resetAllFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
            >
                <RotateCcw className="w-3 h-3" />
                {t('search.reset') || 'Reset'}
            </button>
        </div>
    );
}

export default function LibraryPage() {
    const { setGames, isLoading, filteredGames, allGames } = useGameStore();
    const { t } = useLanguage();
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleGameClick = (game: Game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedGame(null), 300);
    };

    useEffect(() => {
        validateEnv();
        const loadGames = async () => {
            const games = await gameService.loadGames();
            setGames(games);
        };
        loadGames();
    }, [setGames]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6 relative">
                    <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto relative z-10" />
                    <p className="text-base font-medium text-muted-foreground animate-pulse relative z-10 font-mono-tech uppercase tracking-wider">
                        {t('game.loading')}...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative">
            {/* Base background color */}
            <div className="fixed inset-0 bg-background -z-20" />

            <Header />

            {/* Background Effects - Hidden in low performance mode via CSS */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div
                    className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 30%, transparent 70%)',
                        filter: 'blur(40px)',
                        animationDuration: '4s',
                    }}
                />
                <div
                    className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
                    style={{
                        background: 'radial-gradient(circle, rgba(255, 0, 255, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
                        filter: 'blur(80px)',
                        animationDuration: '5s',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundSize: '60px 60px',
                        backgroundImage: `
              linear-gradient(to right, rgba(0, 212, 255, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 212, 255, 0.06) 1px, transparent 1px)
            `,
                    }}
                />
            </div>

            <div className="container mx-auto px-4 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black font-mono-tech uppercase tracking-wider mb-2">
                        {t('game.library') || 'Game Library'}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('library.subtitle') || 'Browse and select a game to play'}
                    </p>
                    <div className="mt-4 flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-primary font-mono-tech text-2xl font-bold">{filteredGames.length}</span>
                            <span className="text-muted-foreground font-mono-tech uppercase">{t('header.games') || 'Games'}</span>
                        </div>

                        {/* Search Active Indicator with Reset */}
                        <SearchIndicator />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                    <CategoryFilter />
                </div>

                {/* Sort & Region Filters */}
                <div className="mb-8">
                    <FilterToolbar />
                </div>

                {/* Game Grid */}
                <GameGrid />
            </div>

            {/* Game Modal */}
            {selectedGame && (
                <GameModal
                    game={selectedGame}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </main>
    );
}

