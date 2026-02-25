import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth`;


export const authService = {
    async login(data: LoginRequest): Promise<{ user: User }> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        return response.json();
    },

    async register(data: RegisterRequest): Promise<{ user: User }> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        return response.json();
    },

    async changePassword(data: any): Promise<void> {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to change password');
        }
    },

    async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; expiresAt?: string }> {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Không thể gửi mã OTP');
        }

        return response.json();
    },

    async verifyOtp(email: string, otpCode: string): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otpCode }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Mã OTP không hợp lệ');
        }

        return response.json();
    },

    async resetPassword(email: string, otpCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otpCode, newPassword }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Không thể đặt lại mật khẩu');
        }

        return response.json();
    },

    async logout(): Promise<void> {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Silently fail — cookies may already be cleared
        }
        // Clean up any remaining localStorage/sessionStorage data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    setLocalUser(user: User | { user: User }) {
        // Store only non-sensitive fields
        const u = 'user' in user ? user.user : user;
        const safeUser = {
            id: u.id,
            username: u.username,
            avatarUrl: u.avatarUrl,
        };
        localStorage.setItem('user', JSON.stringify(safeUser));
    },

    /**
     * Try to auto-restore session on page load by calling refresh endpoint.
     * Cookies are sent automatically by the browser.
     */
    async tryAutoRefresh(): Promise<User | null> {
        try {
            const response = await fetch(`${API_URL}/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            this.setLocalUser(data);
            return data.user;
        } catch {
            return null;
        }
    }
};
