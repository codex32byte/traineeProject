import { InjectionToken } from '@angular/core';
import { ArticleDetailsServiceInterface } from './article-details-service.interface';


export const ARTICLE_DETAILS_SERVICE =
    new InjectionToken<ArticleDetailsServiceInterface>(
        'ARTICLE_DETAILS_SERVICE',

    );