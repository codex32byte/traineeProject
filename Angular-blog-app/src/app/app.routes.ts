import { Routes } from '@angular/router';
import { MainPage } from './ui/pages/main-page/main-page';
import { BlogPage } from './ui/pages/blog-page/blog-page';

export const routes: Routes = [
    { path: '', component: MainPage, title: 'Home' },
    { path: 'blog', component: BlogPage, title: 'Blog' }
];