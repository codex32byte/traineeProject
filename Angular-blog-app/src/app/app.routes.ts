import { Routes } from '@angular/router';
import { MainPage } from './ui/pages/main-page/main-page';
import { BlogPage } from './ui/pages/blog-page/blog-page';
import { ArticleDetailsPage } from './ui/pages/article-details/article-details-page';
import { articleTitleResolver } from './services/article-details/article-title.resolver';
export const routes: Routes = [
    { path: '', component: MainPage, title: 'Home' },
    { path: 'blog', component: BlogPage, title: 'Blog' },
    {
        path: 'blog/:id',
        component: ArticleDetailsPage,
        title: articleTitleResolver,
    },
];