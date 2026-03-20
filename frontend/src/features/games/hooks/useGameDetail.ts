import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Game } from '@/types';
import { gameService } from '@/services/gameService';
import { userService } from '@/services/userService';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useFavorites } from '@/components/providers/FavoritesProvider';
import { useToast } from '@/components/providers/ToastProvider';

export function useGameDetail() {
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

  const loadGame = useCallback(async () => {
    try {
      setLoading(true);
      let allGames = gameService.getAllGames();
      if (allGames.length === 0) {
        allGames = await gameService.loadGames();
      }
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
  }, [params.id]);

  const loadRatings = useCallback(async () => {
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
  }, [game?.id, user]);

  const handleRate = useCallback(async (rating: number) => {
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
  }, [user, game?.id, myRating, showToast, t]);

  const handlePlayNow = useCallback(() => {
    if (!game) return;
    router.push(`/games/${game.id}/play`);
  }, [game, router]);

  const handleFavoriteToggle = useCallback(async () => {
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
  }, [user, game, isFavorite, toggleFavorite, showToast, t]);

  const handleShare = useCallback(async () => {
    if (!game) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: game.name, text: game.description || `Check out ${game.name}!`, url });
      } catch (error) { /* User cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      showToast(t('common.linkCopied'), 'success');
    }
  }, [game, showToast, t]);

  const handleImageError = useCallback(() => {
    setHasError(true);
  }, []);

  // Effects
  useEffect(() => { loadGame(); }, [params.id]);

  useEffect(() => {
    if (game) {
      setImageUrl(game.image || game.thumbnail || '/placeholder.png');
      loadRatings();
    }
  }, [game]);

  return {
    game, loading, imageUrl, hasError, handleImageError,
    averageRating, totalRatings, myRating, isRating,
    isFavorite, user, t, router,
    handleRate, handlePlayNow, handleFavoriteToggle, handleShare,
  };
}
