import { Game, GameCategoryKey, SortOption } from '@/types';
import apiClient from '@/lib/api';
import gamesData from '@/data/games.json';

// Backend GameDTO type
interface GameDTO {
  id: number;
  name: string;
  fileName: string;
  path: string;
  category: string;
  categoryId: number;
  categoryName: string;
  description?: string;
  rating?: number;
  year?: number;
  region?: string;
  isFeatured?: boolean;
  imageUrl?: string;
  imageSnap?: string;
  imageTitle?: string;
  playCount?: number;
  createdAt?: string;
  updatedAt?: string;
  system?: string;
  isMustPlay?: boolean;
}

class GameService {
  private games: Game[] = [];
  private useBackend: boolean = true;

  // Map backend GameDTO to frontend Game type
  private mapGameDTO(dto: GameDTO): Game {
    return {
      id: dto.id.toString(), // Convert number to string
      name: dto.name,
      fileName: dto.fileName,
      path: dto.path,
      category: this.normalizeCategoryKey(dto.category || dto.categoryName || 'other'),
      categoryName: dto.categoryName,
      description: dto.description,
      rating: dto.rating,
      year: dto.year,
      region: dto.region,
      isFeatured: dto.isFeatured,
      imageUrl: dto.imageUrl,
      image: dto.imageUrl, // Use imageUrl as image
      imageSnap: dto.imageSnap,
      imageTitle: dto.imageTitle,
      thumbnail: dto.imageUrl, // Use imageUrl as thumbnail
      playCount: dto.playCount,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      system: dto.system || this.detectSystemFromPath(dto.fileName || dto.path),
      isMustPlay: dto.isMustPlay,
    };
  }

  // Auto-detect system from file extension as a fallback
  private detectSystemFromPath(pathName: string): string {
    if (!pathName) return 'nes'; // default
    const lowerPath = pathName.toLowerCase();
    
    if (lowerPath.endsWith('.sfc') || lowerPath.endsWith('.smc')) return 'snes';
    if (lowerPath.endsWith('.gba')) return 'gba';
    if (lowerPath.endsWith('.md') || lowerPath.endsWith('.bin') || lowerPath.endsWith('.gen')) return 'genesis';
    if (lowerPath.endsWith('.nes')) return 'nes';
    if (lowerPath.endsWith('.jar') || lowerPath.endsWith('.jad')) return 'j2me';
    
    // For zip files or unknown, we just return 'nes' for now until backend is updated
    return 'nes';
  }

  // Normalize category to match frontend keys
  private normalizeCategoryKey(category: string): GameCategoryKey {
    const normalized = category.toLowerCase().trim();
    const validCategories = [
      'platformer', 'rpg', 'sports', 'fighting', 'puzzle', 'racing',
      'shooter', 'strategy', 'adventure', 'action', 'arcade', 'simulation'
    ];

    if (validCategories.includes(normalized)) {
      return normalized as GameCategoryKey;
    }
    return 'other';
  }

  async loadGames(isFeatured?: boolean): Promise<Game[]> {
    try {
      // Try to load from backend API
      if (this.useBackend) {
        try {
          const params: any = {
            page: 0,
            size: 9999, // Load all games
            sortBy: 'name',
            sortDir: 'asc'
          };

          if (isFeatured !== undefined) {
            params.isFeatured = isFeatured;
          }

          const response = await apiClient.get<{ content: GameDTO[]; totalElements: number }>('/games', {
            params
          });

          let downloadedGames = response.data.content.map(dto => this.mapGameDTO(dto));

          // Temporary fallback filter in case backend hasn't been restarted yet and ignores isFeatured param
          if (isFeatured) {
            downloadedGames = downloadedGames.filter(g => g.isFeatured);
          }

          this.games = downloadedGames;
          console.log(`✅ Loaded ${this.games.length} games from backend`);
          return this.games;
        } catch (apiError) {
          console.warn('⚠️ Backend API not available, falling back to JSON:', apiError);
          this.useBackend = false;
        }
      }

      // Fallback to JSON
      let fallbackGames = gamesData as unknown as Game[];
      if (isFeatured) {
        fallbackGames = fallbackGames.filter(g => g.isFeatured);
      }
      this.games = fallbackGames;
      console.log(`📦 Loaded ${this.games.length} games from JSON fallback`);
      return this.games;
    } catch (error) {
      console.error('Failed to load games:', error);
      return [];
    }
  }

  /**
   * Load games with SERVER-SIDE pagination and filtering.
   * Much faster than loadGames() for pages that only need a subset (e.g. /java, /library).
   */
  async loadGamesPaginated(options: {
    page?: number;
    size?: number;
    system?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortDir?: string;
    isFeatured?: boolean;
    isMustPlay?: boolean;
  } = {}): Promise<{ games: Game[]; totalPages: number; totalElements: number; currentPage: number }> {
    const { page = 0, size = 25, system, category, search, sortBy = 'name', sortDir = 'asc', isFeatured, isMustPlay } = options;

    try {
      if (this.useBackend) {
        try {
          const params: Record<string, any> = { page, size, sortBy, sortDir };
          if (system) params.system = system;
          if (category) params.category = category;
          if (search) params.search = search;
          if (isFeatured !== undefined) params.isFeatured = isFeatured;
          if (isMustPlay !== undefined) params.isMustPlay = isMustPlay;

          let endpoint = '/games';
          if (isMustPlay) {
             endpoint = '/games/special/must-play'; // Special direct endpoint
             delete params.isMustPlay; // No need query param when using direct endpoint
          }

          const response = await apiClient.get<{
            content: GameDTO[];
            totalElements: number;
            totalPages: number;
            number: number;
          }>(endpoint, { params });

          const games = response.data.content.map(dto => this.mapGameDTO(dto));
          return {
            games,
            totalPages: response.data.totalPages,
            totalElements: response.data.totalElements,
            currentPage: response.data.number,
          };
        } catch (apiError) {
          console.warn('⚠️ Backend API not available for paginated load, falling back to JSON');
          this.useBackend = false;
        }
      }

      // Fallback: client-side pagination from JSON
      let fallback = gamesData as unknown as Game[];
      if (system) fallback = fallback.filter(g => g.system === system);
      if (search) fallback = fallback.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
      const totalElements = fallback.length;
      const totalPages = Math.ceil(totalElements / size);
      const start = page * size;
      const games = fallback.slice(start, start + size);

      return { games, totalPages, totalElements, currentPage: page };
    } catch (error) {
      console.error('Failed to load paginated games:', error);
      return { games: [], totalPages: 0, totalElements: 0, currentPage: 0 };
    }
  }

  getAllGames(): Game[] {
    return this.games;
  }

  async getGameById(id: string): Promise<Game | undefined> {
    // Try backend API first
    if (this.useBackend) {
      try {
        const response = await apiClient.get<GameDTO>(`/games/${id}`);
        return this.mapGameDTO(response.data);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch game ${id} from backend, falling back to local cache`);
      }
    }

    // Fallback to local cache
    return this.games.find(game => game.id === id);
  }

  async getGameOfTheMonth(): Promise<Game | undefined> {
    if (this.useBackend) {
      try {
        const response = await apiClient.get<GameDTO>('/games/special/game-of-the-month');
        if (response.data) {
           return this.mapGameDTO(response.data);
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch Game of the Month from backend');
      }
    }
    return undefined;
  }

  filterByCategory(games: Game[], category: GameCategoryKey): Game[] {
    if (category === 'all') return games;
    return games.filter(game => game.category === category);
  }

  filterByRegion(games: Game[], region: string): Game[] {
    if (region === 'all') return games;

    const regionPatterns: Record<string, string[]> = {
      usa: ['USA', '🇺🇸', '(U)', 'United States'],
      japan: ['Japan', '🇯🇵', '(J)', 'Japanese'],
      europe: ['Europe', '🇪🇺', '(E)', 'European'],
      asia: ['Asia', '🌏', '(As)'],
    };

    const patterns = regionPatterns[region] || [];
    if (patterns.length === 0) return games;

    return games.filter(game => {
      const regionStr = game.region || '';
      return patterns.some(pattern => regionStr.includes(pattern));
    });
  }

  filterBySystem(games: Game[], system: string): Game[] {
    if (system === 'all') return games;
    return games.filter(game => game.system === system);
  }

  searchGames(games: Game[], query: string): Game[] {
    if (!query.trim()) return games;

    const lowerQuery = query.toLowerCase();
    return games.filter(game =>
      game.name.toLowerCase().includes(lowerQuery) ||
      game.category.toLowerCase().includes(lowerQuery) ||
      game.description?.toLowerCase().includes(lowerQuery)
    );
  }

  sortGames(games: Game[], sortBy: SortOption): Game[] {
    const sorted = [...games];

    // Sort by the selected option
    let result: Game[];
    switch (sortBy) {
      case 'name-asc':
        result = sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'name-desc':
        result = sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'rating-desc':
        result = sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;

      case 'year-desc':
        result = sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;

      case 'year-asc':
        result = sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;

      default:
        result = sorted;
    }

    return result;
  }

  async getTopGames(type: 'hot' | 'new' | 'top', limit: number = 5): Promise<Game[]> {
    if (this.useBackend) {
      try {
        let sortBy = 'playCount';
        let sortDir = 'desc';

        if (type === 'new') {
          sortBy = 'createdAt';
        } else if (type === 'top') {
          sortBy = 'rating';
        }

        const response = await apiClient.get<{ content: GameDTO[]; totalElements: number }>('/games', {
          params: {
            page: 0,
            size: limit,
            sortBy,
            sortDir
          }
        });
        return response.data.content.map(dto => this.mapGameDTO(dto));
      } catch (error) {
        console.warn(`⚠️ Failed to fetch top ${type} games from backend, falling back to local cache`);
      }
    }

    // Fallback to local cache
    let sorted = [...this.games];
    if (type === 'hot') {
      sorted.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (type === 'new') {
      sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (type === 'top') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return sorted.slice(0, limit);
  }

  getFeaturedGames(limit: number = 10): Game[] {
    return this.games
      .filter(game => game.isFeatured || (game.rating && game.rating >= 4))
      .slice(0, limit);
  }

  getGamesByCategory(category: GameCategoryKey): Game[] {
    return this.filterByCategory(this.games, category);
  }

  getCategoryStats(): Record<GameCategoryKey, number> {
    const stats: Record<string, number> = {
      all: this.games.length,
    };

    this.games.forEach(game => {
      stats[game.category] = (stats[game.category] || 0) + 1;
    });

    return stats as Record<GameCategoryKey, number>;
  }
}

export const gameService = new GameService();
