import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    computed,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize, take } from 'rxjs';

import { ARTICLE_DETAILS_SERVICE } from '../../../services/article-details/article-details-service.token';
import { ArticleDetailsStoreService } from '../../../services/article-details/article-details-store.service';
import { ARTICLE_EVENTS_SERVICE } from '../../../services/article-events/article-events-service.token';
import { AUTH_SERVICE } from '../../../services/auth/auth-service.token';
import {
    ArticleRatingChangedEvent,
    CommentCreatedEvent,
    CommentRatingChangedEvent,
    CommentRatingPreview,
} from '../../../services/article-events/article-events.models';

import {
    ArticleComment,
    ArticleDetailsResult,
    ArticleVote,
    CommentFormValue,
} from '../../models/blog-article.interface';

import { ArticleCommentForm } from './components/article-comment-form/article-comment-form';
import { CommentRatingPipe } from '../../pipes/comment-rating.pipe';
import { CommentStarActivePipe } from '../../pipes/comment-star-active.pipe';
import { CommentStarIconPipe } from '../../pipes/comment-star-icon.pipe';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'app-article-details-page',
    standalone: true,
    imports: [
        RouterModule,
        ArticleCommentForm,
        CommentRatingPipe,
        CommentStarActivePipe,
        CommentStarIconPipe,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatPaginatorModule,
    ],
    templateUrl: './article-details-page.html',
    styleUrl: './article-details-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ArticleDetailsStoreService],
})
export class ArticleDetailsPage {
    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);
    private readonly articleDetailsService = inject(ARTICLE_DETAILS_SERVICE);
    private readonly articleEventsService = inject(ARTICLE_EVENTS_SERVICE);
    private readonly authService = inject(AUTH_SERVICE);
    private readonly articleDetailsStore = inject(ArticleDetailsStoreService);

    protected readonly currentUser = this.authService.currentUser;

    protected readonly isLoading = signal(true);
    protected readonly isVoting = signal(false);
    protected readonly updatingCommentRatingId = signal<string | null>(null);
    protected readonly commentRatingStars = [1, 2, 3, 4, 5];

    protected readonly commentRatingPreview =
        signal<CommentRatingPreview | null>(null);

    protected readonly commentsPageSize = signal(5);
    protected readonly commentsPageIndex = signal(0);
    protected readonly commentsPageSizeOptions = [3, 5, 10];

    protected readonly article = this.articleDetailsStore.article;
    protected readonly comments = this.articleDetailsStore.comments;
    protected readonly articleRating = this.articleDetailsStore.articleRating;

    protected readonly pagedComments = computed(() => {
        const startIndex = this.commentsPageIndex() * this.commentsPageSize();
        const endIndex = startIndex + this.commentsPageSize();

        return this.comments().slice(startIndex, endIndex);
    });

    constructor() {
        this.loadArticleDetails();
    }

    protected addComment(commentData: CommentFormValue): void {
        const article = this.article();

        if (!article) {
            return;
        }

        this.articleDetailsService
            .addComment(article.id, commentData)
            .pipe(
                take(1),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: response => {
                    this.saveArticleDetailsResult(response);
                    this.commentsPageIndex.set(0);
                },
                error: error => {
                    console.error('Failed to add comment:', error);
                },
            });
    }

    protected voteArticleUp(): void {
        this.voteArticle('up');
    }

    protected voteArticleDown(): void {
        this.voteArticle('down');
    }

    protected updateCommentRating(commentId: string, rating: number): void {
        const article = this.article();
        const comment = this.comments().find(comment => comment.id === commentId);

        if (!article || !comment || this.updatingCommentRatingId()) {
            return;
        }

        this.updatingCommentRatingId.set(commentId);

        this.articleDetailsService
            .updateCommentRating(article.id, commentId, rating)
            .pipe(
                take(1),
                finalize(() => {
                    this.clearCommentRatingPreview(commentId);
                    this.updatingCommentRatingId.set(null);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: updatedComment => {
                    this.updateCommentRatingFromEvent(
                        updatedComment.id,
                        updatedComment.rating
                    );
                },
                error: error => {
                    console.error('Failed to update comment rating:', error);
                },
            });
    }

    protected changeCommentsPage(event: PageEvent): void {
        this.commentsPageIndex.set(event.pageIndex);
        this.commentsPageSize.set(event.pageSize);
    }

    protected isArticleVotedUp(): boolean {
        return this.articleRating()?.currentUserVote === 'up';
    }

    protected isArticleVotedDown(): boolean {
        return this.articleRating()?.currentUserVote === 'down';
    }

    protected isCommentRatingUpdating(commentId: string): boolean {
        return this.updatingCommentRatingId() === commentId;
    }

    protected setCommentRatingPreview(commentId: string, rating: number): void {
        if (this.updatingCommentRatingId()) {
            return;
        }

        this.commentRatingPreview.set({
            commentId,
            rating,
        });
    }

    protected clearCommentRatingPreview(commentId: string): void {
        const preview = this.commentRatingPreview();

        if (preview?.commentId !== commentId) {
            return;
        }

        this.commentRatingPreview.set(null);
    }

    protected clearCommentRatingPreviewOnFocusOut(
        commentId: string,
        event: FocusEvent
    ): void {
        const currentTarget = event.currentTarget as HTMLElement | null;
        const nextTarget = event.relatedTarget as HTMLElement | null;

        if (currentTarget?.contains(nextTarget)) {
            return;
        }

        this.clearCommentRatingPreview(commentId);
    }

    private voteArticle(vote: ArticleVote): void {
        const article = this.article();
        const articleRating = this.articleRating();

        if (!article || this.isVoting() || articleRating?.currentUserVote === vote) {
            return;
        }

        this.isVoting.set(true);

        const voteRequest = vote === 'up'
            ? this.articleDetailsService.voteArticleUp(article.id)
            : this.articleDetailsService.voteArticleDown(article.id);

        voteRequest
            .pipe(
                take(1),
                finalize(() => {
                    this.isVoting.set(false);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: response => {
                    this.saveArticleDetailsResult(response);
                },
                error: error => {
                    console.error('Failed to update article vote:', error);
                },
            });
    }

    private loadArticleDetails(): void {
        const articleId = this.route.snapshot.paramMap.get('id');

        if (!articleId) {
            this.isLoading.set(false);
            return;
        }

        this.isLoading.set(true);

        this.articleDetailsService
            .getArticleDetails(articleId)
            .pipe(
                take(1),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: response => {
                    this.saveArticleDetailsResult(response);
                    this.commentsPageIndex.set(0);
                    this.isLoading.set(false);

                    if (response.article) {
                        this.connectArticleEvents(response.article.id);
                    }
                },
                error: error => {
                    console.error('Failed to load article details:', error);
                    this.isLoading.set(false);
                },
            });
    }

    private connectArticleEvents(articleId: string): void {
        this.articleEventsService.connect();
        this.articleEventsService.subscribeArticle(articleId);

        this.destroyRef.onDestroy(() => {
            this.articleEventsService.unsubscribeArticle(articleId);
            this.articleEventsService.disconnect();
        });

        this.articleEventsService.commentCreated$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: event => {
                    this.handleCommentCreatedEvent(event);
                },
                error: error => {
                    console.error('Comment created websocket error:', error);
                },
            });

        this.articleEventsService.commentRatingChanged$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: event => {
                    this.handleCommentRatingChangedEvent(event);
                },
                error: error => {
                    console.error('Comment rating websocket error:', error);
                },
            });

        this.articleEventsService.articleRatingChanged$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: event => {
                    this.handleArticleRatingChangedEvent(event);
                },
                error: error => {
                    console.error('Article rating websocket error:', error);
                },
            });
    }

    private handleCommentCreatedEvent(event: CommentCreatedEvent): void {
        const article = this.article();

        if (!article || event.payload.articleId !== article.id) {
            return;
        }

        this.addCommentFromEvent({
            id: event.payload.commentId,
            author: event.payload.username,
            text: event.payload.content,
            rating: 0,
            date: this.formatDate(event.payload.createdAt),
        });
    }

    private handleCommentRatingChangedEvent(
        event: CommentRatingChangedEvent
    ): void {
        const article = this.article();

        if (!article || event.payload.articleId !== article.id) {
            return;
        }

        this.updateCommentRatingFromEvent(
            event.payload.commentId,
            event.payload.rating
        );
    }

    private handleArticleRatingChangedEvent(
        event: ArticleRatingChangedEvent
    ): void {
        const article = this.article();

        if (!article || event.payload.articleId !== article.id) {
            return;
        }

        this.updateArticleRatingFromEvent(event.payload.rating);
    }

    private updateArticleRatingFromEvent(rating: number): void {
        const article = this.article();
        const articleRating = this.articleRating();

        if (!article || !articleRating) {
            return;
        }

        this.articleDetailsStore.saveArticleDetails(
            {
                ...article,
                rating,
            },
            this.comments(),
            {
                ...articleRating,
                score: rating,
            }
        );
    }

    private updateCommentRatingFromEvent(commentId: string, rating: number): void {
        const updatedComments = this.comments().map(comment => {
            if (comment.id !== commentId) {
                return comment;
            }

            return {
                ...comment,
                rating,
            };
        });

        this.articleDetailsStore.saveArticleDetails(
            this.article(),
            updatedComments,
            this.articleRating()
        );
    }

    private addCommentFromEvent(comment: ArticleComment): void {
        const isExistingComment = this.comments().some(
            existingComment => existingComment.id === comment.id
        );

        if (isExistingComment) {
            return;
        }

        this.articleDetailsStore.saveArticleDetails(
            this.article(),
            [comment, ...this.comments()],
            this.articleRating()
        );

        this.commentsPageIndex.set(0);
    }

    private saveArticleDetailsResult(response: ArticleDetailsResult): void {
        this.articleDetailsStore.saveArticleDetails(
            response.article,
            response.comments,
            response.articleRating
        );
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    }
}