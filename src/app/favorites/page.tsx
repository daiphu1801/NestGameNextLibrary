'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { Header } from '@/components/layout/Header';
import { GameModal } from '@/components/game/GameModal';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { Flame, Star, Play, ArrowLeft, Sparkles, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FavoritesPage() {
    const { setGames, allGames, isLoading } = useGameStore();
    const { t } = useLanguage();
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadGames = async () => {
            const games = await gameService.loadGames();
            setGames(games);
        };
        loadGames();
    }, [setGames]);

    // Filter hot games
    const hotGames = allGames.filter(
        game => game.isFeatured || (game.rating && game.rating >= 4.5)
    );

    const handleGameClick = (game: Game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedGame(null), 300);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6 relative">
                    <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto relative z-10" />
                    <p className="text-base font-medium text-muted-foreground animate-pulse relative z-10 font-mono-tech uppercase tracking-wider">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen text-foreground selection:bg-primary/30 relative">
            {/* Base background */}
            <div className="fixed inset-0 bg-background -z-20" />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div
                    className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(255, 100, 50, 0.2) 0%, rgba(255, 0, 100, 0.1) 30%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    className="absolute top-[40%] -right-[200px] w-[600px] h-[600px] animate-float"
                    style={{
                        background: 'radial-gradient(circle, rgba(255, 100, 0, 0.15) 0%, transparent 60%)',
                        filter: 'blur(80px)',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundSize: '60px 60px',
                        backgroundImage: `
              linear-gradient(to right, rgba(255, 100, 50, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 100, 50, 0.04) 1px, transparent 1px)
            `,
                    }}
                />
            </div>

            <Header />

            <div className="container mx-auto px-4 lg:px-8 py-12">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('nav.home') || 'Back to Home'}</span>
                </Link>

                {/* Page Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/30">
                        <Flame className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black font-mono-tech uppercase tracking-tight flex items-center gap-3">
                            {t('nav.favorites') || 'Hot Games'}
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {t('featured.subtitle') || 'Most popular games this week'} • {hotGames.length} games
                        </p>
                    </div>
                </div>

                {/* Featured Hero Card - Top Game */}
                {hotGames[0] && (
                    <div
                        onClick={() => handleGameClick(hotGames[0])}
                        className="relative rounded-3xl overflow-hidden mb-12 cursor-pointer group"
                    >
                        <div className="relative h-[400px] lg:h-[500px]">
                            <Image
                                src={hotGames[0].image || hotGames[0].thumbnail || '/placeholder.png'}
                                alt={hotGames[0].name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold uppercase flex items-center gap-1">
                                        <Trophy className="w-3 h-3" />
                                        #1 HOT
                                    </span>
                                    {hotGames[0].rating && (
                                        <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            {hotGames[0].rating}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-4xl lg:text-5xl font-black text-white mb-3">{hotGames[0].name}</h2>
                                <p className="text-lg text-white/70 max-w-2xl mb-6">
                                    {hotGames[0].description?.slice(0, 150) || 'Experience this legendary NES classic'}...
                                </p>
                                <button className="btn-primary inline-flex items-center gap-2">
                                    <Play className="w-4 h-4 fill-current" />
                                    Play Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hot Games Grid - Special Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotGames.slice(1).map((game, index) => (
                        <HotGameCard
                            key={game.id}
                            game={game}
                            rank={index + 2}
                            onClick={() => handleGameClick(game)}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {hotGames.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔥</div>
                        <h3 className="text-2xl font-bold mb-2">No Hot Games Yet</h3>
                        <p className="text-muted-foreground">Check back later for trending games!</p>
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

// Special Hot Game Card Component
function HotGameCard({ game, rank, onClick }: { game: Game; rank: number; onClick: () => void }) {
    const [imageUrl, setImageUrl] = useState(game.image || game.thumbnail || '/placeholder.png');
    const [hasError, setHasError] = useState(false);

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative rounded-2xl overflow-hidden cursor-pointer",
                "bg-gradient-to-br from-card to-card/50 border border-white/10",
                "hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10",
                "transition-all duration-500 hover:-translate-y-2"
            )}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                {!hasError ? (
                    <Image
                        src={imageUrl}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={() => setHasError(true)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                        <span className="text-5xl">🎮</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Rank Badge */}
                <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
                    #{rank}
                </div>

                {/* Rating */}
                {game.rating && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">{game.rating}</span>
                    </div>
                )}

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white ml-1 fill-current" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
                <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-rose-400 transition-colors">
                    {game.name}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {game.description?.slice(0, 100) || 'Classic NES game'}...
                </p>

                <div className="flex items-center justify-between pt-2">
                    {game.region && (
                        <span className="text-xs font-mono-tech text-cyan-400 uppercase">
                            {game.region === 'Japan' || game.region === 'J' ? '🇯🇵 JP' :
                                game.region === 'USA' || game.region === 'U' ? '🇺🇸 US' :
                                    game.region === 'Europe' || game.region === 'E' ? '🇪🇺 EU' :
                                        game.region}
                        </span>
                    )}
                    <span className="text-xs font-mono-tech text-muted-foreground">
                        {game.year || 'Classic'}
                    </span>
                </div>
            </div>
        </div>
    );
}
