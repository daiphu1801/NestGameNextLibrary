export interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    role: string;
}

export interface LoginRequest {
    login: string; // email or username
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
