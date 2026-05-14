import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ArticleCategory } from '../../ui/models/category.interface';
import { BackendCategory } from './categories-api.models';
import { CategoriesServiceInterface } from './categories-service.interface';

@Injectable()
export class CategoriesApiService implements CategoriesServiceInterface {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/categories`;

    public getCategories(): Observable<ArticleCategory[]> {
        return this.http
            .get<BackendCategory[]>(this.apiUrl)
            .pipe(
                map(categories => categories.map(category => this.mapCategory(category)))
            );
    }

    public createCategory(name: string): Observable<ArticleCategory> {
        return this.http
            .post<BackendCategory>(this.apiUrl, {
                name: name.trim(),
            })
            .pipe(map(category => this.mapCategory(category)));
    }

    public getOrCreateCategory(name: string): Observable<ArticleCategory> {
        const normalizedName = name.trim();

        return this.getCategories().pipe(
            switchMap(categories => {
                const existingCategory = categories.find(category =>
                    category.name.toLowerCase() === normalizedName.toLowerCase()
                );

                if (existingCategory) {
                    return of(existingCategory);
                }

                return this.createCategory(normalizedName);
            })
        );
    }

    private mapCategory(category: BackendCategory): ArticleCategory {
        return {
            id: category.id,
            name: category.name,
        };
    }
}