import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

import { ARTICLES_SERVICE } from './services/articles/articles-service.token';
import { ArticlesApiService } from './services/articles/articles-api.service';
import { ArticlesService } from './services/articles/articles.service';

import { ARTICLE_DETAILS_SERVICE } from './services/article-details/article-details-service.token';
import { ArticleDetailsService } from './services/article-details/article-details.service';

import { CATEGORIES_SERVICE } from './services/categories/categories-service.token';
import { CategoriesApiService } from './services/categories/categories-api.service';
import { CategoriesService } from './services/categories/categories.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),

    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
      })
    ),

    ArticlesService,
    ArticlesApiService,
    ArticleDetailsService,
    CategoriesService,
    CategoriesApiService,

    {
      provide: ARTICLES_SERVICE,
      useClass: environment.useBackendApi ? ArticlesApiService : ArticlesService,
    },
    {
      provide: ARTICLE_DETAILS_SERVICE,
      useExisting: ArticleDetailsService,
    },
    {
      provide: CATEGORIES_SERVICE,
      useClass: environment.useBackendApi ? CategoriesApiService : CategoriesService,
    },
  ],
};