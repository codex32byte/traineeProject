import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { ARTICLE_DETAILS_SERVICE } from './article-details-service.token';

export const articleTitleResolver: ResolveFn<string> = route => {
    const articleDetailsService = inject(ARTICLE_DETAILS_SERVICE);
    const articleId = route.paramMap.get('id');

    if (!articleId) {
        return 'Article not found';
    }

    return articleDetailsService.getArticleDetails(articleId).pipe(
        map(response => response.article?.title ?? 'Article not found')
    );
};