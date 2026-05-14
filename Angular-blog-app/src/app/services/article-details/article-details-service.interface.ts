import { Observable } from 'rxjs';
import {
    ArticleDetailsResult,
    CommentFormValue,
} from '../../ui/models/blog-article.interface';

export interface ArticleDetailsServiceInterface {
    getArticleDetails(articleId: string): Observable<ArticleDetailsResult>;

    addComment(
        articleId: string,
        commentData: CommentFormValue
    ): Observable<ArticleDetailsResult>;

    voteArticleUp(articleId: string): Observable<ArticleDetailsResult>;

    voteArticleDown(articleId: string): Observable<ArticleDetailsResult>;

    updateCommentRating(
        articleId: string,
        commentId: string,
        rating: number
    ): Observable<ArticleDetailsResult>;

    getCommentsCount(): Observable<number>;

    deleteArticleRelatedData(articleId: string): void;
}