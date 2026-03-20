import { useState, useCallback } from 'react';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { debounce } from '@/lib/utils';
import { Game } from '@/types';
import { useRouter, usePathname } from 'next/navigation';

export function useSearchGame() {
    const router = useRouter();
    const pathname = usePathname();
    const { allGames } = useGameStore();

    const [searchValue, setSearchValue] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Game[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const fetchSuggestions = useCallback(
        debounce((query: string) => {
            if (!query.trim()) {
                setSuggestions([]);
                setIsSearching(false);
                return;
            }
            const results = gameService.searchGames(allGames, query);
            setSuggestions(results);
            setIsSearching(false);
        }, 300),
        [allGames]
    );

    const handleInputChange = (value: string) => {
        setSearchValue(value);
        setIsSearching(true);
        fetchSuggestions(value);
    };

    const handleHotKeywordClick = (keyword: string) => {
        setSearchValue(keyword);
        setIsSearching(true);
        fetchSuggestions(keyword);
    };

    const handleSubmitSearch = () => {
        if (!searchValue.trim()) return;
        setIsSearchOpen(false);
        router.push(`/library?q=${encodeURIComponent(searchValue.trim())}`);
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setSearchValue('');
        }
    };

    return {
        searchValue,
        setSearchValue,
        isSearchOpen,
        setIsSearchOpen,
        suggestions,
        isSearching,
        handleInputChange,
        handleHotKeywordClick,
        handleSubmitSearch,
        toggleSearch
    };
}
