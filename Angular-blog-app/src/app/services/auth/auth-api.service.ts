import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable, switchMap, take } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthServiceInterface } from './auth-service.interface';
import { AuthStoreService } from './auth-store.service';
import {
    ACCESS_TOKEN_STORAGE_KEY,
    AUTH_USER_STORAGE_KEY,
    AuthLoginResponse,
    AuthRegisterResponse,
    AuthRole,
    AuthUser,
    LoginFormValue,
    RegisterFormValue,
} from './auth.models';

@Injectable()
export class AuthApiService implements AuthServiceInterface {
    private readonly http = inject(HttpClient);
    private readonly authStore = inject(AuthStoreService);

    private readonly authUrl = `${environment.apiUrl}/auth`;
    private readonly usersUrl = `${environment.apiUrl}/users`;

    public readonly currentUser = this.authStore.currentUser;

    constructor() {
        this.restoreUser();
    }

    public login(credentials: LoginFormValue): Observable<AuthUser> {
        return this.http
            .post<AuthLoginResponse>(
                `${this.authUrl}/login`,
                {
                    login: credentials.login.trim(),
                    password: credentials.password,
                },
                {
                    withCredentials: true,
                }
            )
            .pipe(
                map(response => {
                    localStorage.setItem(
                        ACCESS_TOKEN_STORAGE_KEY,
                        response.access_token
                    );

                    localStorage.setItem(
                        AUTH_USER_STORAGE_KEY,
                        JSON.stringify(response.user)
                    );

                    this.authStore.saveUser(response.user);

                    return response.user;
                })
            );
    }

    public register(userData: RegisterFormValue): Observable<AuthUser> {
        return this.http
            .post<AuthRegisterResponse>(`${this.usersUrl}/register`, {
                username: userData.username.trim(),
                email: userData.email.trim(),
                password: userData.password,
            })
            .pipe(
                switchMap(() =>
                    this.login({
                        login: userData.username,
                        password: userData.password,
                    })
                )
            );
    }

    public logout(): void {
        this.http
            .post(
                `${this.authUrl}/logout`,
                {},
                {
                    withCredentials: true,
                }
            )
            .pipe(
                take(1),
                catchError(error => {
                    console.error('Logout request failed:', error);
                    return EMPTY;
                })
            )
            .subscribe();

        this.clearSession();
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

    private restoreUser(): void {
        const token = this.getAccessToken();
        const savedUser = this.getSavedUser();

        if (savedUser) {
            this.authStore.saveUser(savedUser);
        }

        if (!token) {
            this.clearSession();
            return;
        }

        this.http
            .get<AuthUser>(`${this.authUrl}/me`)
            .pipe(
                take(1),
                catchError(error => {
                    console.error('Failed to restore auth user:', error);
                    this.clearSession();
                    return EMPTY;
                })
            )
            .subscribe(user => {
                localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
                this.authStore.saveUser(user);
            });
    }

    private getSavedUser(): AuthUser | null {
        const userJson = localStorage.getItem(AUTH_USER_STORAGE_KEY);

        if (!userJson) {
            return null;
        }

        return JSON.parse(userJson) as AuthUser;
    }

    private clearSession(): void {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        this.authStore.clearUser();
    }
}