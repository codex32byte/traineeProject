import { InjectionToken } from '@angular/core';
import { ArticlesServiceInterface } from './articles-service.interface';

export const ARTICLES_SERVICE = new InjectionToken<ArticlesServiceInterface>(
  'ARTICLES_SERVICE'
);