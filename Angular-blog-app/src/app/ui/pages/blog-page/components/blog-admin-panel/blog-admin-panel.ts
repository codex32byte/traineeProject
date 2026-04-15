import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-blog-admin-panel',
  standalone: true,
  templateUrl: './blog-admin-panel.html',
  styleUrl: './blog-admin-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogAdminPanel {
  @Input({ required: true }) isLoading = false;

  @Output() openForm = new EventEmitter<void>();
  @Output() toggleStats = new EventEmitter<void>();
}