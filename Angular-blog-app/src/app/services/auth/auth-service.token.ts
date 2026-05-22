import { InjectionToken } from '@angular/core';
import { AuthServiceInterface } from './auth-service.interface';

export const AUTH_SERVICE =
    new InjectionToken<AuthServiceInterface>('AUTH_SERVICE');