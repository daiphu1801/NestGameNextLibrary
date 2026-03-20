import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Game } from '@/types';
import { gameService } from '@/services/gameService';

export function useRandomPlay() {
  const router = useRouter();

  const [allGames, setAllGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<Game[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Load all games on mount
  useEffect(() => {
    const loadGames = async () => {
      const games = await gameService.getAllGames();
      setAllGames(games);
    };
    loadGames();
  }, []);

  const spinRandomGame = useCallback(() => {
    if (allGames.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);

    let spinCount = 0;
    const maxSpins = 15;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allGames.length);
      setSelectedGame(allGames[randomIndex]);
      spinCount++;

      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        const finalIndex = Math.floor(Math.random() * allGames.length);
        const finalGame = allGames[finalIndex];
        setSelectedGame(finalGame);

        setHistory(prev => {
          const newHistory = [finalGame, ...prev.filter(g => g.id !== finalGame.id)];
          return newHistory.slice(0, 5);
        });

        setIsSpinning(false);
        setShowResult(true);
      }
    }, 100);
  }, [allGames, isSpinning]);

  const handlePlayGame = useCallback(() => {
    if (selectedGame) {
      router.push(`/games/${selectedGame.id}/play`);
    }
  }, [selectedGame, router]);

  const selectFromHistory = useCallback((game: Game) => {
    setSelectedGame(game);
    setShowResult(true);
  }, []);

  return {
    allGames, selectedGame, isSpinning, history, showResult,
    spinRandomGame, handlePlayGame, selectFromHistory,
  };
}
