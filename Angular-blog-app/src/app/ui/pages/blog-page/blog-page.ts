import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ArticleForm } from '../../components/article-form/article-form';
import { BlogAdminPanel } from './components/blog-admin-panel/blog-admin-panel';
import { BlogArticlesSection } from './components/blog-articles-section/blog-articles-section';
import { BlogStatsModal } from './components/blog-stats-modal/blog-stats-modal';
import { BlogArticle, BlogArticleFormValue } from '../../models/blog-article.interface';

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

  private readonly mockArticles: BlogArticle[] = [
    {
      id: '1',
      title: 'NETI-Link blockchain student achievements',
      content: 'A secure blockchain service for presenting and verifying student achievements, helps students to find job opportunities based on their activity and achievements!',
      date: 'November 2, 2024',
      image: 'assets/images/link1.webp',
    },
    {
      id: '2',
      title: 'WebWave3 Cryptogate education payments',
      content: 'A blockchain platform for education payments using smart contracts and digital transactions.',
      date: 'April 5, 2024',
      image: 'assets/images/uni1.webp',
    },
  ];

  protected readonly isLoading = signal(true);
  protected readonly isFormVisible = signal(false);
  protected readonly isStatsVisible = signal(false);
  protected readonly currentPage = signal(1);
  protected readonly articleToEdit = signal<BlogArticle | null>(null);

  // articles displayed on the current page
  protected readonly articles = signal<BlogArticle[]>([]);

  // total number of all articles
  private readonly totalItems = signal(0);


  // total pages
  protected readonly totalPages = computed<number>(() => {
    const total = Math.ceil(this.totalItems() / this.postsPerPage);
    return total || 1;
  });

  // total articles count for statistics
  protected readonly articlesCount = computed<number>(() => this.totalItems());

  // init page loading
  constructor() {
    void this.loadArticles();
  }

  // loading current page articles
  private async loadArticles(): Promise<void> {
    this.isLoading.set(true);

    try {
      const response = await this.fetchArticles(this.currentPage(), this.postsPerPage);
      this.articles.set(response.items);
      this.totalItems.set(response.totalItems);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async saveArticle(articleData: BlogArticleFormValue): Promise<void> {
    const articleToEdit = this.articleToEdit();

    if (articleToEdit) {
      await this.updateArticle(articleToEdit.id, articleData);
      return;
    }

    await this.addArticle(articleData);
  }

  // add article
  private async addArticle(articleData: BlogArticleFormValue): Promise<void> {
    this.isLoading.set(true);
    this.closeForm();

    try {
      await this.wait(this.initialLoadDelay);

      // Add new article
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

      this.mockArticles.push(newArticle);

      const lastPage = Math.ceil(this.mockArticles.length / this.postsPerPage) || 1;
      this.currentPage.set(lastPage);

      const response = await this.fetchArticles(this.currentPage(), this.postsPerPage);
      this.articles.set(response.items);
      this.totalItems.set(response.totalItems);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async updateArticle(
    id: string,
    articleData: BlogArticleFormValue
  ): Promise<void> {
    this.isLoading.set(true);
    this.closeForm();

    try {
      await this.wait(this.initialLoadDelay);

      const articleIndex = this.mockArticles.findIndex(article => article.id === id);

      if (articleIndex !== -1) {
        this.mockArticles[articleIndex] = {
          ...this.mockArticles[articleIndex],
          title: articleData.title,
          content: articleData.content,
        };
      }

      const response = await this.fetchArticles(this.currentPage(), this.postsPerPage);
      this.articles.set(response.items);
      this.totalItems.set(response.totalItems);
    } finally {
      this.isLoading.set(false);
    }
  }

  // delete article
  protected async deleteArticle(id: string): Promise<void> {
    if (this.isLoading()) {
      return;
    }

    this.isLoading.set(true);

    try {
      const articleIndex = this.mockArticles.findIndex(article => article.id === id);

      if (articleIndex !== -1) {
        this.mockArticles.splice(articleIndex, 1);
      }

      const expectedTotalPages = Math.ceil(this.mockArticles.length / this.postsPerPage) || 1;

      if (this.currentPage() > expectedTotalPages) {
        this.currentPage.set(expectedTotalPages);
      }

      const response = await this.fetchArticles(this.currentPage(), this.postsPerPage);
      this.articles.set(response.items);
      this.totalItems.set(response.totalItems);
    } finally {
      this.isLoading.set(false);
    }
  }

  // pagination,,previous page
  protected async goToPreviousPage(): Promise<void> {
    if (this.isLoading() || this.currentPage() === 1) {
      return;
    }

    this.currentPage.update(page => page - 1);
    await this.loadArticles();
  }

  // pagination,,next page
  protected async goToNextPage(): Promise<void> {
    if (this.isLoading() || this.currentPage() === this.totalPages()) {
      return;
    }

    this.currentPage.update(page => page + 1);
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

  // toggel statistics modal 
  protected toggleStats(): void {
    if (this.isLoading()) {
      return;
    }

    this.isStatsVisible.update(value => !value);
  }

  protected closeStats(): void {
    this.isStatsVisible.set(false);
  }

  // fetching paginated articles for the current page
  private async fetchArticles(
    page: number,
    limit: number
  ): Promise<{ items: BlogArticle[]; totalItems: number }> {
    await this.wait(this.initialLoadDelay);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = this.mockArticles.slice(startIndex, endIndex);

    return {
      items,
      totalItems: this.mockArticles.length,
    };
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}