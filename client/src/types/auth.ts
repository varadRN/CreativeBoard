export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    emailVerified: boolean;
    createdAt: string;
    color?: string;
    isGuest?: boolean;
}

export interface AuthResponse {
    success: boolean;
    data: {
        user: User;
        accessToken?: string;
        refreshToken?: string;
    };
}

export interface LoginResponse {
    success: boolean;
    data: {
        user: User;
        accessToken: string;
    };
}
