'use client';

import { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { Header } from '@/components/layout/Header';
import { GameModal } from '@/components/game/GameModal';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { Flame, Star, Play, ArrowLeft, Sparkles, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { imageService } from '@/services/imageService';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 12;

export default function FavoritesPage() {
    const { setGames, allGames, isLoading } = useGameStore();
    const { t } = useLanguage();
    const { isLowPerformanceMode } = usePerformance();
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadGames = async () => {
            const games = await gameService.loadGames();
            setGames(games);
        };
        loadGames();
    }, [setGames]);

    // Filter hot games
    const hotGames = useMemo(() =>
        allGames.filter(game => game.isFeatured || (game.rating && game.rating >= 4.5)),
        [allGames]
    );

    // Pagination - Page 1 shows hero + 12 grid, other pages show 12 grid
    const itemsOnPage1 = ITEMS_PER_PAGE + 1; // 13 items (1 hero + 12 grid)
    const remainingItems = Math.max(0, hotGames.length - itemsOnPage1);
    const totalPages = hotGames.length > 0 ? 1 + Math.ceil(remainingItems / ITEMS_PER_PAGE) : 0;
    const paginatedGames = useMemo(() => {
        if (currentPage === 1) {
            // Page 1: return first 13 items (1 for hero + 12 for grid)
            return hotGames.slice(0, ITEMS_PER_PAGE + 1);
        }
        // Other pages: offset by 13 (page 1 items), then normal pagination
        const start = 1 + ITEMS_PER_PAGE + (currentPage - 2) * ITEMS_PER_PAGE;
        return hotGames.slice(start, start + ITEMS_PER_PAGE);
    }, [hotGames, currentPage]);

    const handleGameClick = (game: Game) => {
        setSelectedGame(game);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedGame(null), 300);
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

            {/* Background Effects - Hidden in low performance mode */}
            {!isLowPerformanceMode && (
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
            )}

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
                        <div className={cn(
                            "p-4 rounded-2xl shadow-lg",
                            isLowPerformanceMode
                                ? "bg-rose-500/80"
                                : "bg-gradient-to-br from-rose-500 to-orange-500 shadow-rose-500/30"
                        )}>
                            <Flame className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black font-mono-tech uppercase tracking-tight flex items-center gap-3">
                                {t('nav.favorites') || 'Hot Games'}
                                {!isLowPerformanceMode && <Sparkles className="w-6 h-6 text-yellow-400" />}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {t('featured.subtitle') || 'Most popular games this week'}
                            </p>
                        </div>
                    </div>

                    {/* Stats Badge */}
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-card border border-white/10">
                            <span className="text-rose-400 font-bold text-xl">{hotGames.length}</span>
                            <span className="text-muted-foreground ml-2 text-sm">{t('pagination.games') || 'games'}</span>
                        </div>
                    </div>
                </div>

                {/* Featured Hero Card - Top Game (Only on first page) */}
                {currentPage === 1 && hotGames[0] && (
                    <div
                        onClick={() => handleGameClick(hotGames[0])}
                        className={cn(
                            "relative rounded-3xl overflow-hidden mb-10 cursor-pointer group",
                            !isLowPerformanceMode && "hover:shadow-2xl hover:shadow-rose-500/20 transition-shadow duration-500"
                        )}
                    >
                        <div className="relative h-[300px] sm:h-[400px] lg:h-[450px]">
                            <Image
                                src={hotGames[0].image || hotGames[0].thumbnail || '/placeholder.png'}
                                alt={hotGames[0].name}
                                fill
                                className={cn(
                                    "object-cover",
                                    !isLowPerformanceMode && "transition-transform duration-700 group-hover:scale-105"
                                )}
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={cn(
                                        "px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase flex items-center gap-1",
                                        isLowPerformanceMode
                                            ? "bg-rose-500"
                                            : "bg-gradient-to-r from-rose-500 to-orange-500"
                                    )}>
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
                                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-3">{hotGames[0].name}</h2>
                                <p className="text-base sm:text-lg text-white/70 max-w-2xl mb-6 line-clamp-2">
                                    {hotGames[0].description?.slice(0, 150) || 'Experience this legendary NES classic'}...
                                </p>
                                <button className={cn(
                                    "inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white",
                                    isLowPerformanceMode
                                        ? "bg-rose-500 hover:bg-rose-600"
                                        : "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/30"
                                )}>
                                    <Play className="w-4 h-4 fill-current" />
                                    {t('header.play') || 'Play Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hot Games Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {(currentPage === 1 ? paginatedGames.slice(1) : paginatedGames).map((game, index) => (
                        <HotGameCard
                            key={game.id}
                            game={game}
                            rank={currentPage === 1 ? index + 2 : (currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                            onClick={() => handleGameClick(game)}
                            isLowPerformanceMode={isLowPerformanceMode}
                        />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4 pt-10 pb-4">
                        {/* Page info */}
                        <p className="text-sm text-muted-foreground">
                            {t('pagination.showing') || 'Showing'}{' '}
                            <span className="text-rose-400 font-semibold">
                                {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, hotGames.length)}
                            </span>{' '}
                            {t('pagination.of') || 'of'}{' '}
                            <span className="text-foreground font-semibold">{hotGames.length}</span>{' '}
                            {t('pagination.games') || 'games'}
                        </p>

                        <div className="flex items-center gap-2">
                            {/* First Page Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                                className="rounded-lg bg-card hover:bg-white/10 disabled:opacity-30 w-12 h-12"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <ChevronLeft className="h-4 w-4 -ml-3" />
                            </Button>

                            {/* Previous Page Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-lg bg-card hover:bg-white/10 disabled:opacity-30 w-12 h-12"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const pages: number[] = [];
                                    const showPages = 3;

                                    let start = Math.max(1, currentPage - 1);
                                    let end = Math.min(totalPages, start + showPages - 1);

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
                                                    onClick={() => goToPage(pageNum)}
                                                    className={cn(
                                                        "w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300",
                                                        currentPage === pageNum
                                                            ? isLowPerformanceMode
                                                                ? "bg-rose-500 text-white"
                                                                : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30"
                                                            : "bg-card hover:bg-white/10 text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {pageNum}
                                                </button>
                                            ))}

                                            {/* Ellipsis and Last Page */}
                                            {end < totalPages && (
                                                <>
                                                    <span className="w-8 h-12 flex items-center justify-center text-muted-foreground font-semibold">
                                                        ...
                                                    </span>
                                                    <button
                                                        onClick={() => goToPage(totalPages)}
                                                        className={cn(
                                                            "w-12 h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-300",
                                                            currentPage === totalPages
                                                                ? isLowPerformanceMode
                                                                    ? "bg-rose-500 text-white"
                                                                    : "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30"
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
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded-lg bg-card hover:bg-white/10 disabled:opacity-30 w-12 h-12"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>

                            {/* Last Page Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="rounded-lg bg-card hover:bg-white/10 disabled:opacity-30 w-12 h-12"
                            >
                                <ChevronRight className="h-4 w-4" />
                                <ChevronRight className="h-4 w-4 -ml-3" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {hotGames.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔥</div>
                        <h3 className="text-2xl font-bold mb-2">{t('featured.empty') || 'No Hot Games Yet'}</h3>
                        <p className="text-muted-foreground">{t('featured.emptyDesc') || 'Check back later for trending games!'}</p>
                        <Link href="/library" className="inline-block mt-6">
                            <Button className="rounded-full">
                                {t('nav.library') || 'Browse Library'}
                            </Button>
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

// Special Hot Game Card Component
function HotGameCard({
    game,
    rank,
    onClick,
    isLowPerformanceMode
}: {
    game: Game;
    rank: number;
    onClick: () => void;
    isLowPerformanceMode: boolean;
}) {
    const [imageUrl, setImageUrl] = useState(game.image || game.thumbnail || '/placeholder.png');
    const [fallbackUrls] = useState(() =>
        imageService.generateFallbackUrls(game.name, game.image)
    );
    const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    const handleImageError = () => {
        if (hasError) return;

        const nextUrl = imageService.getNextFallbackUrl(fallbackUrls, currentFallbackIndex);

        if (nextUrl) {
            setImageUrl(nextUrl);
            setCurrentFallbackIndex(currentFallbackIndex + 1);
            imageService.markAsFailed(fallbackUrls[currentFallbackIndex]);
        } else {
            setHasError(true);
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative rounded-2xl overflow-hidden cursor-pointer",
                "bg-card border border-white/10",
                isLowPerformanceMode
                    ? "hover:border-rose-500/50"
                    : "hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500 hover:-translate-y-2"
            )}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                {!hasError ? (
                    <Image
                        src={imageUrl}
                        alt={game.name}
                        fill
                        className={cn(
                            "object-cover",
                            !isLowPerformanceMode && "transition-transform duration-700 group-hover:scale-110"
                        )}
                        onError={handleImageError}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                        <span className="text-4xl">🎮</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Rank Badge */}
                <div className={cn(
                    "absolute top-2 left-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-lg",
                    isLowPerformanceMode ? "bg-rose-500" : "bg-gradient-to-r from-rose-500 to-orange-500"
                )}>
                    #{rank}
                </div>

                {/* Rating */}
                {game.rating && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">{game.rating}</span>
                    </div>
                )}

                {/* Play button */}
                {!isLowPerformanceMode && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-1 fill-current" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 space-y-2">
                <h3 className={cn(
                    "font-bold text-sm sm:text-base text-foreground line-clamp-1",
                    !isLowPerformanceMode && "group-hover:text-rose-400 transition-colors"
                )}>
                    {game.name}
                </h3>

                <div className="flex items-center justify-between">
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
