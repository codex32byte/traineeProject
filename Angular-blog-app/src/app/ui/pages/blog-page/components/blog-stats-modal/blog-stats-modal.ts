import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { ArticlesStoreService } from '../../../../../services/articles/articles-store.service';

@Component({
  selector: 'app-blog-stats-modal',
  standalone: true,
  templateUrl: './blog-stats-modal.html',
  styleUrl: './blog-stats-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogStatsModal {
  private readonly articlesStore = inject(ArticlesStoreService);


  protected readonly articlesCount = computed(() => this.articlesStore.totalItems());

  @Output() close = new EventEmitter<void>();
}