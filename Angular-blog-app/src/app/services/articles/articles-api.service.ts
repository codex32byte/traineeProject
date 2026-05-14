import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
    ArticlesPageResult,
    ArticlesPaginationParams,
    BlogArticle,
    BlogArticleFormValue,
} from '../../ui/models/blog-article.interface';
import { ArticlesServiceInterface } from './articles-service.interface';
import {
    BackendArticle,
    BackendArticlesPageResult,
} from './articles-api.models';

@Injectable()
export class ArticlesApiService implements ArticlesServiceInterface {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/articles`;
    private readonly fallbackImage = 'assets/images/link1.webp';

    public getArticles(
        params: ArticlesPaginationParams
    ): Observable<ArticlesPageResult> {
        const httpParams = new HttpParams()
            .set('page', params.page)
            .set('limit', params.limit);

        return this.http
            .get<BackendArticlesPageResult>(this.apiUrl, {
                params: httpParams,
            })
            .pipe(map(response => this.mapPageResult(response)));
    }

    public getArticleById(id: string): Observable<BlogArticle | null> {
        return this.http.get<BackendArticle>(`${this.apiUrl}/${id}`).pipe(
            map(article => this.mapArticle(article)),
            catchError(() => of(null))
        );
    }

    public getLatestArticles(limit: number): Observable<BlogArticle[]> {
        return this.getArticles({
            page: 1,
            limit,
        }).pipe(map(response => response.items));
    }

    public addArticle(
        articleData: BlogArticleFormValue,
        params: ArticlesPaginationParams
    ): Observable<ArticlesPageResult> {
        const formData = this.createArticleFormData(articleData);

        return this.http
            .post<BackendArticle>(this.apiUrl, formData)
            .pipe(switchMap(() => this.getArticles(params)));
    }

    public updateArticle(
        id: string,
        articleData: BlogArticleFormValue,
        params: ArticlesPaginationParams
    ): Observable<ArticlesPageResult> {
        const formData = this.createArticleFormData(articleData);

        return this.http
            .patch<BackendArticle>(`${this.apiUrl}/${id}`, formData)
            .pipe(switchMap(() => this.getArticles(params)));
    }

    public deleteArticle(
        id: string,
        params: ArticlesPaginationParams
    ): Observable<ArticlesPageResult> {
        return this.http
            .delete<BackendArticle>(`${this.apiUrl}/${id}`)
            .pipe(switchMap(() => this.getArticles(params)));
    }

    public voteArticleUp(id: string): Observable<BlogArticle | null> {
        return this.http
            .patch<void>(`${this.apiUrl}/${id}/rating-up`, null)
            .pipe(switchMap(() => this.getArticleById(id)));
    }

    public voteArticleDown(id: string): Observable<BlogArticle | null> {
        return this.http
            .patch<void>(`${this.apiUrl}/${id}/rating-down`, null)
            .pipe(switchMap(() => this.getArticleById(id)));
    }

    private createArticleFormData(articleData: BlogArticleFormValue): FormData {
        const formData = new FormData();

        formData.append('title', articleData.title);
        formData.append('content', articleData.content);

        if (articleData.categoryId) {
            formData.append('categoryId', articleData.categoryId);
        }

        if (articleData.imageFile) {
            formData.append('image', articleData.imageFile);
        }

        return formData;
    }

    private mapPageResult(
        response: BackendArticlesPageResult
    ): ArticlesPageResult {
        const articles = response.items.map(article => this.mapArticle(article));

        return {
            items: articles,
            allItems: articles,
            totalItems: response.total,
        };
    }

    private mapArticle(article: BackendArticle): BlogArticle {
        return {
            id: article.id,
            title: article.title,
            content: article.content,
            date: new Date(article.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
            image: article.imgSrc
                ? this.getImageUrl(article.imgSrc)
                : this.fallbackImage,
            categoryId: article.categoryId,
            rating: article.rating,
        };
    }

    private getImageUrl(imagePath: string): string {
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        return `${environment.apiOrigin}${imagePath}`;
    }
}