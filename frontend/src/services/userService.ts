const API_URL = 'http://localhost:8080/api/users/me';
const GAMES_API_URL = 'http://localhost:8080/api/games';

const getToken = () => localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

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
        const token = getToken();

        if (!token) {
            console.warn('User not authenticated, skipping play history');
            return;
        }

        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/history`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ gameId: numericId }),
        });

        if (!response.ok) {
            console.error('Failed to record play history');
        }
    },

    async getPlayHistory(): Promise<any[]> {
        const token = getToken();
        if (!token) return [];

        const response = await fetch(`${API_URL}/history`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch play history');
        return response.json();
    },

    // Favorites
    async addFavorite(gameId: string | number): Promise<void> {
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/favorites/${numericId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add to favorites');
        }
    },

    async removeFavorite(gameId: string | number): Promise<void> {
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/favorites/${numericId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to remove from favorites');
        }
    },

    async getFavorites(): Promise<any[]> {
        const token = getToken();
        if (!token) return [];

        try {
            const response = await fetch(`${API_URL}/favorites`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
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
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to upload avatar');
        return data.avatarUrl;
    },

    async deleteAvatar(): Promise<void> {
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const response = await fetch(`${API_URL}/avatar`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to delete avatar');
    },

    async updateBio(bio: string): Promise<void> {
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const response = await fetch(`${API_URL}/bio`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bio }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to update bio');
        }
    },

    async getProfile(): Promise<any> {
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
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
        const token = getToken();
        if (!token) return 0;

        const response = await fetch(`${GAMES_API_URL}/${gameId}/ratings/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) return 0;
        const data = await response.json();
        return data.rating || 0;
    },

    async rateGame(gameId: number, rating: number): Promise<{ averageRating: number }> {
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const response = await fetch(`${GAMES_API_URL}/${gameId}/ratings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const response = await fetch(`${GAMES_API_URL}/${gameId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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
        const token = getToken();
        if (!token) throw new Error('User not authenticated');

        const response = await fetch(`${GAMES_API_URL}/${gameId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to delete comment');
        }
    },
};

