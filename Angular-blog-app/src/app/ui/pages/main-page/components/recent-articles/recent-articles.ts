import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';

import { ARTICLES_SERVICE } from '../../../../../services/articles/articles-service.token';
import { ArticlesStoreService } from '../../../../../services/articles/articles-store.service';

@Component({
  selector: 'app-recent-articles',
  templateUrl: './recent-articles.html',
  styleUrl: './recent-articles.scss',
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentArticles {
  private readonly latestArticlesLimit = 2;

  private readonly articlesService = inject(ARTICLES_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly articlesStore = inject(ArticlesStoreService);
  protected readonly latestArticles = this.articlesStore.latestArticles;

  constructor() {
    this.loadLatestArticlesIfStoreIsEmpty();
  }

  private loadLatestArticlesIfStoreIsEmpty(): void {
    if (this.latestArticles().length) {
      return;
    }

    this.articlesService
      .getLatestArticles(this.latestArticlesLimit)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(articles => {
        this.articlesStore.saveLatestArticles(articles);
      });
  }
}