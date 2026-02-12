'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { userService } from '@/services/userService';
import { useAuth } from './AuthProvider';

interface FavoritesContextType {
    favorites: Set<number>;
    isLoading: boolean;
    isFavorite: (gameId: number | string) => boolean;
    toggleFavorite: (gameId: number | string) => Promise<boolean>;
    refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const pendingOperations = useRef<Set<number>>(new Set());

    // Load favorites when user logs in
    const loadFavorites = useCallback(async () => {
        if (!user) {
            setFavorites(new Set());
            return;
        }

        setIsLoading(true);
        try {
            const data = await userService.getFavorites();
            const ids = new Set(data.map((f: any) => Number(f.id)));
            setFavorites(ids);
        } catch (err) {
            console.error('Failed to load favorites:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    // Check if a game is favorite
    const isFavorite = useCallback((gameId: number | string): boolean => {
        return favorites.has(Number(gameId));
    }, [favorites]);

    // Toggle favorite with optimistic update and debounce
    const toggleFavorite = useCallback(async (gameId: number | string): Promise<boolean> => {
        if (!user) return false;

        const numericId = Number(gameId);

        // Prevent duplicate operations on the same game
        if (pendingOperations.current.has(numericId)) {
            return favorites.has(numericId);
        }

        pendingOperations.current.add(numericId);
        const wasInFavorites = favorites.has(numericId);
        const newState = !wasInFavorites;

        // Optimistic update
        setFavorites(prev => {
            const next = new Set(prev);
            if (newState) {
                next.add(numericId);
            } else {
                next.delete(numericId);
            }
            return next;
        });

        try {
            if (newState) {
                await userService.addFavorite(numericId);
            } else {
                await userService.removeFavorite(numericId);
            }
            return newState;
        } catch (err) {
            console.error('Failed to toggle favorite:', err);

            // Rollback on error
            setFavorites(prev => {
                const next = new Set(prev);
                if (wasInFavorites) {
                    next.add(numericId);
                } else {
                    next.delete(numericId);
                }
                return next;
            });
            return wasInFavorites;
        } finally {
            pendingOperations.current.delete(numericId);
        }
    }, [user, favorites]);

    const refreshFavorites = useCallback(async () => {
        await loadFavorites();
    }, [loadFavorites]);

    return (
        <FavoritesContext.Provider value={{ favorites, isLoading, isFavorite, toggleFavorite, refreshFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
