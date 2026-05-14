import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
    ArticleComment,
    ArticleDetailsResult,
    ArticleRating,
    ArticleVote,
    BlogArticle,
    CommentFormValue,
} from '../../ui/models/blog-article.interface';
import { ARTICLES_SERVICE } from '../articles/articles-service.token';
import { ArticleDetailsServiceInterface } from './article-details-service.interface';

interface BackendComment {
    id: string;
    username: string;
    content: string;
    articleId: string;
    rating?: number;
    createdAt: string;
    updatedAt?: string;
}

@Injectable()
export class ArticleDetailsService implements ArticleDetailsServiceInterface {
    private readonly commentsStorageKey = 'articleComments';
    private readonly articleVotesStorageKey = 'articleVotes';

    private readonly http = inject(HttpClient);
    private readonly articlesService = inject(ARTICLES_SERVICE);

    private readonly commentsApiUrl = `${environment.apiUrl}/comments`;

    public getArticleDetails(articleId: string): Observable<ArticleDetailsResult> {
        return this.articlesService.getArticleById(articleId).pipe(
            switchMap(article => {
                if (!article) {
                    return of({
                        article: null,
                        comments: [],
                        articleRating: null,
                    });
                }

                return this.getCommentsByArticleId(articleId).pipe(
                    map(comments => ({
                        article,
                        comments,
                        articleRating: this.getArticleRating(article),
                    }))
                );
            })
        );
    }

    public addComment(
        articleId: string,
        commentData: CommentFormValue
    ): Observable<ArticleDetailsResult> {
        if (environment.useBackendApi) {
            return this.http
                .post<BackendComment>(this.commentsApiUrl, {
                    username: commentData.author,
                    content: commentData.text,
                    articleId,
                })
                .pipe(
                    switchMap(comment =>
                        this.updateBackendCommentRating(
                            comment.id,
                            this.normalizeRequiredCommentRating(commentData.rating)
                        )
                    ),
                    switchMap(() => this.getArticleDetails(articleId))
                );
        }

        const commentsMap = this.getCommentsMap();

        const newComment: ArticleComment = {
            id: crypto.randomUUID(),
            author: commentData.author,
            text: commentData.text,
            rating: this.normalizeRequiredCommentRating(commentData.rating),
            date: new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
        };

        commentsMap[articleId] = [
            newComment,
            ...(commentsMap[articleId] ?? []),
        ];

        this.saveCommentsMap(commentsMap);

        return this.getArticleDetails(articleId);
    }

    public voteArticleUp(articleId: string): Observable<ArticleDetailsResult> {
        const currentVote = this.getCurrentArticleVote(articleId);

        if (currentVote === 'up') {
            return this.getArticleDetails(articleId);
        }

        return this.runArticleVoteRequest(articleId, 'up').pipe(
            tap(() => this.saveCurrentArticleVote(articleId, 'up')),
            switchMap(() => this.getArticleDetails(articleId))
        );
    }

    public voteArticleDown(articleId: string): Observable<ArticleDetailsResult> {
        const currentVote = this.getCurrentArticleVote(articleId);

        if (currentVote === 'down') {
            return this.getArticleDetails(articleId);
        }

        return this.runArticleVoteRequest(articleId, 'down').pipe(
            tap(() => this.saveCurrentArticleVote(articleId, 'down')),
            switchMap(() => this.getArticleDetails(articleId))
        );
    }
    public updateCommentRating(
        articleId: string,
        commentId: string,
        rating: number
    ): Observable<ArticleDetailsResult> {
        const normalizedRating = this.normalizeRequiredCommentRating(rating);

        if (environment.useBackendApi) {
            return this.updateBackendCommentRating(commentId, normalizedRating).pipe(
                switchMap(() => this.getArticleDetails(articleId))
            );
        }

        const commentsMap = this.getCommentsMap();

        commentsMap[articleId] = (commentsMap[articleId] ?? []).map(comment => {
            if (comment.id !== commentId) {
                return comment;
            }

            return {
                ...comment,
                rating: normalizedRating,
            };
        });

        this.saveCommentsMap(commentsMap);

        return this.getArticleDetails(articleId);
    }

    public getCommentsCount(): Observable<number> {
        if (!environment.useBackendApi) {
            const commentsMap = this.getCommentsMap();

            const commentsCount = Object.values(commentsMap).reduce(
                (total, comments) => total + comments.length,
                0
            );

            return of(commentsCount);
        }

        return this.articlesService
            .getArticles({
                page: 1,
                limit: Number.MAX_SAFE_INTEGER,
            })
            .pipe(
                switchMap(response => {
                    if (!response.allItems.length) {
                        return of(0);
                    }

                    return forkJoin(
                        response.allItems.map(article =>
                            this.getBackendCommentsByArticleId(article.id)
                        )
                    ).pipe(
                        map(commentsGroups =>
                            commentsGroups.reduce(
                                (total, comments) => total + comments.length,
                                0
                            )
                        )
                    );
                })
            );
    }

    public deleteArticleRelatedData(articleId: string): void {
        const commentsMap = this.getCommentsMap();
        const votesMap = this.getArticleVotesMap();

        delete commentsMap[articleId];
        delete votesMap[articleId];

        this.saveCommentsMap(commentsMap);
        this.saveArticleVotesMap(votesMap);
    }

    private getCommentsByArticleId(articleId: string): Observable<ArticleComment[]> {
        if (environment.useBackendApi) {
            return this.getBackendCommentsByArticleId(articleId);
        }

        return of(this.getLocalCommentsByArticleId(articleId));
    }

    private getBackendCommentsByArticleId(articleId: string): Observable<ArticleComment[]> {
        return this.http
            .get<BackendComment[]>(`${this.commentsApiUrl}/article/${articleId}`)
            .pipe(
                map(comments =>
                    comments.map(comment => this.mapBackendComment(comment))
                )
            );
    }

    private updateBackendCommentRating(
        commentId: string,
        rating: number
    ): Observable<BackendComment> {
        return this.http.patch<BackendComment>(
            `${this.commentsApiUrl}/${commentId}/rating`,
            {
                rating,
            }
        );
    }

    private getLocalCommentsByArticleId(articleId: string): ArticleComment[] {
        return (this.getCommentsMap()[articleId] ?? []).map(comment => ({
            ...comment,
            rating: this.normalizeCommentRating(comment.rating),
        }));
    }

    private runArticleVoteRequest(
        articleId: string,
        vote: ArticleVote
    ): Observable<BlogArticle | null> {
        return vote === 'up'
            ? this.articlesService.voteArticleUp(articleId)
            : this.articlesService.voteArticleDown(articleId);
    }

    private getArticleRating(article: BlogArticle): ArticleRating {
        return {
            articleId: article.id,
            score: article.rating ?? 0,
            currentUserVote: this.getCurrentArticleVote(article.id),
        };
    }

    private getCurrentArticleVote(articleId: string): ArticleVote | null {
        return this.getArticleVotesMap()[articleId] ?? null;
    }

    private saveCurrentArticleVote(articleId: string, vote: ArticleVote): void {
        const votesMap = this.getArticleVotesMap();

        votesMap[articleId] = vote;

        this.saveArticleVotesMap(votesMap);
    }

    private mapBackendComment(comment: BackendComment): ArticleComment {
        return {
            id: comment.id,
            author: comment.username,
            text: comment.content,
            rating: this.normalizeCommentRating(comment.rating),
            date: new Date(comment.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
        };
    }

    private getCommentsMap(): Record<string, ArticleComment[]> {
        const commentsJson = localStorage.getItem(this.commentsStorageKey);

        if (!commentsJson) {
            return {};
        }

        return JSON.parse(commentsJson) as Record<string, ArticleComment[]>;
    }

    private saveCommentsMap(commentsMap: Record<string, ArticleComment[]>): void {
        localStorage.setItem(this.commentsStorageKey, JSON.stringify(commentsMap));
    }

    private getArticleVotesMap(): Record<string, ArticleVote> {
        const votesJson = localStorage.getItem(this.articleVotesStorageKey);

        if (!votesJson) {
            return {};
        }

        return JSON.parse(votesJson) as Record<string, ArticleVote>;
    }

    private saveArticleVotesMap(votesMap: Record<string, ArticleVote>): void {
        localStorage.setItem(
            this.articleVotesStorageKey,
            JSON.stringify(votesMap)
        );
    }

    private normalizeRequiredCommentRating(rating: number): number {
        return Math.min(Math.max(rating, 1), 5);
    }

    private normalizeCommentRating(rating: number | null | undefined): number {
        return Math.min(Math.max(Number(rating ?? 0), 0), 5);
    }
}