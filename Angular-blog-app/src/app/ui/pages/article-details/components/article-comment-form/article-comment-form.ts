import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Output,
    ViewChild,
} from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormGroupDirective,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommentFormValue } from '../../../../models/blog-article.interface';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-article-comment-form',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './article-comment-form.html',
    styleUrl: './article-comment-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCommentForm {
    @Output() public readonly commentSubmit = new EventEmitter<CommentFormValue>();

    @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

    protected readonly ratingStars = [1, 2, 3, 4, 5];

    protected readonly form = new FormGroup({
        author: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        text: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        rating: new FormControl(0, {
            nonNullable: true,
            validators: [Validators.required, Validators.min(1), Validators.max(5)],
        }),
    });

    protected submitComment(): void {
        const commentData: CommentFormValue = {
            author: this.form.controls.author.value.trim(),
            text: this.form.controls.text.value.trim(),
            rating: this.form.controls.rating.value,
        };

        if (
            this.form.invalid ||
            !commentData.author ||
            !commentData.text ||
            !commentData.rating
        ) {
            this.form.markAllAsTouched();
            return;
        }

        this.commentSubmit.emit(commentData);

        this.formDirective?.resetForm({
            author: '',
            text: '',
            rating: 0,
        });
    }

    protected setRating(rating: number): void {
        this.form.controls.rating.setValue(rating);
        this.form.controls.rating.markAsTouched();
    }

    protected isRatingStarFilled(star: number): boolean {
        return star <= this.form.controls.rating.value;
    }

    protected hasRatingError(): boolean {
        const control = this.form.controls.rating;

        return control.invalid && control.touched;
    }
}