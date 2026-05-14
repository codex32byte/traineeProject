import { ChangeDetectionStrategy, Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { Observable, map, of, switchMap, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ArticleForm } from '../../components/article-form/article-form';
import { BlogAdminPanel } from './components/blog-admin-panel/blog-admin-panel';
import { BlogArticlesSection } from './components/blog-articles-section/blog-articles-section';
import { BlogStatsModal } from './components/blog-stats-modal/blog-stats-modal';
import { ArticlesPageResult, BlogArticle, BlogArticleFormValue } from '../../models/blog-article.interface';
import { ARTICLES_SERVICE } from '../../../services/articles/articles-service.token';
import { ARTICLE_DETAILS_SERVICE } from '../../../services/article-details/article-details-service.token';
import { CATEGORIES_SERVICE } from '../../../services/categories/categories-service.token';
import { ArticlesStoreService } from '../../../services/articles/articles-store.service';

@Component({
  selector: 'app-blog-page',
  imports: [ArticleForm, BlogAdminPanel, BlogArticlesSection, BlogStatsModal],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage {
  private readonly postsPerPage = 7;
  private readonly latestArticlesLimit = 2;
  private readonly articlesService = inject(ARTICLES_SERVICE);
  private readonly articleDetailsService = inject(ARTICLE_DETAILS_SERVICE);
  private readonly categoriesService = inject(CATEGORIES_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly articlesStore = inject(ArticlesStoreService);

  protected readonly isLoading = signal(true);
  protected readonly isFormVisible = signal(false);
  protected readonly isStatsVisible = signal(false);
  protected readonly articleToEdit = signal<BlogArticle | null>(null);
  protected readonly requestError = signal<string | null>(null);

  // total pages
  protected readonly totalPages = computed<number>(() => {
    const total = Math.ceil(this.articlesStore.totalItems() / this.postsPerPage);
    return total || 1;
  });

  // init page loading
  constructor() {
    this.loadArticles();
  }

  // loading current page articles
  private loadArticles(): void {
    this.requestError.set(null);
    this.isLoading.set(true);

    this.articlesService
      .getArticles({
        page: this.articlesStore.activePage(),
        limit: this.postsPerPage,
      })
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.saveArticlesResult(response);
          this.isLoading.set(false);
        },
        error: error => {
          this.handleRequestError(error, 'Не удалось загрузить статьи');
        },
      });
  }

  protected saveArticle(articleData: BlogArticleFormValue): void {
    const articleToEdit = this.articleToEdit();

    if (articleToEdit) {
      this.updateArticle(articleToEdit.id, articleData);
      return;
    }

    this.addArticle(articleData);
  }

  // add article 
  private addArticle(articleData: BlogArticleFormValue): void {
    this.requestError.set(null);
    this.isLoading.set(true);
    this.closeForm();

    const targetPage = 1;

    this.prepareArticleData(articleData)
      .pipe(
        switchMap(preparedArticleData =>
          this.articlesService.addArticle(preparedArticleData, {
            page: targetPage,
            limit: this.postsPerPage,
          })
        ),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.articlesStore.savePaginationState(targetPage);
          this.saveArticlesResult(response);
          this.isLoading.set(false);
        },
        error: error => {
          this.isFormVisible.set(true);
          this.handleRequestError(error, 'Не удалось добавить статью');
        },
      });
  }

  private updateArticle(id: string, articleData: BlogArticleFormValue): void {
    this.requestError.set(null);
    this.isLoading.set(true);
    this.closeForm();

    this.prepareArticleData(articleData)
      .pipe(
        switchMap(preparedArticleData =>
          this.articlesService.updateArticle(id, preparedArticleData, {
            page: this.articlesStore.activePage(),
            limit: this.postsPerPage,
          })
        ),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.saveArticlesResult(response);
          this.isLoading.set(false);
        },
        error: error => {
          const article = this.articlesStore.articles().find(article => article.id === id) ?? null;

          this.articleToEdit.set(article);
          this.isFormVisible.set(Boolean(article));
          this.handleRequestError(error, 'Не удалось изменить статью');
        },
      });
  }

  // delete article 
  protected deleteArticle(id: string): void {
    if (this.isLoading()) {
      return;
    }

    this.requestError.set(null);
    this.isLoading.set(true);

    const expectedTotalItems = this.articlesStore.totalItems() - 1;
    const expectedTotalPages = Math.ceil(expectedTotalItems / this.postsPerPage) || 1;
    const targetPage =
      this.articlesStore.activePage() > expectedTotalPages
        ? expectedTotalPages
        : this.articlesStore.activePage();

    this.articlesService
      .deleteArticle(id, {
        page: targetPage,
        limit: this.postsPerPage,
      })
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.articleDetailsService.deleteArticleRelatedData(id);
          this.articlesStore.savePaginationState(targetPage);
          this.saveArticlesResult(response);
          this.isLoading.set(false);
        },
        error: error => {
          this.handleRequestError(error, 'Не удалось удалить статью');
        },
      });
  }

  // pagination,,previous page
  protected goToPreviousPage(): void {
    if (this.isLoading() || this.articlesStore.activePage() === 1) {
      return;
    }

    this.articlesStore.savePaginationState(this.articlesStore.activePage() - 1);
    this.loadArticles();
  }

  // pagination,,next page
  protected goToNextPage(): void {
    if (this.isLoading() || this.articlesStore.activePage() === this.totalPages()) {
      return;
    }

    this.articlesStore.savePaginationState(this.articlesStore.activePage() + 1);
    this.loadArticles();
  }

  // opening add article form
  protected openForm(): void {
    if (this.isLoading()) {
      return;
    }

    this.requestError.set(null);
    this.articleToEdit.set(null);
    this.isFormVisible.set(true);
  }

  protected openEditForm(article: BlogArticle): void {
    if (this.isLoading()) {
      return;
    }

    this.requestError.set(null);
    this.articleToEdit.set(article);
    this.isFormVisible.set(true);
  }

  protected closeForm(): void {
    this.isFormVisible.set(false);
    this.articleToEdit.set(null);
  }

  // toggle statistics modal
  protected toggleStats(): void {
    if (this.isLoading()) {
      return;
    }

    this.isStatsVisible.update(value => !value);
  }

  protected closeStats(): void {
    this.isStatsVisible.set(false);
  }

  private prepareArticleData(articleData: BlogArticleFormValue): Observable<BlogArticleFormValue> {
    const categoryName = articleData.categoryName?.trim();

    if (!categoryName) {
      return of({
        ...articleData,
        categoryId: null,
      });
    }

    return this.categoriesService.getOrCreateCategory(categoryName).pipe(
      map(category => ({
        ...articleData,
        categoryId: category.id,
        categoryName: category.name,
      }))
    );
  }

  private saveArticlesResult(response: ArticlesPageResult): void {
    this.articlesStore.saveArticles(response.items, response.totalItems);
    this.refreshLatestArticles();
  }

  private refreshLatestArticles(): void {
    this.articlesService
      .getLatestArticles(this.latestArticlesLimit)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: articles => {
          this.articlesStore.saveLatestArticles(articles);
        },
        error: error => {
          console.error('Failed to refresh latest articles:', error);
        },
      });
  }

  private handleRequestError(error: unknown, fallbackMessage: string): void {
    console.error(fallbackMessage, error);
    this.requestError.set(fallbackMessage);
    this.isLoading.set(false);
  }
}