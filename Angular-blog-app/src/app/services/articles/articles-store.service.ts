import { Injectable, signal } from '@angular/core';
import { BlogArticle } from '../../ui/models/blog-article.interface';

@Injectable({
  providedIn: 'root',
})
export class ArticlesStoreService {
  public readonly articles = signal<BlogArticle[]>([]);
  public readonly latestArticles = signal<BlogArticle[]>([]);
  public readonly activePage = signal(1);
  public readonly totalItems = signal(0);

  public saveArticles(articles: BlogArticle[], totalItems: number): void {
    this.articles.set(articles);
    this.totalItems.set(totalItems);
  }

  public saveLatestArticles(articles: BlogArticle[]): void {
    this.latestArticles.set(articles);
  }

  public savePaginationState(page: number): void {
    this.activePage.set(page);
  }
}