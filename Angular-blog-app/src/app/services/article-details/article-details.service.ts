import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ArticleComment, ArticleDetailsResult, ArticleRating, CommentFormValue, } from '../../ui/models/blog-article.interface';
import { ArticlesService } from '../articles/articles.service';
import { ArticleDetailsServiceInterface } from './article-details-service.interface';

@Injectable()
export class ArticleDetailsService implements ArticleDetailsServiceInterface {
    private readonly commentsStorageKey = 'articleComments';
    private readonly articleRatingsStorageKey = 'articleRatings';

    constructor(private readonly articlesService: ArticlesService) { }

    public getArticleDetails(articleId: string): Observable<ArticleDetailsResult> {
        const article = this.getArticleById(articleId);

        return of({
            article,
            comments: article ? this.getCommentsByArticleId(articleId) : [],
            articleRating: article ? this.getArticleRating(articleId) : null,
        });
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
            date: new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
            likesCount: 0,
            isLikedByCurrentUser: false,
        };

        commentsMap[articleId] = [
            ...(commentsMap[articleId] ?? []),
            newComment,
        ];

        this.saveCommentsMap(commentsMap);

        return this.getArticleDetails(articleId);
    }

    public updateArticleRating(
        articleId: string,
        rating: number
    ): Observable<ArticleDetailsResult> {
        const ratingsMap = this.getArticleRatingsMap();
        const normalizedRating = this.normalizeRating(rating);

        ratingsMap[articleId] = normalizedRating;

        this.saveArticleRatingsMap(ratingsMap);

        return this.getArticleDetails(articleId);
    }

    public toggleCommentLike(
        articleId: string,
        commentId: string
    ): Observable<ArticleDetailsResult> {
        const commentsMap = this.getCommentsMap();

        commentsMap[articleId] = (commentsMap[articleId] ?? []).map(comment => {
            if (comment.id !== commentId) {
                return comment;
            }

            const isLiked = !comment.isLikedByCurrentUser;

            return {
                ...comment,
                isLikedByCurrentUser: isLiked,
                likesCount: isLiked
                    ? comment.likesCount + 1
                    : Math.max(comment.likesCount - 1, 0),
            };
        });

        this.saveCommentsMap(commentsMap);

        return this.getArticleDetails(articleId);
    }

    public getCommentsCount(): Observable<number> {
        const commentsMap = this.getCommentsMap();

        const commentsCount = Object.values(commentsMap).reduce(
            (total, comments) => total + comments.length,
            0
        );

        return of(commentsCount);
    }

    private getArticleById(articleId: string) {
        return (
            this.articlesService
                .getArticlesFromStorage()
                .find(article => article.id === articleId) ?? null
        );
    }

    private getArticleRating(articleId: string): ArticleRating {
        const ratingsMap = this.getArticleRatingsMap();
        const currentUserRating = ratingsMap[articleId] ?? null;

        return {
            articleId,
            average: currentUserRating ?? 0, // its not average, i just put with such value cuz currently we r working with localstorage
            votesCount: currentUserRating ? 1 : 0,
            currentUserRating,
        };
    }

    private getCommentsByArticleId(articleId: string): ArticleComment[] {
        return (this.getCommentsMap()[articleId] ?? []).map(comment => ({
            ...comment,
            likesCount: comment.likesCount ?? 0,
            isLikedByCurrentUser: comment.isLikedByCurrentUser ?? false,
        }));
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

    private getArticleRatingsMap(): Record<string, number> {
        const ratingsJson = localStorage.getItem(this.articleRatingsStorageKey);

        if (!ratingsJson) {
            return {};
        }

        return JSON.parse(ratingsJson) as Record<string, number>;
    }

    private saveArticleRatingsMap(ratingsMap: Record<string, number>): void {
        localStorage.setItem(
            this.articleRatingsStorageKey,
            JSON.stringify(ratingsMap)
        );
    }

    private normalizeRating(rating: number): number {
        return Math.min(Math.max(rating, 1), 5);
    }
}