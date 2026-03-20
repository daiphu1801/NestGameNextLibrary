import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { StarRating } from './StarRating';
import { GameComments } from './GameComments';
import { userService } from '@/services/userService';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface GameReviewSectionProps {
  gameId: number;
}

export function GameReviewSection({ gameId }: GameReviewSectionProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const [ratingData, myRatingData] = await Promise.all([
          userService.getGameRating(gameId),
          user ? userService.getMyRating(gameId) : Promise.resolve(0)
        ]);
        setAverageRating(ratingData.averageRating);
        setTotalRatings(ratingData.totalRatings);
        setMyRating(myRatingData);
      } catch (error) {
        console.error('Failed to load ratings:', error);
      }
    };
    
    if (gameId) {
      loadRatings();
    }
  }, [gameId, user]);

  useEffect(() => {
    if (!user) {
      setMyRating(0);
    }
  }, [user]);

  const handleRate = async (rating: number) => {
    if (!user || !gameId) return;
    setIsRating(true);
    try {
      const result = await userService.rateGame(gameId, rating);
      setMyRating(rating);
      setAverageRating(result.averageRating);
      setTotalRatings(prev => myRating === 0 ? prev + 1 : prev);
    } catch (error) {
      console.error('Failed to rate game:', error);
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Rating Block */}
      <div className="flex flex-col items-center sm:items-start gap-2 bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-2">{t('gameDetails.ratings') || 'Đánh giá'}</h3>
        <div className="flex items-center gap-2">
          <StarRating
            rating={averageRating}
            size="lg"
            readonly
            showValue
            totalRatings={totalRatings}
          />
        </div>
        {user ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <span>{t('gameDetails.yourRating') || 'Đánh giá của bạn'}:</span>
            <StarRating
              rating={myRating}
              size="md"
              onRate={handleRate}
            />
            {isRating && <Loader2 className="w-4 h-4 animate-spin" />}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">
            {t('gameDetails.loginToRate') || 'Đăng nhập để đánh giá'}
          </p>
        )}
      </div>

      {/* Comments Block */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <GameComments gameId={gameId} />
      </div>
    </div>
  );
}
