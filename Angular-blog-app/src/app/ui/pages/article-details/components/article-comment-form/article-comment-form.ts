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

    protected readonly form = new FormGroup({
        author: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        text: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
    });

    protected submitComment(): void {
        const commentData: CommentFormValue = {
            author: this.form.controls.author.value.trim(),
            text: this.form.controls.text.value.trim(),
        };

        if (this.form.invalid || !commentData.author || !commentData.text) {
            this.form.markAllAsTouched();
            return;
        }

        this.commentSubmit.emit(commentData);

        this.formDirective?.resetForm({
            author: '',
            text: '',
        });
    }
}