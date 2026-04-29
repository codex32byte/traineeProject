import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ArticlesPageResult,
  ArticlesPaginationParams,
  BlogArticle,
  BlogArticleFormValue,
} from '../../ui/models/blog-article.interface';
import { ArticlesServiceInterface } from './articles-service.interface';
import { ArticlesStoreService } from './articles-store.service';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService implements ArticlesServiceInterface {
  private readonly storageKey = 'blogArticles';

  private readonly defaultArticles: BlogArticle[] = [
    {
      id: '1',
      title: 'NETI-Link blockchain student achievements',
      content:
        'A secure blockchain service for presenting and verifying student achievements, helps students to find job opportunities based on their activity and achievements!',
      date: 'November 2, 2024',
      image: 'assets/images/link1.webp',
    },
    {
      id: '2',
      title: 'WebWave3 Cryptogate education payments',
      content:
        'A blockchain platform for education payments using smart contracts and digital transactions.',
      date: 'April 5, 2024',
      image: 'assets/images/uni1.webp',
    },
  ];

  constructor(private articlesStore: ArticlesStoreService) { }

  public getArticles(params: ArticlesPaginationParams): Observable<ArticlesPageResult> {
    const articles = this.getArticlesFromStorage();
    return of(this.getPageResult(articles, params));
  }

  public addArticle(
    articleData: BlogArticleFormValue,
    params: ArticlesPaginationParams
  ): Observable<ArticlesPageResult> {
    const articles = this.getArticlesFromStorage();

    const newArticle: BlogArticle = {
      id: crypto.randomUUID(),
      title: articleData.title,
      content: articleData.content,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      image: 'assets/images/link1.webp',
    };

    const updatedArticles = [...articles, newArticle];
    this.saveArticlesToStorage(updatedArticles);
    this.articlesStore.saveArticles(updatedArticles, updatedArticles.length);

    return of(this.getPageResult(updatedArticles, params));
  }

  public updateArticle(
    id: string,
    articleData: BlogArticleFormValue,
    params: ArticlesPaginationParams
  ): Observable<ArticlesPageResult> {
    const articles = this.getArticlesFromStorage();

    const updatedArticles = articles.map(article => {
      if (article.id !== id) {
        return article;
      }

      return {
        ...article,
        title: articleData.title,
        content: articleData.content,
      };
    });

    this.saveArticlesToStorage(updatedArticles);
    this.articlesStore.saveArticles(updatedArticles, updatedArticles.length);

    return of(this.getPageResult(updatedArticles, params));
  }

  public deleteArticle(
    id: string,
    params: ArticlesPaginationParams
  ): Observable<ArticlesPageResult> {
    const articles = this.getArticlesFromStorage();

    const updatedArticles = articles.filter(article => article.id !== id);
    this.saveArticlesToStorage(updatedArticles);
    this.articlesStore.saveArticles(updatedArticles, updatedArticles.length);

    return of(this.getPageResult(updatedArticles, params));
  }

  public getArticlesFromStorage(): BlogArticle[] {
    const articlesJson = localStorage.getItem(this.storageKey);

    if (!articlesJson) {
      this.saveArticlesToStorage(this.defaultArticles);
      return this.defaultArticles;
    }

    return JSON.parse(articlesJson) as BlogArticle[];
  }

  private saveArticlesToStorage(articles: BlogArticle[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(articles));
  }

  private getPageResult(
    articles: BlogArticle[],
    params: ArticlesPaginationParams
  ): ArticlesPageResult {
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;

    return {
      items: articles.slice(startIndex, endIndex),
      allItems: articles,
      totalItems: articles.length,
    };
  }
}