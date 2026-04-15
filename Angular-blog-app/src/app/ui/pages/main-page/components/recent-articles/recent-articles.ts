import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recent-articles',
  imports: [RouterLink],
  templateUrl: './recent-articles.html',
  styleUrl: './recent-articles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentArticles { }