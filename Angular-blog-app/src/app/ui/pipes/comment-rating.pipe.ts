import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'commentRating',
    standalone: true,
})
export class CommentRatingPipe implements PipeTransform {
    public transform(rating: number | null | undefined): string {
        return this.normalizeRatingValue(rating).toFixed(2);
    }

    private normalizeRatingValue(rating: number | null | undefined): number {
        return Math.min(Math.max(Number(rating ?? 0), 0), 5);
    }
}