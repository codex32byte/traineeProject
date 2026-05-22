import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { BlogArticle } from '../../../../models/blog-article.interface';
import { HasRoleDirective } from '../../../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-blog-articles-section',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatCardModule,
    HasRoleDirective,
  ],
  templateUrl: './blog-articles-section.html',
  styleUrl: './blog-articles-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogArticlesSection {
  @Input({ required: true }) isLoading = false;

  @Input({ required: true }) articles: BlogArticle[] = [];

  @Input({ required: true }) currentPage = 1;

  @Input({ required: true }) totalPages = 1;

  @Output() deleteArticle = new EventEmitter<string>();
  @Output() editArticle = new EventEmitter<BlogArticle>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
}