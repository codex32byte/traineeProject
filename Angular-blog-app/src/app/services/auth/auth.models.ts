export const ACCESS_TOKEN_STORAGE_KEY = 'access_token';
export const AUTH_USER_STORAGE_KEY = 'authUser';
export const AUTH_USERS_STORAGE_KEY = 'authUsers';

export type AuthRole = 'user' | 'admin' | 'moderator';

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    role: AuthRole;
}

export interface LoginFormValue {
    login: string;
    password: string;
}

export interface RegisterFormValue {
    username: string;
    email: string;
    password: string;
}

export interface AuthLoginResponse {
    access_token: string;
    token_type: string;
    expires_in: string;
    user: AuthUser;
}

export interface AuthRegisterResponse {
    message: string;
    user: AuthUser;
}

export interface LocalAuthUser extends AuthUser {
    password: string;
}