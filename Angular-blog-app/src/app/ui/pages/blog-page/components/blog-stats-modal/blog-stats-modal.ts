import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-blog-stats-modal',
  standalone: true,
  templateUrl: './blog-stats-modal.html',
  styleUrl: './blog-stats-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogStatsModal {
  @Input({ required: true }) articlesCount = 0;

  @Output() close = new EventEmitter<void>();
}