import { Observable } from 'rxjs';

import {
    ArticleRatingChangedEvent,
    CommentCreatedEvent,
    CommentRatingChangedEvent,
} from './article-events.models';

export interface ArticleEventsServiceInterface {
    readonly commentCreated$: Observable<CommentCreatedEvent>;
    readonly commentRatingChanged$: Observable<CommentRatingChangedEvent>;
    readonly articleRatingChanged$: Observable<ArticleRatingChangedEvent>;

    connect(): void;

    subscribeArticle(articleId: string): void;

    unsubscribeArticle(articleId: string): void;

    subscribeAll(): void;

    disconnect(): void;
}