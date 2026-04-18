import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BlogArticle } from '../../../../models/blog-article.interface';

@Component({
  selector: 'app-blog-articles-section',
  standalone: true,
  templateUrl: './blog-articles-section.html',
  styleUrl: './blog-articles-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogArticlesSection {
  // loading state
  @Input({ required: true }) isLoading = false;

  // current page articles
  @Input({ required: true }) articles: BlogArticle[] = [];

  // current page number
  @Input({ required: true }) currentPage = 1;

  // total available pages
  @Input({ required: true }) totalPages = 1;

  @Output() deleteArticle = new EventEmitter<string>();
  @Output() editArticle = new EventEmitter<BlogArticle>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
}