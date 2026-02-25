const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/users/me/save-states`;

export interface SaveSlotInfo {
    id: number;
    gameId: number;
    gameName: string;
    slot: number;
    hasThumbnail: boolean;
    stateSize: number;
    updatedAt: string;
}

export const saveStateService = {

    /**
     * Upload save state to server
     */
    async saveToServer(
        gameId: string | number,
        slot: number,
        stateBlob: Blob,
        thumbnailBlob?: Blob
    ): Promise<SaveSlotInfo> {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const formData = new FormData();
        formData.append('state', stateBlob, 'save.state');
        if (thumbnailBlob) {
            formData.append('thumbnail', thumbnailBlob, 'thumbnail.png');
        }

        const response = await fetch(`${API_URL}/${numericId}/slot/${slot}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to save state');
        }

        return response.json();
    },

    /**
     * Download save state from server
     */
    async loadFromServer(gameId: string | number, slot: number): Promise<Blob> {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/${numericId}/slot/${slot}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to load save state');
        }

        return response.blob();
    },

    /**
     * Get thumbnail for a save slot
     */
    async getThumbnailUrl(gameId: string | number, slot: number): Promise<string | null> {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        try {
            const response = await fetch(`${API_URL}/${numericId}/slot/${slot}/thumbnail`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) return null;

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch {
            return null;
        }
    },

    /**
     * List all save slots for a game
     */
    async listSlots(gameId: string | number): Promise<SaveSlotInfo[]> {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        try {
            const response = await fetch(`${API_URL}/${numericId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) return [];
            return response.json();
        } catch {
            return [];
        }
    },

    /**
     * Delete a save slot
     */
    async deleteSlot(gameId: string | number, slot: number): Promise<void> {
        const numericId = typeof gameId === 'string' ? parseInt(gameId) : gameId;

        const response = await fetch(`${API_URL}/${numericId}/slot/${slot}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to delete save state');
        }
    },
};
