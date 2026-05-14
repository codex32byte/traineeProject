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
import {
    ArticleDetailsResult,
    ArticleVote,
    CommentFormValue,
} from '../../models/blog-article.interface';

import { ArticleCommentForm } from './components/article-comment-form/article-comment-form';

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
    private readonly articleDetailsStore = inject(ArticleDetailsStoreService);

    protected readonly isLoading = signal(true);
    protected readonly isVoting = signal(false);
    protected readonly isCommentRatingUpdating = signal(false);
    protected readonly commentRatingStars = [1, 2, 3, 4, 5];

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

        if (
            !article ||
            !comment ||
            this.isCommentRatingUpdating() ||
            comment.rating === rating
        ) {
            return;
        }

        this.isCommentRatingUpdating.set(true);

        this.articleDetailsService
            .updateCommentRating(article.id, commentId, rating)
            .pipe(
                take(1),
                finalize(() => {
                    this.isCommentRatingUpdating.set(false);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: response => {
                    this.saveArticleDetailsResult(response);
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

    protected isCommentStarFilled(commentRating: number, star: number): boolean {
        return star <= commentRating;
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
                },
                error: error => {
                    console.error('Failed to load article details:', error);
                    this.isLoading.set(false);
                },
            });
    }

    private saveArticleDetailsResult(response: ArticleDetailsResult): void {
        this.articleDetailsStore.saveArticleDetails(
            response.article,
            response.comments,
            response.articleRating
        );
    }
}