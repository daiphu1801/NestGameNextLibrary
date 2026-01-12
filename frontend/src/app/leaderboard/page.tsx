'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { apiClient } from '@/lib/api';
import { Game } from '@/types/game';
import Link from 'next/link';
import { Trophy, Star, TrendingUp, Medal, Gamepad2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { GameModal } from '@/components/game/GameModal';

export default function LeaderboardPage() {
    const { t } = useLanguage();
    const { isLowPerformanceMode } = usePerformance();
    const [topGames, setTopGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await apiClient.get('/leaderboard/top-rated');
                setTopGames(response.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const handleGameClick = (game: Game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedGame(null), 300);
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Medal className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
            case 1:
                return <Medal className="w-7 h-7 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" />;
            case 2:
                return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.5)]" />;
            default:
                return <span className="text-xl font-bold text-muted-foreground">#{index + 1}</span>;
        }
    };

    return (
        <main className="min-h-screen text-foreground relative selection:bg-primary/30">
            {/* Base background color */}
            <div className="fixed inset-0 bg-background -z-20" />

            <Header />

            {/* Background Effects - NEXUS Style */}
            {!isLowPerformanceMode && (
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
                        className="absolute top-[20%] -left-[200px] w-[500px] h-[500px] animate-float"
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 245, 212, 0.15) 0%, transparent 60%)',
                            filter: 'blur(60px)',
                        }}
                    />
                    <div
                        className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
                        style={{
                            background: 'radial-gradient(circle, rgba(255, 0, 255, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
                            filter: 'blur(80px)',
                            animationDuration: '5s',
                            animationDelay: '1s',
                        }}
                    />
                    <div
                        className="absolute -bottom-[200px] left-1/3 w-[800px] h-[400px] animate-pulse"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.12) 0%, transparent 60%)',
                            filter: 'blur(100px)',
                            animationDuration: '6s',
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
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 10, 20, 0.4) 100%)',
                        }}
                    />
                </div>
            )}

            <div className="container mx-auto px-4 lg:px-8 py-12">
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="p-4 rounded-full bg-primary/10 mb-4 ring-1 ring-primary/20">
                        <Trophy className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-mono-tech uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient mb-4">
                        {t('leaderboard.title') || 'Leaderboard'}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        {t('leaderboard.subtitle') || 'Top rated games by our community. Play, rate, and help your favorites climb the ranks!'}
                    </p>
                </div>

                {isLoading ? (
                    <div className="w-full max-w-4xl mx-auto space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mx-auto grid gap-4">
                        {topGames.map((game, index) => (
                            <div
                                key={game.id}
                                onClick={() => handleGameClick(game)}
                                className="group relative flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden cursor-pointer"
                            >
                                {/* Rank */}
                                <div className="flex-shrink-0 w-12 flex justify-center">
                                    {getRankIcon(index)}
                                </div>

                                {/* Game Image */}
                                <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black/50">
                                    <img
                                        src={game.imageUrl || `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.imageSnap || ''}.jpg`}
                                        alt={game.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-game.png';
                                        }}
                                    />
                                </div>

                                {/* Game Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                        {game.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                                            <Gamepad2 className="w-3.5 h-3.5" />
                                            {game.categoryName}
                                        </span>
                                        <span>•</span>
                                        <span>{game.year}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                            {game.playCount || 0} plays
                                        </span>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                                        <Star className="w-4 h-4 fill-yellow-400" />
                                        <span className="font-bold text-lg">{game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground mr-1">Rating</span>
                                </div>

                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                            </div>
                        ))}
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
