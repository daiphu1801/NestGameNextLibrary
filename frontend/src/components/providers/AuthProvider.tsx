'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    login: (data: LoginRequest, rememberMe?: boolean) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
    /** @deprecated Use router.push('/login') instead */
    openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Try to restore session using HttpOnly cookie (auto-sent by browser)
                const restoredUser = await authService.tryAutoRefresh();
                if (restoredUser) {
                    setUser(restoredUser);
                }
            } catch (error) {
                console.error('Failed to restore session', error);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (data: LoginRequest, rememberMe: boolean = false) => {
        try {
            const response = await authService.login(data, rememberMe);
            authService.setLocalUser(response, rememberMe);
            setUser(response.user);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            const response = await authService.register(data);
            authService.setLocalUser(response);
            setUser(response.user);
        } catch (error) {
            console.error('Register failed', error);
            throw error;
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        router.push('/');
    };

    const refreshUser = async () => {
        try {
            const updatedUser = await userService.getProfile();
            setUser(updatedUser);
            // Sync with localStorage (non-sensitive fields only)
            authService.setLocalUser(updatedUser);
        } catch (error) {
            console.error('Failed to refresh user profile', error);
        }
    };

    // Navigate to login page instead of opening modal
    const openLoginModal = () => router.push('/login');

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            refreshUser,
            isLoading,
            openLoginModal
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
