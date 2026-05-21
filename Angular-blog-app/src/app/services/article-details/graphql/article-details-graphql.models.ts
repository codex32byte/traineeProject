export interface GraphqlArticle {
    id: string;
    title: string;
    content: string;
    imgSrc: string | null;
    categoryId: string | null;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

export interface GraphqlComment {
    id: string;
    articleId: string;
    content: string;
    username: string;
    rating: number;
    avgRating: number;
    createdAt: string;
}

export interface ArticleDetailsQueryResult {
    article: GraphqlArticle | null;
    commentsByArticle: GraphqlComment[];
}

export interface ArticleRatingMutationResult {
    articleRatingUp?: GraphqlArticle;
    articleRatingDown?: GraphqlArticle;
}

export interface CreateCommentMutationResult {
    createComment: GraphqlComment;
}

export interface CommentRatingMutationResult {
    voteComment: GraphqlComment;
}

export interface CommentsCountQueryResult {
    articles: {
        items: {
            id: string;
            comments: {
                id: string;
            }[] | null;
        }[];
    };
}