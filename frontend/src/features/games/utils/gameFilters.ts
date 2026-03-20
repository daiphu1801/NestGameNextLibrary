import { Game, GameCategoryKey, SortOption } from '@/types';
import { RegionKey } from '@/components/search/RegionFilter';
import { gameService } from '@/services/gameService';

export interface FilterOptions {
    query?: string;
    category?: GameCategoryKey;
    region?: RegionKey;
    system?: string;
    sort?: SortOption;
}

export const gameFilters = {
    applyAll: (games: Game[], options: FilterOptions): Game[] => {
        let result = games;
        
        if (options.query) result = gameService.searchGames(result, options.query);
        if (options.category && options.category !== 'all') result = gameService.filterByCategory(result, options.category);
        if (options.region && options.region !== 'all') result = gameService.filterByRegion(result, options.region);
        if (options.system && options.system !== 'all') result = gameService.filterBySystem(result, options.system);
        
        return gameService.sortGames(result, options.sort || 'name-asc');
    }
};
