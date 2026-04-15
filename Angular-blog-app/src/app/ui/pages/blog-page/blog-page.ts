import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ArticleForm } from '../../components/article-form/article-form';
import { BlogAdminPanel } from './components/blog-admin-panel/blog-admin-panel';
import { BlogArticlesSection } from './components/blog-articles-section/blog-articles-section';
import { BlogStatsModal } from './components/blog-stats-modal/blog-stats-modal';


interface BlogArticle {
  id: string;
  title: string;
  content: string;
  date: string;
  image: string;
}

@Component({
  selector: 'app-blog-page',
  imports: [ArticleForm, BlogAdminPanel, BlogArticlesSection, BlogStatsModal],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPage {
  private initialLoadDelay = 700;
  private readonly postsPerPage = 7;

  // mock articles
  private mockArticles: BlogArticle[] = [
    {
      id: '1',
      title: 'NETI-Link',
      content: 'A secure blockchain service for presenting and verifying student achievements, helps students to find job opportunities based on their activity and achievements!',
      date: 'November 2, 2024',
      image: 'assets/images/link1.webp'
    },
    {
      id: '2',
      title: 'WebWave3 Cryptogate',
      content: 'A blockchain platform for education payments using smart contracts and digital transactions.',
      date: 'April 5, 2024',
      image: 'assets/images/uni1.webp'
    }
  ];

  isLoading = signal(true);
  isFormVisible = signal(false);
  isStatsVisible = signal(false);
  currentPage = signal(1);

  // articles displayed on the current page
  articles = signal<BlogArticle[]>([]);

  // total number of all articles
  totalItems = signal(0);

  // total pages
  totalPages = computed(() => {
    const total = Math.ceil(this.totalItems() / this.postsPerPage);
    return total || 1;
  });

  // total articles count for statistics
  articlesCount = computed(() => this.totalItems());

  // init page loading
  constructor() {
    void this.loadArticles();
  }

  // loading current page articles
  async loadArticles(): Promise<void> {
    this.isLoading.set(true);

    try {
      const response = await this.fetchArticles(this.currentPage(), this.postsPerPage);
      this.articles.set(response.items);
      this.totalItems.set(response.totalItems);
    } finally {
      this.isLoading.set(false);
    }
  }

  // add article
  async addArticle(article: { title: string; content: string }): Promise<void> {
    this.isLoading.set(true);
    this.closeForm();

    try {
      await this.wait(this.initialLoadDelay);

      const newArticle: BlogArticle = {
        id: crypto.randomUUID(),
        title: article.title,
        content: article.content,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        image: 'assets/images/link1.webp'
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

  // delete article
  async deleteArticle(id: string): Promise<void> {
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
  async goToPreviousPage(): Promise<void> {
    if (this.isLoading() || this.currentPage() === 1) {
      return;
    }

    this.currentPage.update(page => page - 1);
    await this.loadArticles();
  }

  // pagination,,next page
  async goToNextPage(): Promise<void> {
    if (this.isLoading() || this.currentPage() === this.totalPages()) {
      return;
    }

    this.currentPage.update(page => page + 1);
    await this.loadArticles();
  }

  // opening add article form
  openForm(): void {
    if (this.isLoading()) {
      return;
    }

    this.isFormVisible.set(true);
  }

  // closing add article form
  closeForm(): void {
    this.isFormVisible.set(false);
  }

  // toggel statistics modal 
  toggleStats(): void {
    if (this.isLoading()) {
      return;
    }

    this.isStatsVisible.update(value => !value);
  }

  // closing stat modal
  closeStats(): void {
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
      totalItems: this.mockArticles.length
    };
  }


  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}