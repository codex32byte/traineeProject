import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

interface BlogArticle {
  id: string;
  title: string;
  content: string;
  date: string;
  image: string;
}

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

  // delete article event
  @Output() deleteArticle = new EventEmitter<string>();

  // previous page event
  @Output() previousPage = new EventEmitter<void>();

  // next page event
  @Output() nextPage = new EventEmitter<void>();
}