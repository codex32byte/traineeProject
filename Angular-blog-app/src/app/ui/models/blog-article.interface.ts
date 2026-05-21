export interface BlogArticle {
    id: string;
    title: string;
    content: string;
    date: string;
    image: string;
    rating?: number;
    categoryId?: string | null;
}

export interface BlogArticleFormValue {
    title: string;
    content: string;
    imageFile?: File | null;
    categoryId?: string | null;
    categoryName?: string | null;
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

// blog page details
export type ArticleVote = 'up' | 'down';

export interface ArticleRating {
    articleId: string;
    score: number;
    currentUserVote: ArticleVote | null;
}

export interface ArticleComment {
    id: string;
    author: string;
    text: string;
    date: string;
    rating: number;
}

export interface ArticleDetailsResult {
    article: BlogArticle | null;
    comments: ArticleComment[];
    articleRating: ArticleRating | null;
}

export interface CommentFormValue {
    author: string;
    text: string;
}