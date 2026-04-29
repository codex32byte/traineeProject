import { Component, inject, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ARTICLES_SERVICE } from '../../../../../services/articles/articles-service.token';
import { ArticlesStoreService } from '../../../../../services/articles/articles-store.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-recent-articles',
  templateUrl: './recent-articles.html',
  styleUrl: './recent-articles.scss',
  imports: [RouterModule],
})
export class RecentArticles {
  private readonly postsPerPage = 7;

  private readonly articlesService = inject(ARTICLES_SERVICE);
  protected readonly articlesStore = inject(ArticlesStoreService);


  protected readonly latestArticles = computed(() => {
    // Use getArticlesFromStorage from ArticlesService to load articles
    const allArticles = this.articlesService.getArticlesFromStorage();
    return allArticles.slice(-2).reverse();
  });

  constructor() {
    this.loadArticlesIfStoreIsEmpty();
  }

  // Function to load articles if store is empty
  private loadArticlesIfStoreIsEmpty(): void {
    if (this.articlesStore.articles().length) {
      return;
    }

    // If no articles in the store, fetch them and save to store
    this.articlesService
      .getArticles({
        page: this.articlesStore.activePage(),
        limit: this.postsPerPage,
      })
      .pipe(take(1))
      .subscribe(response => {
        // Save articles and total items with the correct arguments
        this.articlesStore.saveArticles(response.items, response.totalItems);
      });
  }
}