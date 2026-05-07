import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal, DestroyRef } from '@angular/core';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ArticlesStoreService } from '../../../../../services/articles/articles-store.service';
import { ARTICLE_DETAILS_SERVICE } from '../../../../../services/article-details/article-details-service.token';

@Component({
  selector: 'app-blog-stats-modal',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './blog-stats-modal.html',
  styleUrl: './blog-stats-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogStatsModal {
  private readonly articlesStore = inject(ArticlesStoreService);
  private readonly articleDetailsService = inject(ARTICLE_DETAILS_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly articlesCount = this.articlesStore.totalItems;
  protected readonly commentsCount = signal(0);

  @Output() close = new EventEmitter<void>();

  constructor() {
    this.loadCommentsCount();
  }

  private loadCommentsCount(): void {
    this.articleDetailsService
      .getCommentsCount()
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(count => {
        this.commentsCount.set(count);
      });
  }
}