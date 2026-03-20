import { useState, useMemo } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameFilters } from '@/features/games/utils/gameFilters';

export function useFeaturedGames() {
    const { allGames, isLoading: isGamesLoading } = useGameStore();

    const [category, setCategory] = useState<any>('all');
    const [page, setPage] = useState(1);
    const gamesPerPage = 25;

    const filteredGames = useMemo(() => {
        return gameFilters.applyAll(allGames, { category });
    }, [allGames, category]);

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
        page,
        totalPages,
        setCategory: (c: any) => { setCategory(c); setPage(1); },
        setPage
    };
}
