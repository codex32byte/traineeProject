import { inject, InjectionToken } from '@angular/core';
import { ArticlesServiceInterface } from './articles-service.interface';
import { ArticlesService } from './articles.service';

export const ARTICLES_SERVICE = new InjectionToken<ArticlesServiceInterface>(
  'ARTICLES_SERVICE',
  {
    providedIn: 'root',
    factory: () => inject(ArticlesService),
  }
);