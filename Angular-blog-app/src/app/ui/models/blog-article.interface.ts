export interface BlogArticle {
    id: string;
    title: string;
    content: string;
    date: string;
    image: string;
}

export interface BlogArticleFormValue {
    title: string;
    content: string;
}

export interface ArticlesPaginationParams {
    page: number;
    limit: number;
}

export interface ArticlesPageResult {
    items: BlogArticle[];
    allItems: BlogArticle[];
    totalItems: number;
}

export interface MinLengthValidationInfo {
    requiredLength: number;
    actualLength: number;
}