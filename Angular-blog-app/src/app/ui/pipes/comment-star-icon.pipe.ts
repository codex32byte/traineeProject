import { Pipe, PipeTransform } from '@angular/core';

import { CommentRatingPreview } from '../../services/article-events/article-events.models';

@Pipe({
    name: 'commentStarIcon',
    standalone: true,
})
export class CommentStarIconPipe implements PipeTransform {
    public transform(
        commentRating: number | null | undefined,
        star: number,
        commentId: string,
        preview: CommentRatingPreview | null
    ): string {
        const rating = this.getDisplayedRating(commentRating, commentId, preview);

        if (rating >= star) {
            return 'star';
        }

        if (rating >= star - 0.5) {
            return 'star_half';
        }

        return 'star_border';
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