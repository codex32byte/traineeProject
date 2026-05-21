import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap, throwError } from 'rxjs';

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

@Injectable()
export class ArticleDetailsService implements ArticleDetailsServiceInterface {
    private readonly commentsStorageKey = 'articleComments';
    private readonly articleVotesStorageKey = 'articleVotes';

    private readonly articlesService = inject(ARTICLES_SERVICE);

    public getArticleDetails(articleId: string): Observable<ArticleDetailsResult> {
        return this.articlesService.getArticleById(articleId).pipe(
            map(article => {
                if (!article) {
                    return {
                        article: null,
                        comments: [],
                        articleRating: null,
                    };
                }

                return {
                    article,
                    comments: this.getLocalCommentsByArticleId(articleId),
                    articleRating: this.getArticleRating(article),
                };
            })
        );
    }

    public addComment(
        articleId: string,
        commentData: CommentFormValue
    ): Observable<ArticleDetailsResult> {
        const commentsMap = this.getCommentsMap();

        const newComment: ArticleComment = {
            id: crypto.randomUUID(),
            author: commentData.author,
            text: commentData.text,
            rating: 0,
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
    ): Observable<ArticleComment> {
        const normalizedRating = this.normalizeRequiredCommentRating(rating);
        const commentsMap = this.getCommentsMap();
        const articleComments = commentsMap[articleId] ?? [];

        const existingComment = articleComments.find(comment => {
            return comment.id === commentId;
        });

        if (!existingComment) {
            return throwError(() => new Error('Comment not found'));
        }

        const updatedComment: ArticleComment = {
            ...existingComment,
            rating: normalizedRating,
        };

        commentsMap[articleId] = articleComments.map(comment => {
            if (comment.id !== commentId) {
                return comment;
            }

            return updatedComment;
        });

        this.saveCommentsMap(commentsMap);

        return of(updatedComment);
    }

    public getCommentsCount(): Observable<number> {
        const commentsMap = this.getCommentsMap();

        const commentsCount = Object.values(commentsMap).reduce(
            (total, comments) => total + comments.length,
            0
        );

        return of(commentsCount);
    }

    public deleteArticleRelatedData(articleId: string): void {
        const commentsMap = this.getCommentsMap();
        const votesMap = this.getArticleVotesMap();

        delete commentsMap[articleId];
        delete votesMap[articleId];

        this.saveCommentsMap(commentsMap);
        this.saveArticleVotesMap(votesMap);
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