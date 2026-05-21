import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

import {
    ArticleEventsServiceInterface,
    ArticleRatingChangedEvent,
    CommentCreatedEvent,
    CommentRatingChangedEvent,
} from './article-events-service.interface';

@Injectable()
export class ArticleEventsNoopService implements ArticleEventsServiceInterface {
    public readonly commentCreated$: Observable<CommentCreatedEvent> = EMPTY;

    public readonly commentRatingChanged$: Observable<CommentRatingChangedEvent> =
        EMPTY;

    public readonly articleRatingChanged$: Observable<ArticleRatingChangedEvent> =
        EMPTY;

    public connect(): void { }

    public subscribeArticle(articleId: string): void { }

    public unsubscribeArticle(articleId: string): void { }

    public subscribeAll(): void { }

    public disconnect(): void { }
}