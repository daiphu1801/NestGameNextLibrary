// Game Types
export interface Game {
  id: string;
  name: string;
  category: GameCategoryKey;
  path: string;
  image?: string;
  imageSnap?: string;
  imageTitle?: string;
  thumbnail?: string;
  cover?: string;
  description?: string;
  rating?: number;
  year?: number;
  region?: string;
  isFeatured?: boolean;
  fileName?: string;
}

// Category Types
export type GameCategoryKey =
  | 'all'
  | 'platformer'
  | 'rpg'
  | 'sports'
  | 'fighting'
  | 'puzzle'
  | 'racing'
  | 'shooter'
  | 'strategy'
  | 'adventure'
  | 'action'
  | 'arcade'
  | 'simulation'
  | 'other';

export interface GameCategory {
  name: GameCategoryKey;
  icon: string;
  label: string;
  color?: string;
}

// Filter Types
export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'rating-desc'
  | 'year-desc'
  | 'year-asc';

export interface GameFilters {
  category: GameCategoryKey;
  searchQuery: string;
  sortBy: SortOption;
}

// Pagination Types
export interface PaginationState {
  currentPage: number;
  gamesPerPage: number;
  totalPages: number;
}

// Recent Games
export interface RecentGame {
  id: string;
  playedAt: number;
}

// Image Fallback
export interface ImageFallbackConfig {
  urls: string[];
  currentIndex: number;
  failed: boolean;
}
