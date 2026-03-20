import { useState, useEffect } from 'react';
import { Game } from '@/types/game';
import { apiClient } from '@/lib/api';

export function useLeaderboard() {
  const [topGames, setTopGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiClient.get('/leaderboard/top-rated');
        setTopGames(response.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return { topGames, isLoading };
}
