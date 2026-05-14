import { InjectionToken } from '@angular/core';
import { CategoriesServiceInterface } from './categories-service.interface';

export const CATEGORIES_SERVICE =
    new InjectionToken<CategoriesServiceInterface>('CATEGORIES_SERVICE');