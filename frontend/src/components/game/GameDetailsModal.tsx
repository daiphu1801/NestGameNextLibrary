'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Play, Calendar, Globe, Tag, Star, Loader2 } from 'lucide-react';
import { Game } from '@/types';
import { StarRating } from './StarRating';
import { GameComments } from './GameComments';
import { userService } from '@/services/userService';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GameDetailsModalProps {
    game: Game;
    isOpen: boolean;
    onClose: () => void;
    onPlayNow: () => void;
}

export function GameDetailsModal({ game, isOpen, onClose, onPlayNow }: GameDetailsModalProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    // Initialize state only when needed, but hooks must run unconditionally.
    // We'll update state via useEffect when prop changes.
    const [imageUrl, setImageUrl] = useState('/placeholder.png');
    const [hasError, setHasError] = useState(false);

    // Rating state
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [myRating, setMyRating] = useState(0);
    const [isRating, setIsRating] = useState(false);

    useEffect(() => {
        if (isOpen && game) {
            setImageUrl(game.image || game.thumbnail || '/placeholder.png');
            setHasError(false);
            loadRatings();
        }
    }, [isOpen, game]);

    const loadRatings = async () => {
        if (!game?.id) return;
        try {
            const [ratingData, myRatingData] = await Promise.all([
                userService.getGameRating(Number(game.id)),
                user ? userService.getMyRating(Number(game.id)) : Promise.resolve(0)
            ]);
            setAverageRating(ratingData.averageRating);
            setTotalRatings(ratingData.totalRatings);
            setMyRating(myRatingData);
        } catch (error) {
            console.error('Failed to load ratings:', error);
        }
    };

    const handleRate = async (rating: number) => {
        if (!user || !game?.id) return;
        setIsRating(true);
        try {
            const result = await userService.rateGame(Number(game.id), rating);
            setMyRating(rating);
            setAverageRating(result.averageRating);
            setTotalRatings(prev => myRating === 0 ? prev + 1 : prev);
        } catch (error) {
            console.error('Failed to rate game:', error);
        } finally {
            setIsRating(false);
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
                            onError={() => setHasError(true)}
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
                    {/* Play Button + Rating Row */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <button
                            onClick={onPlayNow}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/30 hover:scale-105"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            {t('game.playNow')}
                        </button>

                        <div className="flex flex-col items-end gap-2 bg-white/5 rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center gap-2">
                                <StarRating
                                    rating={averageRating}
                                    size="lg"
                                    readonly
                                    showValue
                                    totalRatings={totalRatings}
                                />
                            </div>
                            {user && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{t('gameDetails.yourRating')}:</span>
                                    <StarRating
                                        rating={myRating}
                                        size="md"
                                        onRate={handleRate}
                                    />
                                    {isRating && <Loader2 className="w-4 h-4 animate-spin" />}
                                </div>
                            )}
                            {!user && (
                                <p className="text-xs text-muted-foreground">
                                    {t('gameDetails.loginToRate')}
                                </p>
                            )}
                        </div>
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

                    {/* Comments Section */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <GameComments gameId={Number(game.id)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
