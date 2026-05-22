import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { AuthServiceInterface } from './auth-service.interface';
import { AuthStoreService } from './auth-store.service';
import {
    ACCESS_TOKEN_STORAGE_KEY,
    AUTH_USER_STORAGE_KEY,
    AUTH_USERS_STORAGE_KEY,
    AuthRole,
    AuthUser,
    LocalAuthUser,
    LoginFormValue,
    RegisterFormValue,
} from './auth.models';

@Injectable()
export class AuthService implements AuthServiceInterface {
    private readonly authStore = inject(AuthStoreService);

    public readonly currentUser = this.authStore.currentUser;

    constructor() {
        this.createDefaultAdmin();
        this.restoreUser();
    }

    public login(credentials: LoginFormValue): Observable<AuthUser> {
        const login = credentials.login.trim().toLowerCase();
        const password = credentials.password;

        const user = this.getUsers().find(savedUser => {
            return (
                savedUser.username.toLowerCase() === login ||
                savedUser.email.toLowerCase() === login
            ) && savedUser.password === password;
        });

        if (!user) {
            return throwError(() => new Error('Неверный логин или пароль'));
        }

        return of(this.completeLogin(user));
    }

    public register(userData: RegisterFormValue): Observable<AuthUser> {
        const users = this.getUsers();

        const username = userData.username.trim();
        const email = userData.email.trim().toLowerCase();

        const isUserExisting = users.some(user =>
            user.username.toLowerCase() === username.toLowerCase() ||
            user.email.toLowerCase() === email
        );

        if (isUserExisting) {
            return throwError(() =>
                new Error('Пользователь с таким именем или email уже существует')
            );
        }

        const newUser: LocalAuthUser = {
            id: crypto.randomUUID(),
            username,
            email,
            password: userData.password,
            role: 'user',
        };

        this.saveUsers([...users, newUser]);

        return this.login({
            login: newUser.username,
            password: userData.password,
        });
    }

    public logout(): void {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        this.authStore.clearUser();
    }

    public getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    }

    public hasRole(role: AuthRole | AuthRole[]): boolean {
        const user = this.currentUser();

        if (!user) {
            return false;
        }

        const allowedRoles = Array.isArray(role) ? role : [role];

        return allowedRoles.includes(user.role);
    }

    private completeLogin(user: LocalAuthUser): AuthUser {
        const authUser: AuthUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        localStorage.setItem(
            ACCESS_TOKEN_STORAGE_KEY,
            `local-token-${crypto.randomUUID()}`
        );

        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authUser));
        this.authStore.saveUser(authUser);

        return authUser;
    }

    private restoreUser(): void {
        const userJson = localStorage.getItem(AUTH_USER_STORAGE_KEY);
        const token = this.getAccessToken();

        if (!userJson || !token) {
            this.logout();
            return;
        }

        this.authStore.saveUser(JSON.parse(userJson) as AuthUser);
    }

    private createDefaultAdmin(): void {
        const users = this.getUsers();
        const hasAdmin = users.some(user => user.role === 'admin');

        if (hasAdmin) {
            return;
        }

        const adminUser: LocalAuthUser = {
            id: crypto.randomUUID(),
            username: 'admin',
            email: 'admin@webwave3.io',
            password: 'admin123',
            role: 'admin',
        };

        this.saveUsers([adminUser, ...users]);
    }

    private getUsers(): LocalAuthUser[] {
        const usersJson = localStorage.getItem(AUTH_USERS_STORAGE_KEY);

        if (!usersJson) {
            return [];
        }

        return JSON.parse(usersJson) as LocalAuthUser[];
    }

    private saveUsers(users: LocalAuthUser[]): void {
        localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
    }
}