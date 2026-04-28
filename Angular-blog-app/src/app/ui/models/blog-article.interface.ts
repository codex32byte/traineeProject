export interface BlogArticle {
    id: string;
    title: string;
    content: string;
    date: string;
    image: string;
}

export type BlogArticleFormValue = Pick<BlogArticle, 'title' | 'content'>;

export interface MinLengthValidationInfo {
    requiredLength: number;
    actualLength: number;
}