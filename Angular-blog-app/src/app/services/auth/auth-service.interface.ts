import { Signal } from '@angular/core';
import {
    AuthRole,
    AuthUser,
    LoginFormValue,
    RegisterFormValue,
} from './auth.models';
import { Observable } from 'rxjs';

export interface AuthServiceInterface {
    readonly currentUser: Signal<AuthUser | null>;

    login(credentials: LoginFormValue): Observable<AuthUser>;

    register(userData: RegisterFormValue): Observable<AuthUser>;

    logout(): void;

    getAccessToken(): string | null;

    hasRole(role: AuthRole | AuthRole[]): boolean;
}