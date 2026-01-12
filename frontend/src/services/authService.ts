import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';

const API_URL = 'http://localhost:8080/api/auth';

export const authService = {
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        return response.json();
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        return response.json();
    },

    async changePassword(data: any): Promise<void> {
        const token = this.getToken();
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

    logout() {
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

    getToken(): string | null {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    },

    setSession(authResponse: AuthResponse, rememberMe: boolean = true) {
        const storage = rememberMe ? localStorage : sessionStorage;

        // Clear other storage to avoid conflict/duplication
        const otherStorage = rememberMe ? sessionStorage : localStorage;
        otherStorage.removeItem('accessToken');
        otherStorage.removeItem('refreshToken');
        otherStorage.removeItem('user');

        storage.setItem('accessToken', authResponse.accessToken);
        storage.setItem('refreshToken', authResponse.refreshToken);
        storage.setItem('user', JSON.stringify(authResponse.user));
    }
};
