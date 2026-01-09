import { create } from 'zustand';
import { Game, GameCategoryKey, SortOption } from '@/types';

interface GameStore {
  // State
  allGames: Game[];
  filteredGames: Game[];
  currentCategory: GameCategoryKey;
  searchQuery: string;
  currentSort: SortOption;
  currentPage: number;
  gamesPerPage: number;
  isLoading: boolean;

  // Actions
  setGames: (games: Game[]) => void;
  setFilteredGames: (games: Game[]) => void;
  setCategory: (category: GameCategoryKey) => void;
  setSearchQuery: (query: string) => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;

  // Computed
  getTotalPages: () => number;
  getCurrentPageGames: () => Game[];
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  allGames: [],
  filteredGames: [],
  currentCategory: 'all',
  searchQuery: '',
  currentSort: 'name-asc',
  currentPage: 1,
  gamesPerPage: 25,
  isLoading: true,

  // Actions
  setGames: (games) => set({ allGames: games, filteredGames: games, isLoading: false }),

  setFilteredGames: (games) => set({ filteredGames: games, currentPage: 1 }),

  setCategory: (category) => set({ currentCategory: category, currentPage: 1 }),

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  setSort: (sort) => set({ currentSort: sort }),

  setPage: (page) => set({ currentPage: page }),

  setLoading: (loading) => set({ isLoading: loading }),

  resetFilters: () => set({
    currentCategory: 'all',
    searchQuery: '',
    currentSort: 'name-asc',
    currentPage: 1,
  }),

  // Computed
  getTotalPages: () => {
    const { filteredGames, gamesPerPage } = get();
    return Math.ceil(filteredGames.length / gamesPerPage);
  },

  getCurrentPageGames: () => {
    const { filteredGames, currentPage, gamesPerPage } = get();
    const start = (currentPage - 1) * gamesPerPage;
    const end = start + gamesPerPage;
    return filteredGames.slice(start, end);
  },
}));
