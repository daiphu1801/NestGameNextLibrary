'use client';

import { SortFilter } from './SortFilter';
import { RegionFilter, RegionKey } from './RegionFilter';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { SortOption } from '@/types';

export function FilterToolbar() {
    const {
        allGames,
        currentCategory,
        searchQuery,
        currentSort,
        currentRegion,
        setSort,
        setRegion,
        setFilteredGames
    } = useGameStore();

    const applyFilters = (sort: SortOption, region: string) => {
        let filtered = allGames;

        // Apply category filter
        filtered = gameService.filterByCategory(filtered, currentCategory);

        // Apply search filter
        filtered = gameService.searchGames(filtered, searchQuery);

        // Apply region filter
        filtered = gameService.filterByRegion(filtered, region);

        // Apply sort
        filtered = gameService.sortGames(filtered, sort);

        setFilteredGames(filtered);
    };

    const handleSortChange = (sort: SortOption) => {
        setSort(sort);
        applyFilters(sort, currentRegion);
    };

    const handleRegionChange = (region: RegionKey) => {
        setRegion(region);
        applyFilters(currentSort, region);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-2 rounded-xl bg-secondary/20 border border-white/5">
            {/* Sort Filter */}
            <SortFilter value={currentSort} onChange={handleSortChange} />

            {/* Region Filter */}
            <RegionFilter value={currentRegion as RegionKey} onChange={handleRegionChange} />
        </div>
    );
}
