import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { ARTICLES_SERVICE } from '../articles/articles-service.token';
import { ArticlesStoreService } from '../articles/articles-store.service';

export const articleTitleResolver: ResolveFn<string> = route => {
    const articlesService = inject(ARTICLES_SERVICE);
    const articlesStore = inject(ArticlesStoreService);
    const articleId = route.paramMap.get('id');

    if (!articleId) {
        return 'Article not found';
    }

    const cachedArticle = [
        ...articlesStore.articles(),
        ...articlesStore.latestArticles(),
    ].find(article => article.id === articleId);

    if (cachedArticle) {
        return cachedArticle.title;
    }

    return articlesService.getArticleById(articleId).pipe(
        map(article => article?.title ?? 'Article not found'),
        catchError(() => of('Article not found'))
    );
};