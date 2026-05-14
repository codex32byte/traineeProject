import { Observable } from 'rxjs';
import {
    ArticlesPageResult,
    ArticlesPaginationParams,
    BlogArticle,
    BlogArticleFormValue,
} from '../../ui/models/blog-article.interface';

export interface ArticlesServiceInterface {
    getArticles(params: ArticlesPaginationParams): Observable<ArticlesPageResult>;

    getArticleById(id: string): Observable<BlogArticle | null>;

    getLatestArticles(limit: number): Observable<BlogArticle[]>;

    addArticle(
        articleData: BlogArticleFormValue,
        params: ArticlesPaginationParams
    ): Observable<ArticlesPageResult>;

    updateArticle(
        id: string,
        articleData: BlogArticleFormValue,
        params: ArticlesPaginationParams
    ): Observable<ArticlesPageResult>;

    deleteArticle(
        id: string,
        params: ArticlesPaginationParams
    ): Observable<ArticlesPageResult>;

    voteArticleUp(id: string): Observable<BlogArticle | null>;

    voteArticleDown(id: string): Observable<BlogArticle | null>;
}