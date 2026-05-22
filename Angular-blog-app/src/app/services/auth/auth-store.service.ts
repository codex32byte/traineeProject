import { Injectable, signal } from '@angular/core';
import { AuthUser } from './auth.models';

@Injectable({
    providedIn: 'root',
})
export class AuthStoreService {
    public readonly currentUser = signal<AuthUser | null>(null);

    public saveUser(user: AuthUser): void {
        this.currentUser.set(user);
    }

    public clearUser(): void {
        this.currentUser.set(null);
    }
}