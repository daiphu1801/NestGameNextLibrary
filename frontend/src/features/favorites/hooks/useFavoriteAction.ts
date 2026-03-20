import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useFavorites } from '@/components/providers/FavoritesProvider';
import { useToast } from '@/components/providers/ToastProvider';

export function useFavoriteAction(gameId: string, onLoginRequired?: () => void) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);

  const isFavorite = checkIsFavorite(gameId);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      setShowLoginTooltip(true);
      setTimeout(() => setShowLoginTooltip(false), 2500);
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
      await toggleFavorite(gameId);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      showToast('Không thể kết nối server. Thử lại sau.', 'error');
    }
  };

  return {
    user,
    isFavorite,
    isAnimating,
    showLoginTooltip,
    handleFavoriteClick
  };
}
