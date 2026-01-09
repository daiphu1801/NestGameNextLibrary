import { Game, GameCategoryKey, SortOption } from '@/types';
import gamesData from '@/data/games.json';

class GameService {
  private games: Game[] = [];

  async loadGames(): Promise<Game[]> {
    try {
      // In production, this could be an API call
      this.games = gamesData as unknown as Game[];
      return this.games;
    } catch (error) {
      console.error('Failed to load games:', error);
      return [];
    }
  }

  getAllGames(): Game[] {
    return this.games;
  }

  getGameById(id: string): Game | undefined {
    return this.games.find(game => game.id === id);
  }

  filterByCategory(games: Game[], category: GameCategoryKey): Game[] {
    if (category === 'all') return games;
    return games.filter(game => game.category === category);
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

    // Helper to check if game is "hot"
    const isHot = (game: Game) => game.isFeatured || (game.rating && game.rating >= 4.5);

    // Sort by the selected option first
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

    // Then prioritize hot games to the top while maintaining sort order within each group
    const hotGames = result.filter(isHot);
    const regularGames = result.filter(g => !isHot(g));

    return [...hotGames, ...regularGames];
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
