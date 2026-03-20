import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { gameService } from '@/services/gameService';
import { gameFilters } from '@/features/games/utils/gameFilters';
import { useGameStore } from '@/features/games/store/gameStore';
import { Game, GameCategoryKey, SortOption } from '@/types';
import { RegionKey } from '@/components/search/RegionFilter';

export function useLibraryGames() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { allGames, isLoading: isGamesLoading } = useGameStore();

  const urlQuery = searchParams.get('q') || '';
  const urlSystem = searchParams.get('system') || 'all';

  // Local state for filters
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [category, setCategory] = useState<GameCategoryKey>('all');
  const [region, setRegion] = useState<RegionKey>('all');
  const [system, setSystem] = useState(urlSystem);
  const [sort, setSort] = useState<SortOption>('name-asc');
  const [page, setPage] = useState(1);
  const gamesPerPage = 25;

  // Sync URL query to local state when URL changes (e.g., from Header search)
  useEffect(() => {
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      setPage(1);
    }
  }, [urlQuery]);

  const filteredGames = useMemo(() => {
    return gameFilters.applyAll(allGames, {
        query: searchQuery,
        category,
        region,
        system,
        sort
    });
  }, [allGames, searchQuery, category, region, system, sort]);

  // Derived pagination
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const paginatedGames = useMemo(() => {
    const start = (page - 1) * gamesPerPage;
    return filteredGames.slice(start, start + gamesPerPage);
  }, [filteredGames, page, gamesPerPage]);

  const handleSearchChange = useCallback((newQuery: string) => {
    setSearchQuery(newQuery);
    setPage(1);
    
    // Update URL without refresh
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const handleCategoryChange = useCallback((newCat: GameCategoryKey) => {
    setCategory(newCat);
    setPage(1);
  }, []);

  const handleRegionChange = useCallback((newRegion: RegionKey) => {
    setRegion(newRegion);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const handleSystemChange = useCallback((newSystem: string) => {
    setSystem(newSystem);
    setPage(1);
    
    // Update URL without refresh
    const params = new URLSearchParams(searchParams.toString());
    if (newSystem && newSystem !== 'all') {
      params.set('system', newSystem);
    } else {
      params.delete('system');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const resetAllFilters = useCallback(() => {
    handleSearchChange('');
    handleCategoryChange('all');
    handleRegionChange('all');
    handleSystemChange('all');
    handleSortChange('name-asc');
  }, [handleSearchChange, handleCategoryChange, handleRegionChange, handleSystemChange, handleSortChange]);

  return {
    allGames,
    isLoading: isGamesLoading,
    filteredGames,
    paginatedGames,
    searchQuery,
    category,
    region,
    sort,
    system,
    page,
    totalPages,
    setSearchQuery: handleSearchChange,
    setCategory: handleCategoryChange,
    setRegion: handleRegionChange,
    setSystem: handleSystemChange,
    setSort: handleSortChange,
    setPage,
    resetAllFilters
  };
}
