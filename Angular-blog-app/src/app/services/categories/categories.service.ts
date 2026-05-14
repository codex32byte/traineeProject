import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ArticleCategory } from '../../ui/models/category.interface';
import { CategoriesServiceInterface } from './categories-service.interface';

@Injectable()
export class CategoriesService implements CategoriesServiceInterface {
    private readonly storageKey = 'blogCategories';

    public getCategories(): Observable<ArticleCategory[]> {
        return of(this.getCategoriesFromStorage());
    }

    public createCategory(name: string): Observable<ArticleCategory> {
        const categories = this.getCategoriesFromStorage();

        const newCategory: ArticleCategory = {
            id: crypto.randomUUID(),
            name: name.trim(),
        };

        const updatedCategories = [...categories, newCategory];

        this.saveCategoriesToStorage(updatedCategories);

        return of(newCategory);
    }

    public getOrCreateCategory(name: string): Observable<ArticleCategory> {
        const normalizedName = name.trim();
        const categories = this.getCategoriesFromStorage();

        const existingCategory = categories.find(category =>
            category.name.toLowerCase() === normalizedName.toLowerCase()
        );

        if (existingCategory) {
            return of(existingCategory);
        }

        return this.createCategory(normalizedName);
    }

    private getCategoriesFromStorage(): ArticleCategory[] {
        const categoriesJson = localStorage.getItem(this.storageKey);

        if (!categoriesJson) {
            return [];
        }

        return JSON.parse(categoriesJson) as ArticleCategory[];
    }

    private saveCategoriesToStorage(categories: ArticleCategory[]): void {
        localStorage.setItem(this.storageKey, JSON.stringify(categories));
    }
}