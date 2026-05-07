import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

import { ARTICLES_SERVICE } from './services/articles/articles-service.token';
import { ArticlesService } from './services/articles/articles.service';

import { ARTICLE_DETAILS_SERVICE } from './services/article-details/article-details-service.token';
import { ArticleDetailsService } from './services/article-details/article-details.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
      })
    ),

    ArticlesService,
    ArticleDetailsService,

    {
      provide: ARTICLES_SERVICE,
      useExisting: ArticlesService,
    },
    {
      provide: ARTICLE_DETAILS_SERVICE,
      useExisting: ArticleDetailsService,
    },
  ],
};