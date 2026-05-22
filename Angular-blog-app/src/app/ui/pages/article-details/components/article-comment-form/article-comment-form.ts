import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Output,
    ViewChild,
    computed,
    effect,
    input,
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
    public readonly currentUsername = input<string | null>(null);

    @Output() public readonly commentSubmit = new EventEmitter<CommentFormValue>();

    @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;

    protected readonly isAuthorAutoFilled = computed<boolean>(() => {
        return Boolean(this.currentUsername()?.trim());
    });

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

    constructor() {
        effect(() => {
            const username = this.currentUsername()?.trim() ?? '';

            if (username) {
                this.form.controls.author.setValue(username, {
                    emitEvent: false,
                });
                this.form.controls.author.clearValidators();
            } else {
                this.form.controls.author.setValue('', {
                    emitEvent: false,
                });
                this.form.controls.author.setValidators([Validators.required]);
            }

            this.form.controls.author.updateValueAndValidity({
                emitEvent: false,
            });
        });
    }

    protected submitComment(): void {
        const author = this.currentUsername()?.trim() ||
            this.form.controls.author.value.trim();

        const commentData: CommentFormValue = {
            author,
            text: this.form.controls.text.value.trim(),
        };

        if (this.form.invalid || !commentData.author || !commentData.text) {
            this.form.markAllAsTouched();
            return;
        }

        this.commentSubmit.emit(commentData);

        this.formDirective?.resetForm({
            author: this.currentUsername()?.trim() ?? '',
            text: '',
        });
    }
}