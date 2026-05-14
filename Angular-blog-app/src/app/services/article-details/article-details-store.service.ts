import { Injectable, signal } from '@angular/core';
import { ArticleComment, ArticleRating, BlogArticle, } from '../../ui/models/blog-article.interface';

@Injectable()
export class ArticleDetailsStoreService {
    public readonly article = signal<BlogArticle | null>(null);
    public readonly comments = signal<ArticleComment[]>([]);
    public readonly articleRating = signal<ArticleRating | null>(null);

    public saveArticleDetails(
        article: BlogArticle | null,
        comments: ArticleComment[],
        articleRating: ArticleRating | null
    ): void {
        this.article.set(article);
        this.comments.set(comments);
        this.articleRating.set(articleRating);
    }

    public clearArticleDetails(): void {
        this.article.set(null);
        this.comments.set([]);
        this.articleRating.set(null);
    }
}