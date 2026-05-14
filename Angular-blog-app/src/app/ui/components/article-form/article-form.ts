import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Output,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { CATEGORIES_SERVICE } from '../../../services/categories/categories-service.token';
import { ArticleCategory } from '../../models/category.interface';
import { BlogArticle, BlogArticleFormValue, MinLengthValidationInfo, } from '../../models/blog-article.interface';

@Component({
  selector: 'app-article-form',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  templateUrl: './article-form.html',
  styleUrl: './article-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleForm {
  readonly articleToEdit = input<BlogArticle | null>(null);

  @Output() submitArticle = new EventEmitter<BlogArticleFormValue>();
  @Output() closeForm = new EventEmitter<void>();

  private readonly categoriesService = inject(CATEGORIES_SERVICE);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedImageName = signal<string | null>(null);
  protected readonly categories = signal<ArticleCategory[]>([]);
  protected readonly categorySearchValue = signal('');

  protected readonly filteredCategories = computed<ArticleCategory[]>(() => {
    const searchValue = this.categorySearchValue().trim().toLowerCase();

    if (!searchValue) {
      return this.categories();
    }

    return this.categories().filter(category =>
      category.name.toLowerCase().includes(searchValue)
    );
  });

  protected readonly isNewCategoryName = computed<boolean>(() => {
    const searchValue = this.categorySearchValue().trim().toLowerCase();

    if (!searchValue) {
      return false;
    }

    return !this.categories().some(category =>
      category.name.toLowerCase() === searchValue
    );
  });

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(25)],
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    imageFile: new FormControl<File | null>(null),
    categoryName: new FormControl('', {
      nonNullable: true,
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

  protected saveButtonIcon = computed<string>(() => {
    return this.isEditMode() ? 'save' : 'add';
  });

  constructor() {
    this.loadCategories();
    this.editDataEffect();
  }

  protected onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.form.controls.imageFile.setValue(file);
    this.selectedImageName.set(file?.name ?? null);
  }

  protected onCategoryInput(): void {
    this.categorySearchValue.set(this.form.controls.categoryName.value);
  }

  protected onCategorySelected(categoryName: string): void {
    this.form.controls.categoryName.setValue(categoryName);
    this.categorySearchValue.set(categoryName);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const categoryName = this.form.controls.categoryName.value.trim();

    this.submitArticle.emit({
      title: this.form.controls.title.value.trim(),
      content: this.form.controls.content.value.trim(),
      imageFile: this.form.controls.imageFile.value,
      categoryName: categoryName || null,
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

  private loadCategories(): void {
    this.categoriesService
      .getCategories()
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: categories => {
          this.categories.set(categories);
          this.patchCategoryName(this.articleToEdit());
        },
        error: error => {
          console.error('Failed to load categories:', error);
          this.categories.set([]);
        },
      });
  }

  private editDataEffect(): void {
    effect(() => {
      const articleToEdit = this.articleToEdit();

      if (articleToEdit) {
        this.form.patchValue({
          title: articleToEdit.title,
          content: articleToEdit.content,
          imageFile: null,
        });
        this.patchCategoryName(articleToEdit);
        this.selectedImageName.set(null);
      } else {
        this.form.reset();
        this.categorySearchValue.set('');
        this.selectedImageName.set(null);
      }
    });
  }

  private patchCategoryName(articleToEdit: BlogArticle | null): void {
    if (!articleToEdit?.categoryId) {
      this.form.controls.categoryName.setValue('');
      this.categorySearchValue.set('');
      return;
    }

    const category = this.categories().find(category =>
      category.id === articleToEdit.categoryId
    );

    const categoryName = category?.name ?? '';

    this.form.controls.categoryName.setValue(categoryName);
    this.categorySearchValue.set(categoryName);
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