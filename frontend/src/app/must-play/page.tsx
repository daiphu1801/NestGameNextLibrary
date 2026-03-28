'use client';

import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { Header } from '@/components/layout/Header';
import { GameGrid } from '@/components/game/GameGrid';
import { SortFilter } from '@/components/search/SortFilter';
import { validateEnv } from '@/config/env';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Joystick } from 'lucide-react';
import { SortOption } from '@/types';

export default function MustPlayPage() {
    const { setGames } = useGameStore();
    const { t } = useLanguage();
    
    const [isLoading, setIsLoading] = useState(true);
    const [games, setLocalGames] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [sort, setSort] = useState<SortOption>('name-asc');
    const SIZE = 24; // Show a good amount on grid

    const loadMustPlayGames = useCallback(async () => {
        setIsLoading(true);
        try {
            validateEnv();
            const sortOptions = sort.split('-');
            const sortBy = sortOptions[0] === 'rating' ? 'playCount' : (sortOptions[0] === 'year' ? 'year' : 'name');
            const sortDir = sortOptions[1] || 'asc';
            
            const data = await gameService.loadGamesPaginated({
                page,
                size: SIZE,
                isMustPlay: true,
                sortBy,
                sortDir
            });
            setLocalGames(data.games);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Failed to load must-play games", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, sort]);

    useEffect(() => {
        loadMustPlayGames();
    }, [loadMustPlayGames]);

    if (isLoading && games.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6 relative">
                    <div className="absolute inset-0 bg-[#A855F7]/30 blur-3xl rounded-full" />
                    <div className="w-16 h-16 border-4 border-[#A855F7]/30 border-t-[#A855F7] rounded-full animate-spin mx-auto relative z-10" />
                    <p className="text-base font-medium text-muted-foreground animate-pulse relative z-10 font-tech uppercase tracking-wider">
                        Đang tải dữ liệu...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative">
            <div className="fixed inset-0 bg-background -z-20" />

            <Header />

            {/* Background Effects suitable for "Tuổi thơ" feeling */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div
                    className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.20) 0%, rgba(6, 182, 212, 0.05) 30%, transparent 70%)',
                        filter: 'blur(40px)',
                        animationDuration: '6s',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundSize: '40px 40px', // slightly dense grid
                        backgroundImage: `
              radial-gradient(circle at center, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
                    }}
                />
            </div>

            <div className="container mx-auto px-4 lg:px-8 py-4 sm:py-8">
                {/* Page Header */}
                <div className="mb-4 sm:mb-8 max-w-4xl">
                    <div className="flex items-center gap-3 sm:gap-4 mb-2">
                        <Joystick className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                        <h1 className="text-2xl sm:text-4xl font-tech font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 py-1 leading-tight sm:leading-snug">
                            Những Tựa Game Tuổi Thơ
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Chắc hẳn bạn đã chơi ít nhất một lần. Khám phá lại những ký ức tuyệt vời với bộ sưu tập đặc biệt này.
                    </p>
                    <div className="mt-2 sm:mt-4 flex items-center gap-3 sm:gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-tech text-xl sm:text-2xl font-bold">{totalElements}</span>
                            <span className="text-muted-foreground font-tech uppercase text-xs sm:text-base">Trò chơi</span>
                        </div>
                    </div>
                </div>

                {/* Filter Toolbar (Sort only for Must-Play games) */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-2 rounded-xl bg-secondary/20 border border-white/5">
                        <SortFilter value={sort} onChange={setSort} />
                    </div>
                </div>

                {/* Game Grid */}
                {games.length === 0 && !isLoading ? (
                     <div className="text-center py-20">
                          <p className="text-muted-foreground">Hiện chưa có trò chơi nào trong danh sách này.</p>
                     </div>
                ) : (
                    <div className="mt-8 sm:mt-12">
                         <GameGrid 
                            games={games}
                            totalGames={totalElements}
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
