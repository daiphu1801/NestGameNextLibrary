const API_URL = 'http://localhost:8080/api/admin';

const ADMIN_TOKEN_KEY = 'admin_accessToken';
const ADMIN_REFRESH_KEY = 'admin_refreshToken';
const ADMIN_USER_KEY = 'admin_user';

interface AdminUser {
    id: number;
    email: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    role: string;
}

interface AdminAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: AdminUser;
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
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
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
    async login(email: string, password: string): Promise<AdminAuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Đăng nhập thất bại');
        }

        const data: AdminAuthResponse = await response.json();
        localStorage.setItem(ADMIN_TOKEN_KEY, data.accessToken);
        localStorage.setItem(ADMIN_REFRESH_KEY, data.refreshToken);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
        return data;
    },

    logout() {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_REFRESH_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
    },

    getToken(): string | null {
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    },

    getCurrentAdmin(): AdminUser | null {
        const str = localStorage.getItem(ADMIN_USER_KEY);
        return str ? JSON.parse(str) : null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem(ADMIN_TOKEN_KEY);
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
    async getGames(page = 0, size = 20, search?: string, category?: string): Promise<PageResponse<any>> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        return apiRequest(`/games?${params}`);
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
};
