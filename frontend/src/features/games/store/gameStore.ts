import { create } from 'zustand';
import { Game, GameCategoryKey, SortOption } from '@/types';
import { gameService } from '@/services/gameService';

export type RegionKey = 'all' | 'usa' | 'japan' | 'europe' | 'asia' | 'world';

interface GameStore {
  // State
  allGames: Game[];
  filteredGames: Game[];
  currentCategory: GameCategoryKey;
  searchQuery: string;
  currentSort: SortOption;
  currentRegion: RegionKey;
  currentSystem: string;
  currentPage: number;
  gamesPerPage: number;
  isLoading: boolean;

  // Actions
  setGames: (games: Game[]) => void;
  setFilteredGames: (games: Game[]) => void;
  setCategory: (category: GameCategoryKey) => void;
  setSearchQuery: (query: string) => void;
  setSort: (sort: SortOption) => void;
  setRegion: (region: RegionKey) => void;
  setSystem: (system: string) => void;
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
  currentRegion: 'all',
  currentSystem: 'all',
  currentPage: 1,
  gamesPerPage: 25,
  isLoading: true,

  // Actions
  setGames: (games) => {
    const { searchQuery, currentCategory, currentRegion, currentSystem, currentSort } = get();

    let filtered = games;

    // Preserve existing filters when games array is loaded/updated
    if (searchQuery) filtered = gameService.searchGames(filtered, searchQuery);
    if (currentCategory !== 'all') filtered = gameService.filterByCategory(filtered, currentCategory);
    if (currentRegion !== 'all') filtered = gameService.filterByRegion(filtered, currentRegion);
    if (currentSystem !== 'all') filtered = gameService.filterBySystem(filtered, currentSystem);

    // Default sorting
    filtered = gameService.sortGames(filtered, currentSort || 'name-asc');

    set({ allGames: games, filteredGames: filtered, isLoading: false });
  },

  setFilteredGames: (games) => set({ filteredGames: games, currentPage: 1 }),

  setCategory: (category) => set({ currentCategory: category, currentPage: 1 }),

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),

  setSort: (sort) => set({ currentSort: sort }),

  setRegion: (region) => set({ currentRegion: region, currentPage: 1 }),

  setSystem: (system) => set({ currentSystem: system, currentPage: 1 }),

  setPage: (page) => set({ currentPage: page }),

  setLoading: (loading) => set({ isLoading: loading }),

  resetFilters: () => set({
    currentCategory: 'all',
    searchQuery: '',
    currentSort: 'name-asc',
    currentRegion: 'all',
    currentSystem: 'all',
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
