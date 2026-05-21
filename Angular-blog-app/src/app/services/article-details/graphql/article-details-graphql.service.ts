import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, Observable, switchMap } from 'rxjs';

import {
    ArticleComment,
    ArticleDetailsResult,
    ArticleRating,
    ArticleVote,
    BlogArticle,
    CommentFormValue,
} from '../../../ui/models/blog-article.interface';
import { environment } from '../../../../environments/environment';
import { ArticleDetailsServiceInterface } from '../article-details-service.interface';
import {
    ArticleDetailsQueryResult,
    ArticleRatingMutationResult,
    CommentRatingMutationResult,
    CommentsCountQueryResult,
    CreateCommentMutationResult,
    GraphqlArticle,
    GraphqlComment,
} from './article-details-graphql.models';
import {
    ARTICLE_DETAILS_QUERY,
    ARTICLE_RATING_DOWN_MUTATION,
    ARTICLE_RATING_UP_MUTATION,
    COMMENT_RATING_MUTATION,
    COMMENTS_COUNT_QUERY,
    CREATE_COMMENT_MUTATION,
} from './article-details-graphql.operations';

@Injectable()
export class ArticleDetailsGraphqlService implements ArticleDetailsServiceInterface {
    private readonly articleVotesStorageKey = 'articleVotes';

    private readonly apollo = inject(Apollo);
    private readonly fallbackImage = 'assets/images/link1.webp';

    public getArticleDetails(articleId: string): Observable<ArticleDetailsResult> {
        return this.apollo
            .query<ArticleDetailsQueryResult>({
                query: ARTICLE_DETAILS_QUERY,
                variables: {
                    articleId,
                },
                fetchPolicy: 'network-only',
            })
            .pipe(
                map(response => {
                    const data = response.data;

                    if (!data) {
                        throw new Error('Failed to load article details');
                    }

                    const article = data.article;

                    if (!article) {
                        return {
                            article: null,
                            comments: [],
                            articleRating: null,
                        };
                    }

                    const mappedArticle = this.mapArticle(article);

                    return {
                        article: mappedArticle,
                        comments: data.commentsByArticle.map(comment =>
                            this.mapComment(comment)
                        ),
                        articleRating: this.getArticleRating(mappedArticle),
                    };
                })
            );
    }

    public addComment(
        articleId: string,
        commentData: CommentFormValue
    ): Observable<ArticleDetailsResult> {
        return this.apollo
            .mutate<CreateCommentMutationResult>({
                mutation: CREATE_COMMENT_MUTATION,
                variables: {
                    createComment: {
                        articleId,
                        username: commentData.author,
                        content: commentData.text,
                    },
                },
            })
            .pipe(
                map(response => {
                    const createdComment = response.data?.createComment;

                    if (!createdComment?.id) {
                        throw new Error('Failed to create comment');
                    }

                    return createdComment.id;
                }),
                switchMap(() => this.getArticleDetails(articleId))
            );
    }

    public voteArticleUp(articleId: string): Observable<ArticleDetailsResult> {
        const currentVote = this.getCurrentArticleVote(articleId);

        if (currentVote === 'up') {
            return this.getArticleDetails(articleId);
        }

        return this.apollo
            .mutate<ArticleRatingMutationResult>({
                mutation: ARTICLE_RATING_UP_MUTATION,
                variables: {
                    id: articleId,
                },
            })
            .pipe(
                map(response => {
                    const updatedArticle = response.data?.articleRatingUp;

                    if (!updatedArticle) {
                        throw new Error('Failed to update article rating');
                    }

                    this.saveCurrentArticleVote(articleId, 'up');

                    return updatedArticle.id;
                }),
                switchMap(id => this.getArticleDetails(id))
            );
    }

    public voteArticleDown(articleId: string): Observable<ArticleDetailsResult> {
        const currentVote = this.getCurrentArticleVote(articleId);

        if (currentVote === 'down') {
            return this.getArticleDetails(articleId);
        }

        return this.apollo
            .mutate<ArticleRatingMutationResult>({
                mutation: ARTICLE_RATING_DOWN_MUTATION,
                variables: {
                    id: articleId,
                },
            })
            .pipe(
                map(response => {
                    const updatedArticle = response.data?.articleRatingDown;

                    if (!updatedArticle) {
                        throw new Error('Failed to update article rating');
                    }

                    this.saveCurrentArticleVote(articleId, 'down');

                    return updatedArticle.id;
                }),
                switchMap(id => this.getArticleDetails(id))
            );
    }

    public updateCommentRating(
        articleId: string,
        commentId: string,
        rating: number
    ): Observable<ArticleComment> {
        const normalizedRating = this.normalizeRequiredCommentRating(rating);

        return this.apollo
            .mutate<CommentRatingMutationResult>({
                mutation: COMMENT_RATING_MUTATION,
                variables: {
                    id: commentId,
                    rating: normalizedRating,
                },
            })
            .pipe(
                map(response => {
                    const updatedComment = response.data?.voteComment;

                    if (!updatedComment) {
                        throw new Error('Failed to update comment rating');
                    }

                    return this.mapComment(updatedComment);
                })
            );
    }

    public getCommentsCount(): Observable<number> {
        return this.apollo
            .query<CommentsCountQueryResult>({
                query: COMMENTS_COUNT_QUERY,
                variables: {
                    query: {
                        page: 1,
                        limit: 1000,
                        cumulative: true,
                    },
                },
                fetchPolicy: 'network-only',
            })
            .pipe(
                map(response => {
                    const data = response.data;

                    if (!data) {
                        return 0;
                    }

                    return data.articles.items.reduce((total, article) => {
                        return total + (article.comments?.length ?? 0);
                    }, 0);
                })
            );
    }

    public deleteArticleRelatedData(articleId: string): void {
        const votesMap = this.getArticleVotesMap();

        delete votesMap[articleId];

        this.saveArticleVotesMap(votesMap);
    }

    private mapArticle(article: GraphqlArticle): BlogArticle {
        return {
            id: article.id,
            title: article.title,
            content: article.content,
            date: new Date(article.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
            image: article.imgSrc
                ? this.getImageUrl(article.imgSrc)
                : this.fallbackImage,
            categoryId: article.categoryId,
            rating: article.rating,
        };
    }

    private mapComment(comment: GraphqlComment): ArticleComment {
        return {
            id: comment.id,
            author: comment.username,
            text: comment.content,
            rating: this.normalizeCommentRating(comment.avgRating ?? comment.rating),
            date: new Date(comment.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }),
        };
    }

    private getArticleRating(article: BlogArticle): ArticleRating {
        return {
            articleId: article.id,
            score: article.rating ?? 0,
            currentUserVote: this.getCurrentArticleVote(article.id),
        };
    }

    private getImageUrl(imagePath: string): string {
        if (imagePath.startsWith('http')) {
            return imagePath;
        }

        return `${environment.apiOrigin}${imagePath}`;
    }

    private getCurrentArticleVote(articleId: string): ArticleVote | null {
        return this.getArticleVotesMap()[articleId] ?? null;
    }

    private saveCurrentArticleVote(articleId: string, vote: ArticleVote): void {
        const votesMap = this.getArticleVotesMap();

        votesMap[articleId] = vote;

        this.saveArticleVotesMap(votesMap);
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