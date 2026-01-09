'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Star, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';
import { Game } from '@/types';
import { cn } from '@/lib/utils';
import { imageService } from '@/services/imageService';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface FeaturedGamesProps {
    games: Game[];
    onGameClick: (game: Game) => void;
}

export function FeaturedGames({ games, onGameClick }: FeaturedGamesProps) {
    const { t } = useLanguage();
    const [scrollPosition, setScrollPosition] = useState(0);

    // Filter only hot/featured games
    const hotGames = games.filter(
        game => game.isFeatured || (game.rating && game.rating >= 4.5)
    ).slice(0, 12);

    if (hotGames.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('featured-scroll');
        if (container) {
            const scrollAmount = 320;
            const newPosition = direction === 'left'
                ? Math.max(0, scrollPosition - scrollAmount)
                : scrollPosition + scrollAmount;

            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setScrollPosition(newPosition);
        }
    };

    return (
        <section className="py-8 relative">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500">
                        <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-mono-tech uppercase tracking-wider flex items-center gap-2">
                            {t('featured.title') || 'Hot Games'}
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                        </h2>
                        <p className="text-xs text-muted-foreground">{t('featured.subtitle') || 'Most popular games this week'}</p>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-lg bg-card hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-lg bg-card hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div
                id="featured-scroll"
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
                onScroll={(e) => setScrollPosition((e.target as HTMLDivElement).scrollLeft)}
            >
                {hotGames.map((game, index) => (
                    <FeaturedGameCard
                        key={game.id}
                        game={game}
                        onClick={() => onGameClick(game)}
                        index={index}
                    />
                ))}
            </div>

            {/* Gradient fade edges */}
            <div className="absolute left-0 top-20 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-20 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </section>
    );
}

interface FeaturedGameCardProps {
    game: Game;
    onClick: () => void;
    index: number;
}

function FeaturedGameCard({ game, onClick, index }: FeaturedGameCardProps) {
    const [imageUrl, setImageUrl] = useState(game.image || game.thumbnail || '/placeholder.png');
    const [hasError, setHasError] = useState(false);

    const handleImageError = () => {
        if (!hasError) {
            setHasError(true);
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative flex-shrink-0 w-72 rounded-2xl overflow-hidden cursor-pointer",
                "bg-gradient-to-br from-card to-card/50 border border-white/10",
                "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
                "transition-all duration-500 hover:-translate-y-2"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
                {!hasError ? (
                    <Image
                        src={imageUrl}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={handleImageError}
                        sizes="288px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                        <span className="text-5xl">🎮</span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Hot badge */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center gap-1 animate-pulse">
                    <Flame className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-bold text-white uppercase">HOT</span>
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
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="w-6 h-6 text-primary-foreground ml-1 fill-current" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
                <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {game.name}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2">
                    {game.description?.slice(0, 80) || 'Classic NES game'}...
                </p>

                <div className="flex items-center justify-between pt-2">
                    {/* Region */}
                    {game.region && (
                        <span className="text-[10px] font-mono-tech text-cyan-400 uppercase">
                            {game.region === 'Japan' || game.region === 'J' ? '🇯🇵 JP' :
                                game.region === 'USA' || game.region === 'U' ? '🇺🇸 US' :
                                    game.region === 'Europe' || game.region === 'E' ? '🇪🇺 EU' :
                                        game.region}
                        </span>
                    )}

                    <span className="text-[10px] font-mono-tech text-muted-foreground">
                        {game.year || 'Classic'}
                    </span>
                </div>
            </div>
        </div>
    );
}
