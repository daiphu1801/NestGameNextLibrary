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
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const initAuth = () => {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (data: LoginRequest, rememberMe: boolean = false) => {
        try {
            const response = await authService.login(data);
            authService.setSession(response, rememberMe);
            setUser(response.user);
            setIsLoginModalOpen(false);
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            const response = await authService.register(data);
            authService.setSession(response);
            setUser(response.user);
            setIsLoginModalOpen(false);
        } catch (error) {
            console.error('Register failed', error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        router.push('/');
    };



    const refreshUser = async () => {
        try {
            const updatedUser = await userService.getProfile();
            setUser(updatedUser);

            // Sync with local storage
            const token = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (token) {
                // Update user in local storage without losing tokens
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Failed to refresh user profile', error);
        }
    };

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            refreshUser,
            isLoading,
            isLoginModalOpen,
            openLoginModal,
            closeLoginModal
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

