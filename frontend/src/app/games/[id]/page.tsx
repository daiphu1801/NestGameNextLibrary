'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, Play, Calendar, Globe, Tag, Star, Gamepad2, 
  Heart, Clock, Trophy, Loader2, Share2 
} from 'lucide-react';
import { Game } from '@/types';
import { gameService } from '@/services/gameService';
import { StarRating } from '@/components/game/StarRating';
import { GameComments } from '@/components/game/GameComments';
import { userService } from '@/services/userService';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useFavorites } from '@/components/providers/FavoritesProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('/placeholder.png');
  const [hasError, setHasError] = useState(false);
  
  // Rating state
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const isFavorite = game ? checkIsFavorite(game.id) : false;

  useEffect(() => {
    loadGame();
  }, [params.id]);

  useEffect(() => {
    if (game) {
      setImageUrl(game.image || game.thumbnail || '/placeholder.png');
      loadRatings();
    }
  }, [game]);

  const loadGame = async () => {
    try {
      setLoading(true);
      
      // Ensure games are loaded in gameService
      let allGames = gameService.getAllGames();
      if (allGames.length === 0) {
        allGames = await gameService.loadGames();
      }
      
      // Fetch game by ID (now async)
      const gameData = await gameService.getGameById(params.id as string);
      if (!gameData) {
        showToast(t('errors.gameNotFound'), 'error');
        router.push('/library');
        return;
      }
      setGame(gameData);
    } catch (error) {
      console.error('Failed to load game:', error);
      showToast(t('errors.gameNotFound'), 'error');
      router.push('/library');
    } finally {
      setLoading(false);
    }
  };

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
      showToast(t('game.ratingSuccess'), 'success');
    } catch (error) {
      console.error('Failed to rate game:', error);
      showToast(t('errors.ratingFailed'), 'error');
    } finally {
      setIsRating(false);
    }
  };

  const handlePlayNow = () => {
    if (!game) return;
    router.push(`/games/${game.id}/play`);
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      showToast(t('auth.loginRequired'), 'info');
      return;
    }
    if (!game) return;
    
    try {
      await toggleFavorite(game.id);
      showToast(isFavorite ? t('game.removedFromFavorites') : t('game.addedToFavorites'), 'success');
    } catch (error) {
      showToast(t('errors.favoriteToggleFailed'), 'error');
    }
  };

  const handleShare = async () => {
    if (!game) return;
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: game.name,
          text: game.description || `Check out ${game.name}!`,
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      showToast(t('common.linkCopied'), 'success');
    }
  };

  if (loading) {
    return null; // Loading.tsx will handle this
  }

  if (!game) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F0F23] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/30 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F0F23]/80 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">{t('common.back')}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 hover:border-purple-500/50"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={cn(
                  "p-2 rounded-lg transition-all border",
                  isFavorite 
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30" 
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-purple-500/50"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="relative group">
              {/* Game Banner */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-purple-500/30 shadow-2xl shadow-purple-500/20">
                {!hasError ? (
                  <Image
                    src={imageUrl}
                    alt={game.name}
                    fill
                    className="object-cover"
                    onError={() => setHasError(true)}
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-rose-900/50">
                    <Gamepad2 className="w-32 h-32 text-purple-400/50" />
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F23] via-transparent to-transparent" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={handlePlayNow}
                    className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold text-lg hover:scale-110 transition-all shadow-2xl shadow-purple-500/50 cursor-pointer"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    {t('game.playNow')}
                  </button>
                </div>
              </div>

              {/* Pixel Corner Decorations */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 border-2 border-[#0F0F23]" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 border-2 border-[#0F0F23]" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-rose-500 border-2 border-[#0F0F23]" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500 border-2 border-[#0F0F23]" />
            </div>

            {/* Game Title & Category */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    {game.name}
                  </h1>
                  {game.category && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm">
                      <Tag className="w-4 h-4" />
                      <span className="font-semibold text-sm uppercase tracking-wider">
                        {t(`categories.${game.category}`, { defaultValue: game.category })}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Play Button */}
                <button
                  onClick={handlePlayNow}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold text-lg hover:scale-105 transition-all shadow-lg shadow-purple-500/30 cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current" />
                  {t('game.playNow')}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="relative p-6 rounded-2xl bg-white/5 border border-purple-500/20 backdrop-blur-sm">
              <div className="absolute -top-px -left-px w-16 h-px bg-gradient-to-r from-purple-500 to-transparent" />
              <div className="absolute -top-px -left-px w-px h-16 bg-gradient-to-b from-purple-500 to-transparent" />
              
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-rose-500 rounded-full" />
                {t('gameDetails.description')}
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                {game.description || t('gameDetails.defaultDescription', { name: game.name })}
              </p>
            </div>

            {/* Comments Section */}
            <div className="relative p-6 rounded-2xl bg-white/5 border border-purple-500/20 backdrop-blur-sm">
              <div className="absolute -top-px -right-px w-16 h-px bg-gradient-to-l from-rose-500 to-transparent" />
              <div className="absolute -top-px -right-px w-px h-16 bg-gradient-to-b from-rose-500 to-transparent" />
              
              <GameComments gameId={Number(game.id)} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Rating Card */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-rose-900/30 border border-purple-500/30 backdrop-blur-sm">
                <div className="absolute -top-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">
                  {t('game.rating')}
                </h3>
                
                <div className="space-y-4">
                  {/* Average Rating */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/10">
                    <div>
                      <div className="text-3xl font-bold text-white mb-1">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {totalRatings} {t('game.ratings')}
                      </div>
                    </div>
                    <StarRating
                      rating={averageRating}
                      size="lg"
                      readonly
                    />
                  </div>

                  {/* User Rating */}
                  {user ? (
                    <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                      <p className="text-sm text-slate-400 mb-2">
                        {t('gameDetails.yourRating')}:
                      </p>
                      <div className="flex items-center gap-2">
                        <StarRating
                          rating={myRating}
                          size="md"
                          onRate={handleRate}
                        />
                        {isRating && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-center">
                      <p className="text-sm text-slate-400">
                        {t('gameDetails.loginToRate')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Game Info Card */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-rose-900/30 border border-purple-500/30 backdrop-blur-sm">
                <div className="absolute -bottom-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                
                <h3 className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-4">
                  {t('game.information')}
                </h3>
                
                <div className="space-y-4">
                  {/* Platform */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Gamepad2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">
                        {t('gameDetails.platform')}
                      </p>
                      <p className="text-white font-semibold">NES</p>
                    </div>
                  </div>

                  {/* Year */}
                  {game.year && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Calendar className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">
                          {t('gameDetails.year')}
                        </p>
                        <p className="text-white font-semibold">{game.year}</p>
                      </div>
                    </div>
                  )}

                  {/* Region */}
                  {game.region && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Globe className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">
                          {t('gameDetails.region')}
                        </p>
                        <p className="text-white font-semibold">{game.region}</p>
                      </div>
                    </div>
                  )}

                  {/* Play Count */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
                    <div className="p-2 rounded-lg bg-rose-500/20">
                      <Trophy className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">
                        {t('gameDetails.playCount')}
                      </p>
                      <p className="text-white font-semibold">{game.playCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retro Achievement Badge */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-2 border-amber-500/30 backdrop-blur-sm text-center">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />
                
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 mb-3">
                    <Trophy className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-300 mb-2">
                    Retro Legend
                  </h3>
                  <p className="text-sm text-amber-200/70">
                    Play this classic and earn achievements!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
