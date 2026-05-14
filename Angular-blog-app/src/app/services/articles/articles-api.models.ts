export interface BackendArticle {
    id: string;
    title: string;
    content: string;
    imgSrc: string | null;
    categoryId: string | null;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export interface BackendArticlesPageResult {
    items: BackendArticle[];
    total: number;
    page: number;
    limit: number;
}