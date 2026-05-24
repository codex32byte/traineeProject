import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../../environments/environment';
import { ArticleEventsServiceInterface } from './article-events-service.interface';
import {
    ArticleRatingChangedEvent,
    CommentCreatedEvent,
    CommentRatingChangedEvent,
} from './article-events.models';

@Injectable()
export class ArticleEventsSocketIoService implements ArticleEventsServiceInterface {
    private socket: Socket | null = null;

    private readonly commentCreatedSubject = new Subject<CommentCreatedEvent>();
    private readonly commentRatingChangedSubject =
        new Subject<CommentRatingChangedEvent>();
    private readonly articleRatingChangedSubject =
        new Subject<ArticleRatingChangedEvent>();

    public readonly commentCreated$: Observable<CommentCreatedEvent> =
        this.commentCreatedSubject.asObservable();

    public readonly commentRatingChanged$: Observable<CommentRatingChangedEvent> =
        this.commentRatingChangedSubject.asObservable();

    public readonly articleRatingChanged$: Observable<ArticleRatingChangedEvent> =
        this.articleRatingChangedSubject.asObservable();

    public connect(): void {
        if (!environment.useWebSocket || this.socket) {
            return;
        }

        try {
            this.socket = io(environment.socketUrl, {
                transports: ['websocket'],
                reconnection: true,
            });

            this.socket.on('connect', () => {
                console.log('Article websocket connected');
            });

            this.socket.on('connect_error', error => {
                console.error('Article websocket connection error:', error);
            });

            this.socket.on('disconnect', reason => {
                console.warn('Article websocket disconnected:', reason);
            });

            this.socket.on('comment-created', (event: CommentCreatedEvent) => {
                this.commentCreatedSubject.next({
                    ...event,
                    payload: {
                        ...event.payload,
                        createdAt: this.normalizeDate(event.payload.createdAt),
                    },
                });
            });

            this.socket.on(
                'comment-rating-changed',
                (event: CommentRatingChangedEvent) => {
                    this.commentRatingChangedSubject.next(event);
                }
            );

            this.socket.on(
                'article-rating-changed',
                (event: ArticleRatingChangedEvent) => {
                    this.articleRatingChangedSubject.next(event);
                }
            );
        } catch (error) {
            console.error('Failed to initialize article websocket:', error);
        }
    }

    public subscribeArticle(articleId: string): void {
        this.socket?.emit('subscribe-article', articleId);
    }

    public unsubscribeArticle(articleId: string): void {
        this.socket?.emit('unsubscribe-article', articleId);
    }

    public subscribeAll(): void {
        this.socket?.emit('subscribe-all');
    }

    public disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
    }

    private normalizeDate(date: unknown): Date {
        if (date instanceof Date) {
            return date;
        }

        return new Date(String(date));
    }
}