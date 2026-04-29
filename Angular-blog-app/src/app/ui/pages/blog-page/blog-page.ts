import { ChangeDetectionStrategy, Component, computed, inject, signal, ChangeDetectorRef } from '@angular/core';
import { take } from 'rxjs';
import { ArticleForm } from '../../components/article-form/article-form';
import { BlogAdminPanel } from './components/blog-admin-panel/blog-admin-panel';
import { BlogArticlesSection } from './components/blog-articles-section/blog-articles-section';
import { BlogStatsModal } from './components/blog-stats-modal/blog-stats-modal';
import { BlogArticle, BlogArticleFormValue } from '../../models/blog-article.interface';
import { ARTICLES_SERVICE } from '../../../services/articles/articles-service.token';
import { ArticlesStoreService } from '../../../services/articles/articles-store.service';

@Component({
  selector: 'app-blog-page',
  imports: [ArticleForm, BlogAdminPanel, BlogArticlesSection, BlogStatsModal],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage {
  private readonly initialLoadDelay = 700;
  private readonly postsPerPage = 7;

  private readonly articlesService = inject(ARTICLES_SERVICE);
  protected readonly articlesStore = inject(ArticlesStoreService);

  protected readonly isLoading = signal(true);
  protected readonly isFormVisible = signal(false);
  protected readonly isStatsVisible = signal(false);
  protected readonly articleToEdit = signal<BlogArticle | null>(null);

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
  private async loadArticles(): Promise<void> {
    this.isLoading.set(true);


    await this.wait(this.initialLoadDelay);

    this.articlesService
      .getArticles({
        page: this.articlesStore.activePage(),
        limit: this.postsPerPage,
      })
      .pipe(take(1))
      .subscribe(response => {
        this.saveArticlesResult(response);
        this.isLoading.set(false);
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
  private async addArticle(articleData: BlogArticleFormValue): Promise<void> {
    this.isLoading.set(true);
    this.closeForm();

    const totalAfterAdding = this.articlesStore.totalItems() + 1;
    const lastPage = Math.ceil(totalAfterAdding / this.postsPerPage) || 1;

    this.articlesStore.savePaginationState(lastPage);


    await this.wait(this.initialLoadDelay);

    this.articlesService
      .addArticle(articleData, {
        page: lastPage,
        limit: this.postsPerPage,
      })
      .pipe(take(1))
      .subscribe(response => {
        this.saveArticlesResult(response);
        this.isLoading.set(false);
      });
  }


  private async updateArticle(id: string, articleData: BlogArticleFormValue): Promise<void> {
    this.isLoading.set(true);
    this.closeForm();


    await this.wait(this.initialLoadDelay);

    this.articlesService
      .updateArticle(id, articleData, {
        page: this.articlesStore.activePage(),
        limit: this.postsPerPage,
      })
      .pipe(take(1))
      .subscribe(response => {
        this.saveArticlesResult(response);
        this.isLoading.set(false);
      });
  }

  // delete article 
  protected async deleteArticle(id: string): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    const expectedTotalItems = this.articlesStore.totalItems() - 1;
    const expectedTotalPages = Math.ceil(expectedTotalItems / this.postsPerPage) || 1;

    if (this.articlesStore.activePage() > expectedTotalPages) {
      this.articlesStore.savePaginationState(expectedTotalPages);
    }

    await this.wait(this.initialLoadDelay);

    this.articlesService
      .deleteArticle(id, {
        page: this.articlesStore.activePage(),
        limit: this.postsPerPage,
      })
      .pipe(take(1))
      .subscribe(response => {
        this.saveArticlesResult(response);
        this.isLoading.set(false);
      });
  }

  // pagination,,previous page
  protected async goToPreviousPage(): Promise<void> {
    if (this.isLoading() || this.articlesStore.activePage() === 1) {
      return;
    }

    this.articlesStore.savePaginationState(this.articlesStore.activePage() - 1);
    await this.loadArticles();
  }

  // pagination,,next page
  protected async goToNextPage(): Promise<void> {
    if (this.isLoading() || this.articlesStore.activePage() === this.totalPages()) {
      return;
    }

    this.articlesStore.savePaginationState(this.articlesStore.activePage() + 1);
    await this.loadArticles();
  }

  // opening add article form
  protected openForm(): void {
    if (this.isLoading()) {
      return;
    }

    this.articleToEdit.set(null);
    this.isFormVisible.set(true);
  }

  protected openEditForm(article: BlogArticle): void {
    if (this.isLoading()) {
      return;
    }

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

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private saveArticlesResult(response: {
    items: BlogArticle[];
    allItems: BlogArticle[];
    totalItems: number;
  }): void {
    this.articlesStore.saveArticles(response.items, response.totalItems);
  }

}