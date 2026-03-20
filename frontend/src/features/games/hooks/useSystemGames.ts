import { useState, useMemo } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameFilters } from '@/features/games/utils/gameFilters';

export function useSystemGames() {
    const { allGames, isLoading: isGamesLoading, currentSystem } = useGameStore();

    const [category, setCategory] = useState<any>('all');
    const [region, setRegion] = useState<any>('all');
    const [sort, setSort] = useState<any>('name-asc');
    const [page, setPage] = useState(1);
    const gamesPerPage = 25;

    const filteredGames = useMemo(() => {
        return gameFilters.applyAll(allGames, { 
            category, 
            region, 
            sort, 
            system: currentSystem 
        });
    }, [allGames, category, region, sort, currentSystem]);

    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
    const paginatedGames = useMemo(() => {
        const start = (page - 1) * gamesPerPage;
        return filteredGames.slice(start, start + gamesPerPage);
    }, [filteredGames, page, gamesPerPage]);

    return {
        isLoading: isGamesLoading,
        filteredGames,
        paginatedGames,
        category,
        region,
        sort,
        page,
        totalPages,
        setCategory: (c: any) => { setCategory(c); setPage(1); },
        setRegion: (r: any) => { setRegion(r); setPage(1); },
        setSort: (s: any) => { setSort(s); setPage(1); },
        setPage
    };
}
