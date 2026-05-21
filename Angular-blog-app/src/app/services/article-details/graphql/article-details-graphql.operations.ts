import { gql } from 'apollo-angular';

export const ARTICLE_DETAILS_QUERY = gql`
    query ArticleDetails($articleId: ID!) {
        article(id: $articleId) {
            id
            title
            content
            imgSrc
            categoryId
            rating
            createdAt
            updatedAt
        }

        commentsByArticle(articleId: $articleId) {
            id
            articleId
            content
            username
            rating
            avgRating
            createdAt
        }
    }
`;

export const ARTICLE_RATING_UP_MUTATION = gql`
    mutation ArticleRatingUp($id: ID!) {
        articleRatingUp(id: $id) {
            id
            title
            content
            imgSrc
            categoryId
            rating
            createdAt
            updatedAt
        }
    }
`;

export const ARTICLE_RATING_DOWN_MUTATION = gql`
    mutation ArticleRatingDown($id: ID!) {
        articleRatingDown(id: $id) {
            id
            title
            content
            imgSrc
            categoryId
            rating
            createdAt
            updatedAt
        }
    }
`;

export const CREATE_COMMENT_MUTATION = gql`
    mutation CreateComment($createComment: CreateCommentInput!) {
        createComment(createComment: $createComment) {
            id
            articleId
            content
            username
            rating
            avgRating
            createdAt
        }
    }
`;

export const COMMENT_RATING_MUTATION = gql`
    mutation CommentRating($id: ID!, $rating: Float!) {
        voteComment(id: $id, vote: $rating) {
            id
            articleId
            content
            username
            rating
            avgRating
            createdAt
        }
    }
`;

export const COMMENTS_COUNT_QUERY = gql`
    query CommentsCount($query: ArticlesQueryInput) {
        articles(query: $query) {
            items {
                id
                comments {
                    id
                }
            }
        }
    }
`;