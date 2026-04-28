import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, effect, input, } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { BlogArticle, BlogArticleFormValue, MinLengthValidationInfo, } from '../../models/blog-article.interface';

@Component({
  selector: 'app-article-form',
  imports: [ReactiveFormsModule],
  templateUrl: './article-form.html',
  styleUrl: './article-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleForm {
  readonly articleToEdit = input.required<BlogArticle | null>();

  @Output() submitArticle = new EventEmitter<BlogArticleFormValue>();
  @Output() closeForm = new EventEmitter<void>();

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(25)],
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private isEditMode = computed<boolean>(() => {
    return Boolean(this.articleToEdit());
  });

  protected formTitle = computed<string>(() => {
    return this.isEditMode() ? 'Изменить статью' : 'Добавить статью';
  });

  protected saveButtonTitle = computed<string>(() => {
    return this.isEditMode() ? 'Сохранить' : 'Добавить';
  });

  constructor() {
    this.editDataEffect();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitArticle.emit({
      title: this.form.controls.title.value.trim(),
      content: this.form.controls.content.value.trim(),
    });
  }

  protected onClose(): void {
    this.closeForm.emit();
  }

  protected hasError(controlName: keyof BlogArticleFormValue): boolean {
    const control = this.form.get(controlName);
    const isInvalid = control?.invalid && (control.touched || control.dirty);

    return Boolean(isInvalid);
  }

  protected getControlError(controlName: keyof BlogArticleFormValue): string | null {
    const control = this.form.get(controlName);
    const errors: Record<string, unknown> | null = control?.errors ?? null;

    if (!errors) {
      return null;
    }

    const errorTextArray: string[] = [];

    Object.entries(errors).forEach(([errorKey, errorValue]) => {
      errorTextArray.push(this.getErrorStr(controlName, errorKey, errorValue));
    });

    return errorTextArray.join('\n');
  }

  private editDataEffect(): void {
    effect(() => {
      const articleToEdit = this.articleToEdit();

      if (articleToEdit) {
        this.form.patchValue({
          title: articleToEdit.title,
          content: articleToEdit.content,
        });
      } else {
        this.form.reset();
      }
    });
  }

  private getErrorStr(
    controlName: keyof BlogArticleFormValue,
    errorCode: string,
    errorData: unknown
  ): string {
    switch (errorCode) {
      case 'required':
        return controlName === 'title'
          ? 'Заголовок обязателен'
          : 'Текст статьи обязателен';

      case 'minlength': {
        const { requiredLength, actualLength } = errorData as MinLengthValidationInfo;
        return `Нужно еще ${requiredLength - actualLength} символов`;
      }

      default:
        return 'Ошибка при заполнении поля';
    }
  }
}