export interface BlogArticle {
    id: string;
    title: string;
    content: string;
    date: string;
    image: string;
    rating?: number;
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


//blog page details

export interface ArticleRating {
    articleId: string;
    average: number;
    votesCount: number;
    currentUserRating: number | null;
}

export interface ArticleComment {
    id: string;
    author: string;
    text: string;
    date: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
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