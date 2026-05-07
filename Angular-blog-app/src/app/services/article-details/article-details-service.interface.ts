import { Observable } from 'rxjs';
import { ArticleDetailsResult, CommentFormValue, } from '../../ui/models/blog-article.interface';

export interface ArticleDetailsServiceInterface {
    getArticleDetails(articleId: string): Observable<ArticleDetailsResult>;

    addComment(
        articleId: string,
        commentData: CommentFormValue
    ): Observable<ArticleDetailsResult>;

    updateArticleRating(
        articleId: string,
        rating: number
    ): Observable<ArticleDetailsResult>;

    toggleCommentLike(
        articleId: string,
        commentId: string
    ): Observable<ArticleDetailsResult>;

    getCommentsCount(): Observable<number>;
}