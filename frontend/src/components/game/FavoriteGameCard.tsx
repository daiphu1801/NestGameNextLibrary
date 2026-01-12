'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, Star, X, HeartCrack, Trash2 } from 'lucide-react';
import { Game } from '@/types';
import { cn } from '@/lib/utils';
import { imageService } from '@/services/imageService';
import { storageService } from '@/services/storageService';
import { userService } from '@/services/userService';
import { useAuth } from '@/components/providers/AuthProvider';

interface FavoriteGameCardProps {
    game: Game;
    onClick: () => void;
    onRemove: (gameId: string | number) => void;
}

export function FavoriteGameCard({ game, onClick, onRemove }: FavoriteGameCardProps) {
    const { user } = useAuth();
    const [imageUrl, setImageUrl] = useState(game.image || game.thumbnail || '/placeholder.png');
    const [fallbackUrls] = useState(() =>
        imageService.generateFallbackUrls(game.name, game.image)
    );
    const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemoveClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRemoving(true);

        try {
            // Remove from localStorage
            storageService.toggleFavorite(game.id);

            // If logged in, also remove from server
            if (user) {
                await userService.removeFavorite(game.id);
            }

            // Notify parent and other components
            window.dispatchEvent(new Event('favorites-updated'));
            onRemove(game.id);
        } catch (err) {
            console.error('Failed to remove favorite:', err);
            setIsRemoving(false);
        }
    };

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
                "group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 border border-white/5 hover:border-primary/30 bg-card",
                isRemoving && "opacity-50 scale-95 pointer-events-none"
            )}
        >
            {/* Image Container */}
            <div className="relative w-full aspect-[3/4] bg-secondary overflow-hidden">
                {!hasError ? (
                    <Image
                        src={imageUrl}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={handleImageError}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                        <div className="text-center p-4">
                            <div className="text-5xl mb-3 opacity-40">🎮</div>
                            <p className="text-xs text-muted-foreground font-medium line-clamp-2 px-2 font-mono-tech uppercase">
                                {game.name}
                            </p>
                        </div>
                    </div>
                )}

                {/* Hover Overlay with Play Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-primary/50">
                        <Play className="h-6 w-6 text-primary-foreground ml-0.5 fill-current" />
                    </div>
                </div>

                {/* ===== REMOVE BUTTON - ALWAYS VISIBLE TOP RIGHT ===== */}
                <button
                    onClick={handleRemoveClick}
                    disabled={isRemoving}
                    className={cn(
                        "absolute top-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-gradient-to-r from-red-600 to-rose-600 border border-red-400 shadow-lg shadow-red-500/30",
                        "hover:scale-110 hover:shadow-red-500/50 active:scale-95",
                        "group/btn"
                    )}
                    title="Xóa khỏi yêu thích"
                >
                    <X className="w-4 h-4 text-white group-hover/btn:rotate-90 transition-transform duration-300" />
                </button>

                {/* Rating Badge */}
                {game.rating && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-sm flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-white font-mono-tech">{game.rating}</span>
                    </div>
                )}

                {/* Region Badge */}
                {game.region && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/20">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono-tech">
                            {game.region === 'Japan' || game.region === 'J' ? '🇯🇵 JP' :
                                game.region === 'USA' || game.region === 'U' ? '🇺🇸 US' :
                                    game.region === 'Europe' || game.region === 'E' ? '🇪🇺 EU' :
                                        game.region}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 bg-card">
                <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {game.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono-tech">{game.year || 'Classic'}</span>
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase font-mono-tech border border-primary/20">
                        NES
                    </span>
                </div>
            </div>
        </div>
    );
}
