import { Observable } from 'rxjs';
import {
    BlogArticle,
    ArticlesPageResult,
    ArticlesPaginationParams,
    BlogArticleFormValue,
} from '../../ui/models/blog-article.interface';

export interface ArticlesServiceInterface {
    getArticles(params: ArticlesPaginationParams): Observable<ArticlesPageResult>;

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

    getArticlesFromStorage(): BlogArticle[];
}


