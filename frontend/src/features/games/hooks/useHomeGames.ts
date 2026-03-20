import { useEffect } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { validateEnv } from '@/config/env';

export function useHomeGames() {
  const { setGames, isLoading, allGames } = useGameStore();

  useEffect(() => {
    validateEnv();
    const loadGames = async () => {
      const games = await gameService.loadGames();
      setGames(games);
    };
    loadGames();
  }, [setGames]);

  return {
    allGames,
    isLoading
  };
}
