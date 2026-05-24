import { Pipe, PipeTransform } from '@angular/core';

import { CommentRatingPreview } from '../../services/article-events/article-events.models';

@Pipe({
    name: 'commentStarActive',
    standalone: true,
})
export class CommentStarActivePipe implements PipeTransform {
    public transform(
        commentRating: number | null | undefined,
        star: number,
        commentId: string,
        preview: CommentRatingPreview | null
    ): boolean {
        const rating = this.getDisplayedRating(commentRating, commentId, preview);

        return rating >= star - 0.5;
    }

    private getDisplayedRating(
        commentRating: number | null | undefined,
        commentId: string,
        preview: CommentRatingPreview | null
    ): number {
        if (preview?.commentId === commentId) {
            return preview.rating;
        }

        return this.normalizeRatingValue(commentRating);
    }

    private normalizeRatingValue(rating: number | null | undefined): number {
        return Math.min(Math.max(Number(rating ?? 0), 0), 5);
    }
}