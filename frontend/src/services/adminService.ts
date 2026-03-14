import { getAuthHeaders } from './authService';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/admin`;

const ADMIN_USER_KEY = 'admin_user';

interface AdminUser {
    id: number;
    email: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    role: string;
}

interface DashboardStats {
    totalUsers: number;
    totalGames: number;
    totalCategories: number;
    totalPlays: number;
    newUsersThisMonth: number;
    activeUsers: number;
    topGames: any[];
    recentUsers: any[];
}

interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (response.status === 401 || response.status === 403) {
        adminService.logout();
        window.location.href = '/admin/login';
        throw new Error('Phiên đăng nhập hết hạn');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Có lỗi xảy ra');
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export const adminService = {
    // ==================== AUTH ====================
    async login(email: string, password: string): Promise<{ user: AdminUser }> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ login: email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Đăng nhập thất bại');
        }

        const data = await response.json();
        // Only store non-sensitive fields (no email, role, id, bio)
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify({
            username: data.user.username,
            avatarUrl: data.user.avatarUrl,
        }));
        return data;
    },

    async logout() {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Silently fail
        }
        localStorage.removeItem(ADMIN_USER_KEY);
        // Clean up legacy keys if present
        localStorage.removeItem('admin_accessToken');
        localStorage.removeItem('admin_refreshToken');
    },

    getCurrentAdmin(): AdminUser | null {
        const str = localStorage.getItem(ADMIN_USER_KEY);
        return str ? JSON.parse(str) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem(ADMIN_USER_KEY);
    },

    // ==================== DASHBOARD ====================
    async getDashboardStats(): Promise<DashboardStats> {
        return apiRequest('/dashboard/stats');
    },

    // ==================== USERS ====================
    async getUsers(page = 0, size = 20, search?: string): Promise<PageResponse<any>> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (search) params.append('search', search);
        return apiRequest(`/users?${params}`);
    },

    async updateUserRole(userId: number, role: string): Promise<void> {
        return apiRequest(`/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role }),
        });
    },

    async updateUserStatus(userId: number, isActive: boolean): Promise<void> {
        return apiRequest(`/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ isActive }),
        });
    },

    async deleteUser(userId: number): Promise<void> {
        return apiRequest(`/users/${userId}`, { method: 'DELETE' });
    },

    // ==================== GAMES ====================
    async getGames(
        page = 0, 
        size = 20, 
        search?: string, 
        category?: string, 
        system?: string,
        isFeatured?: boolean,
        region?: string
    ): Promise<PageResponse<any>> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (search) params.append('search', search);
        if (category && category !== 'all') params.append('category', category);
        if (system && system !== 'all') params.append('system', system);
        if (isFeatured !== undefined) params.append('isFeatured', String(isFeatured));
        if (region && region !== 'all') params.append('region', region);
        return apiRequest(`/games?${params}`);
    },

    async getFeaturedGames(page = 0, size = 20): Promise<PageResponse<any>> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        return apiRequest(`/games/featured?${params}`);
    },

    async getGameById(gameId: number): Promise<any> {
        return apiRequest(`/games/${gameId}`);
    },

    async createGame(data: any): Promise<any> {
        return apiRequest('/games', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateGame(gameId: number, data: any): Promise<any> {
        return apiRequest(`/games/${gameId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteGame(gameId: number): Promise<void> {
        return apiRequest(`/games/${gameId}`, { method: 'DELETE' });
    },

    async reseedGames(): Promise<{ total: number; added: number; skipped: number }> {
        return apiRequest('/games/reseed', { method: 'POST' });
    },

    // ==================== CATEGORIES ====================
    async getCategories(): Promise<any[]> {
        return apiRequest('/categories');
    },

    async createCategory(data: any): Promise<any> {
        return apiRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateCategory(categoryId: number, data: any): Promise<any> {
        return apiRequest(`/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteCategory(categoryId: number): Promise<void> {
        return apiRequest(`/categories/${categoryId}`, { method: 'DELETE' });
    },

    // ==================== FEATURED TOGGLE ====================
    async toggleFeatured(gameId: number): Promise<any> {
        return apiRequest(`/games/${gameId}/featured`, { method: 'PUT' });
    },

    // ==================== USER DETAIL ====================
    async getUserDetail(userId: number): Promise<any> {
        return apiRequest(`/users/${userId}/detail`);
    },

    // ==================== COMMENTS ====================
    async getComments(page = 0, size = 20, search?: string): Promise<PageResponse<any>> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (search) params.append('search', search);
        return apiRequest(`/comments?${params}`);
    },

    async deleteComment(commentId: number): Promise<void> {
        return apiRequest(`/comments/${commentId}`, { method: 'DELETE' });
    },

    // ==================== ACTIVITY LOG ====================
    async getActivityLogs(page = 0, size = 20, targetType?: string): Promise<PageResponse<any>> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (targetType) params.append('targetType', targetType);
        return apiRequest(`/activity?${params}`);
    },

    // ==================== SETTINGS ====================
    async getProfile(username: string): Promise<any> {
        return apiRequest(`/settings/profile?username=${encodeURIComponent(username)}`);
    },

    async updateProfile(data: any): Promise<any> {
        return apiRequest('/settings/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async changePassword(data: { username: string; currentPassword: string; newPassword: string }): Promise<any> {
        return apiRequest('/settings/password', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // ==================== NOTIFICATIONS ====================
    async getNotifications(): Promise<any[]> {
        return apiRequest('/notifications');
    },

    // ==================== RATINGS ====================
    async getRatings(page = 0, size = 20, search?: string): Promise<PageResponse<any>> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (search) params.append('search', search);
        return apiRequest(`/ratings?${params}`);
    },

    async deleteRating(ratingId: number): Promise<void> {
        return apiRequest(`/ratings/${ratingId}`, { method: 'DELETE' });
    },

    // ==================== ROM UPLOAD ====================
    async uploadRom(file: File, folder?: string): Promise<{ fileName: string; path: string; folder?: string; sizeBytes: number; mode?: string }> {
        // Step 1: Request presigned URL
        const presignRes = await fetch('/api/roms/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name }),
        });

        if (!presignRes.ok) {
            const err = await presignRes.json().catch(() => ({}));
            throw new Error(err.error || 'Lỗi lấy presigned URL');
        }

        const presignData = await presignRes.json();

        // Step 2a: If local mode, fallback to standard route
        if (presignData.mode === 'local') {
            const formData = new FormData();
            formData.append('file', file);
            if (folder) formData.append('folder', folder);

            const response = await fetch('/api/roms/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Upload ROM thất bại');
            }

            return response.json();
        }

        // Step 2b: Production mode - Upload directly to R2
        const uploadRes = await fetch(presignData.presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': presignData.contentType || file.type || 'application/octet-stream'
            }
        });

        if (!uploadRes.ok) {
            throw new Error('Lỗi upload file trực tiếp tới máy chủ lưu trữ (Mã lỗi: ' + uploadRes.status + ')');
        }

        return {
            success: true,
            mode: 'r2',
            fileName: presignData.fileName,
            path: presignData.publicUrl,
            sizeBytes: file.size
        } as any;
    },
};
