import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

import { environment } from '../environments/environment';
import { routes } from './app.routes';

import { ARTICLES_SERVICE } from './services/articles/articles-service.token';
import { ArticlesApiService } from './services/articles/articles-api.service';
import { ArticlesService } from './services/articles/articles.service';

import { ARTICLE_DETAILS_SERVICE } from './services/article-details/article-details-service.token';
import { ArticleDetailsService } from './services/article-details/article-details.service';
import { ArticleDetailsGraphqlService } from './services/article-details/graphql/article-details-graphql.service';

import { CATEGORIES_SERVICE } from './services/categories/categories-service.token';
import { CategoriesApiService } from './services/categories/categories-api.service';
import { CategoriesService } from './services/categories/categories.service';

import { ARTICLE_EVENTS_SERVICE } from './services/article-events/article-events-service.token';
import { ArticleEventsSocketIoService } from './services/article-events/article-events-socket-io.service';
import { ArticleEventsNoopService } from './services/article-events/article-events-noop.service';

import { AUTH_SERVICE } from './services/auth/auth-service.token';
import { AuthApiService } from './services/auth/auth-api.service';
import { AuthService } from './services/auth/auth.service';
import { authTokenInterceptor } from './interceptors/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authTokenInterceptor])),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      return {
        link: httpLink.create({
          uri: environment.graphqlUrl,
        }),
        cache: new InMemoryCache(),
      };
    }),

    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
      })
    ),

    {
      provide: ARTICLES_SERVICE,
      useClass: environment.useBackendApi ? ArticlesApiService : ArticlesService,
    },
    {
      provide: ARTICLE_DETAILS_SERVICE,
      useClass: environment.useBackendApi
        ? ArticleDetailsGraphqlService
        : ArticleDetailsService,
    },
    {
      provide: CATEGORIES_SERVICE,
      useClass: environment.useBackendApi ? CategoriesApiService : CategoriesService,
    },
    {
      provide: ARTICLE_EVENTS_SERVICE,
      useClass: environment.useBackendApi && environment.useWebSocket
        ? ArticleEventsSocketIoService
        : ArticleEventsNoopService,
    },
    {
      provide: AUTH_SERVICE,
      useClass: environment.useBackendApi ? AuthApiService : AuthService,
    },
  ],
};