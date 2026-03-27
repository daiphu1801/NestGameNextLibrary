'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Play, Calendar, Globe, Tag, Star, Loader2 } from 'lucide-react';
import { Game } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { GameReviewSection } from './GameReviewSection';
import { imageService } from '@/services/imageService';

interface GameDetailsModalProps {
    game: Game;
    isOpen: boolean;
    onClose: () => void;
    onPlayNow: () => void;
}

export function GameDetailsModal({ game, isOpen, onClose, onPlayNow }: GameDetailsModalProps) {
    const { t } = useLanguage();
    const [imageUrl, setImageUrl] = useState('/placeholder.png');
    const [fallbackUrls, setFallbackUrls] = useState<string[]>([]);
    const [currentFallbackIndex, setCurrentFallbackIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (isOpen && game) {
            setImageUrl(game.imageUrl || game.image || game.thumbnail || '/placeholder.png');
            setFallbackUrls(imageService.generateFallbackUrls(game.name, game.image, { imageSnap: game.imageSnap, imageTitle: game.imageTitle }));
            setCurrentFallbackIndex(0);
            setHasError(false);
        }
    }, [isOpen, game]);

    const handleImageError = () => {
        if (hasError) return;
        const nextUrl = imageService.getNextFallbackUrl(fallbackUrls, currentFallbackIndex);
        if (nextUrl) {
            setImageUrl(nextUrl);
            setCurrentFallbackIndex(prev => prev + 1);
            imageService.markAsFailed(fallbackUrls[currentFallbackIndex]);
        } else {
            setHasError(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-background border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header with Image */}
                <div className="relative h-64 bg-secondary overflow-hidden">
                    {!hasError ? (
                        <Image
                            src={imageUrl}
                            alt={game.name}
                            fill
                            className="object-cover"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <span className="text-8xl">🎮</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                    {/* Title on image */}
                    <div className="absolute bottom-4 left-6 right-6">
                        <h2 className="text-3xl font-bold text-white mb-2">{game.name}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {game.year && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {game.year}
                                </span>
                            )}
                            {game.region && (
                                <span className="flex items-center gap-1">
                                    <Globe className="w-4 h-4" />
                                    {game.region}
                                </span>
                            )}
                            {game.category && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                                    <Tag className="w-3 h-3" />
                                    {t(`categories.${game.category}`, { defaultValue: game.category })}
                                    {/* Default to key if translation not found, simple fallback to just the value */}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Play Button Row */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <button
                            onClick={onPlayNow}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/30 hover:scale-105"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            {t('game.playNow')}
                        </button>
                    </div>

                    {/* Description */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-3">{t('gameDetails.description')}</h3>
                        <p className="text-foreground/80 leading-relaxed">
                            {game.description || t('gameDetails.defaultDescription', { name: game.name })}
                        </p>
                    </div>

                    {/* Game Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('gameDetails.platform')}</p>
                            <p className="text-white font-bold">NES</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('gameDetails.year')}</p>
                            <p className="text-white font-bold">{game.year || t('common.classic')}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('gameDetails.region')}</p>
                            <p className="text-white font-bold">{game.region || t('common.universal')}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('gameDetails.playCount')}</p>
                            <p className="text-white font-bold">{game.playCount || 0}</p>
                        </div>
                    </div>

                    {/* Review Section */}
                    {game.id && (
                        <GameReviewSection gameId={Number(game.id)} />
                    )}
                </div>
            </div>
        </div>
    );
}
