import { Observable } from 'rxjs';
import { ArticleCategory } from '../../ui/models/category.interface';

export interface CategoriesServiceInterface {
    getCategories(): Observable<ArticleCategory[]>;

    createCategory(name: string): Observable<ArticleCategory>;

    getOrCreateCategory(name: string): Observable<ArticleCategory>;
}