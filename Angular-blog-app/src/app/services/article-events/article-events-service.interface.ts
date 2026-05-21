import { Observable } from 'rxjs';

export interface CommentCreatedEvent {
    type: 'COMMENT_CREATED';
    payload: {
        commentId: string;
        articleId: string;
        content: string;
        username: string;
        createdAt: Date;
    };
}

export interface CommentRatingChangedEvent {
    type: 'COMMENT_RATING_CHANGED';
    payload: {
        commentId: string;
        articleId: string;
        rating: number;
        prevRating: number;
    };
}

export interface ArticleRatingChangedEvent {
    type: 'ARTICLE_RATING_CHANGED';
    payload: {
        articleId: string;
        rating: number;
        prevRating: number;
    };
}

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