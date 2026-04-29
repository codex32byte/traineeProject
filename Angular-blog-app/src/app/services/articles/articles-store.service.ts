import { Injectable, signal } from '@angular/core';
import { BlogArticle } from '../../ui/models/blog-article.interface';

@Injectable({
  providedIn: 'root',
})
export class ArticlesStoreService {
  // Use only one signal to store articles
  public readonly articles = signal<BlogArticle[]>([]);
  public readonly activePage = signal(1);
  public readonly totalItems = signal(0);

  // save all articles in one place
  public saveArticles(articles: BlogArticle[], totalItems: number): void {
    this.articles.set(articles);
    this.totalItems.set(totalItems);
  }

  public savePaginationState(page: number): void {
    this.activePage.set(page);
  }

}