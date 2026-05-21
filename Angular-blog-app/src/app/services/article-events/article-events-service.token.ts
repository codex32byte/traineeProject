import { InjectionToken } from '@angular/core';
import { ArticleEventsServiceInterface } from './article-events-service.interface';

export const ARTICLE_EVENTS_SERVICE =
    new InjectionToken<ArticleEventsServiceInterface>(
        'ARTICLE_EVENTS_SERVICE'
    );