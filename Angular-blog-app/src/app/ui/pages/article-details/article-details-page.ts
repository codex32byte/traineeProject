import { ChangeDetectionStrategy, Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';

import { ARTICLE_DETAILS_SERVICE } from '../../../services/article-details/article-details-service.token';
import { ArticleDetailsStoreService } from '../../../services/article-details/article-details-store.service';
import { CommentFormValue } from '../../models/blog-article.interface';
import { ArticleDetailsResult } from '../../models/blog-article.interface';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'app-article-details-page',
    standalone: true,
    imports: [
        RouterModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
    ],
    templateUrl: './article-details-page.html',
    styleUrl: './article-details-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailsPage {
    private readonly initialLoadDelay = 700;

    private readonly route = inject(ActivatedRoute);
    private readonly destroyRef = inject(DestroyRef);
    private readonly articleDetailsService = inject(ARTICLE_DETAILS_SERVICE);

    @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

    private readonly articleDetailsStore = inject(ArticleDetailsStoreService);

    protected readonly isLoading = signal(true);
    protected readonly ratingStars = [1, 2, 3, 4, 5];

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

    protected readonly form = new FormGroup({
        author: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        text: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    constructor() {
        this.loadArticleDetails();
    }

    protected addComment(): void {
        const article = this.article();

        if (this.form.invalid || !article) {
            this.form.markAllAsTouched();
            return;
        }

        const commentData: CommentFormValue = {
            author: this.form.controls.author.value.trim(),
            text: this.form.controls.text.value.trim(),
        };

        this.articleDetailsService
            .addComment(article.id, commentData)
            .pipe(
                take(1),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(response => {
                this.saveArticleDetailsResult(response);

                const lastPageIndex = Math.max(
                    Math.ceil(response.comments.length / this.commentsPageSize()) - 1,
                    0
                );

                this.commentsPageIndex.set(lastPageIndex);

                this.formDirective?.resetForm({
                    author: '',
                    text: '',
                });
            });
    }

    protected setArticleRating(rating: number): void {
        const article = this.article();

        if (!article) {
            return;
        }

        this.articleDetailsService
            .updateArticleRating(article.id, rating)
            .pipe(
                take(1),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(response => {
                this.saveArticleDetailsResult(response);
            });
    }

    protected toggleCommentLike(commentId: string): void {
        const article = this.article();

        if (!article) {
            return;
        }

        this.articleDetailsService
            .toggleCommentLike(article.id, commentId)
            .pipe(
                take(1),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(response => {
                this.saveArticleDetailsResult(response);
            });
    }

    protected changeCommentsPage(event: PageEvent): void {
        this.commentsPageIndex.set(event.pageIndex);
        this.commentsPageSize.set(event.pageSize);
    }

    protected isArticleStarFilled(star: number): boolean {
        return star <= (this.articleRating()?.currentUserRating ?? 0);
    }

    private async loadArticleDetails(): Promise<void> {
        const articleId = this.route.snapshot.paramMap.get('id');

        if (!articleId) {
            this.isLoading.set(false);
            return;
        }

        this.isLoading.set(true);

        await this.wait(this.initialLoadDelay);

        this.articleDetailsService
            .getArticleDetails(articleId)
            .pipe(
                take(1),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(response => {
                this.saveArticleDetailsResult(response);
                this.commentsPageIndex.set(0);
                this.isLoading.set(false);
            });
    }

    private saveArticleDetailsResult(response: ArticleDetailsResult): void {
        this.articleDetailsStore.saveArticleDetails(
            response.article,
            response.comments,
            response.articleRating
        );
    }

    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}