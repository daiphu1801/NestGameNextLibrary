const API_URL = 'http://localhost:8080/api/users/me';

export const userService = {
    // Play History
    async recordPlayHistory(gameId: string | number): Promise<void> {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

        if (!token) {
            console.warn('User not authenticated, skipping play history');
            return;
        }

        // Convert string to number if needed
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
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

        if (!token) {
            return [];
        }

        const response = await fetch(`${API_URL}/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch play history');
        }

        return response.json();
    },

    // Favorites
    async addFavorite(gameId: string | number): Promise<void> {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

        if (!token) {
            throw new Error('User not authenticated');
        }

        // Convert string to number if needed
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/favorites/${numericId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add to favorites');
        }
    },

    async removeFavorite(gameId: string | number): Promise<void> {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

        if (!token) {
            throw new Error('User not authenticated');
        }

        // Convert string to number if needed
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/favorites/${numericId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to remove from favorites');
        }
    },

    async getFavorites(): Promise<any[]> {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

        if (!token) {
            return [];
        }

        try {
            const response = await fetch(`${API_URL}/favorites`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
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
};
