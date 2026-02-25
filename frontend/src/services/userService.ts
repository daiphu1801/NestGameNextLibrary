const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const API_URL = `${BASE_URL}/users/me`;
const GAMES_API_URL = `${BASE_URL}/games`;


export interface GameComment {
    id: number;
    userId: number;
    username: string;
    avatarUrl: string | null;
    content: string;
    createdAt: string;
}

export const userService = {
    // Play History
    async recordPlayHistory(gameId: string | number): Promise<void> {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ gameId: numericId }),
        });

        if (!response.ok) {
            console.error('Failed to record play history');
        }
    },

    async getPlayHistory(): Promise<any[]> {
        const response = await fetch(`${API_URL}/history`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch play history');
        return response.json();
    },

    // Favorites
    async addFavorite(gameId: string | number): Promise<void> {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/favorites/${numericId}`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add to favorites');
        }
    },

    async removeFavorite(gameId: string | number): Promise<void> {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/favorites/${numericId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to remove from favorites');
        }
    },

    async getFavorites(): Promise<any[]> {
        try {
            const response = await fetch(`${API_URL}/favorites`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Failed to fetch favorites:', response.status);
                return [];
            }
            return response.json();
        } catch (error) {
            console.error('Network error fetching favorites:', error);
            return [];
        }
    },

    // =================== PROFILE ===================

    async uploadAvatar(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/avatar`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to upload avatar');
        return data.avatarUrl;
    },

    async deleteAvatar(): Promise<void> {
        const response = await fetch(`${API_URL}/avatar`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to delete avatar');
    },

    async updateKeybindings(config: string): Promise<void> {
        const response = await fetch(`${API_URL}/keybindings`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ config }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to update keybindings');
        }
    },

    async updateBio(bio: string): Promise<void> {
        const response = await fetch(`${API_URL}/bio`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ bio }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to update bio');
        }
    },

    async getProfile(): Promise<any> {
        const response = await fetch(API_URL, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    // =================== GAME RATINGS ===================

    async getGameRating(gameId: number): Promise<{ averageRating: number; totalRatings: number }> {
        const response = await fetch(`${GAMES_API_URL}/${gameId}/ratings`);
        if (!response.ok) return { averageRating: 0, totalRatings: 0 };
        return response.json();
    },

    async getMyRating(gameId: number): Promise<number> {
        const response = await fetch(`${GAMES_API_URL}/${gameId}/ratings/me`, {
            credentials: 'include',
        });

        if (!response.ok) return 0;
        const data = await response.json();
        return data.rating || 0;
    },

    async rateGame(gameId: number, rating: number): Promise<{ averageRating: number }> {
        const response = await fetch(`${GAMES_API_URL}/${gameId}/ratings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ rating }),
        });

        if (!response.ok) throw new Error('Failed to rate game');
        return response.json();
    },

    // =================== GAME COMMENTS ===================

    async getGameComments(gameId: number): Promise<GameComment[]> {
        const response = await fetch(`${GAMES_API_URL}/${gameId}/comments`);
        if (!response.ok) return [];
        return response.json();
    },

    async addComment(gameId: number, content: string): Promise<GameComment> {
        const response = await fetch(`${GAMES_API_URL}/${gameId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to add comment');
        }
        const data = await response.json();
        return data.comment;
    },

    async deleteComment(gameId: number, commentId: number): Promise<void> {
        const response = await fetch(`${GAMES_API_URL}/${gameId}/comments/${commentId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to delete comment');
        }
    },
};
