'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { storageService } from '@/services/storageService';
import { userService } from '@/services/userService';
import { Header } from '@/components/layout/Header';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { History, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GameCard } from '@/components/game/GameCard';
import { GameModal } from '@/components/game/GameModal';

export default function HistoryPage() {
    const { allGames, setGames, isLoading: isStoreLoading } = useGameStore();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [recentGames, setRecentGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true);
            try {
                if (user) {
                    // Use API for authenticated users (max 15 games)
                    const history = await userService.getPlayHistory();
                    setRecentGames(history);
                } else {
                    // Use localStorage for non-authenticated users
                    let games = allGames;
                    if (games.length === 0) {
                        games = await gameService.loadGames();
                        setGames(games);
                    }

                    const recentIds = storageService.getRecentGames();
                    const historyGames = recentIds
                        .map(id => games.find(g => g.id === id))
                        .filter((g): g is Game => !!g);

                    setRecentGames(historyGames);
                }
            } catch (error) {
                console.error('Failed to load history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [allGames, setGames, user]);

    const handleGameClick = (game: Game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedGame(null), 300);
    };

    return (
        <main className="min-h-screen text-foreground bg-background relative selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div
                    className="absolute top-[20%] right-[10%] w-[500px] h-[500px] animate-pulse"
                    style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />
            </div>

            <Header />

            <div className="container mx-auto px-4 lg:px-8 py-12">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">{t('nav.home') || 'Back to Home'}</span>
                </Link>

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                            <History className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black font-mono-tech uppercase tracking-tight flex items-center gap-3">
                                {t('user.history') || 'Play History'}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {user
                                    ? (t('user.historyDesc') || 'Your 15 most recent games')
                                    : (t('user.historyDesc') || 'Games you recently played')
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                ) : recentGames.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {recentGames.map((game) => (
                            <GameCard
                                key={game.id}
                                game={game}
                                onClick={() => handleGameClick(game)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                        <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">{t('history.empty') || 'No played games yet'}</h3>
                        <p className="text-muted-foreground mb-6">{t('history.emptyDesc') || 'Start playing games to see them here!'}</p>
                        <Link href="/">
                            <button className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
                                {t('header.play') || 'Play Now'}
                            </button>
                        </Link>
                    </div>
                )}
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
