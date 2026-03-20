import { create } from 'zustand';
import { Game, SortOption } from '@/types';
import { gameService } from '@/services/gameService';

export type RegionKey = 'all' | 'usa' | 'japan' | 'europe' | 'asia' | 'world';

interface GameStore {
  // State
  allGames: Game[];
  currentSystem: string;
  isLoading: boolean;

  // Actions
  setGames: (games: Game[]) => void;
  setSystem: (system: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  allGames: [],
  currentSystem: 'all',
  isLoading: true,

  setGames: (games) => {
    set({ allGames: games, isLoading: false });
  },
  
  setSystem: (system) => set({ currentSystem: system }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
