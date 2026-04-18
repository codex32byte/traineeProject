import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogArticle } from '../../models/blog-article.interface';

@Component({
  selector: 'app-article-form',
  imports: [FormsModule],
  templateUrl: './article-form.html',
  styleUrl: './article-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleForm implements OnChanges {
  @Input() articleToEdit: BlogArticle | null = null;
  @Output() closeForm = new EventEmitter<void>();
  @Output() submitArticle = new EventEmitter<{ title: string; content: string; id?: string }>();

  title = '';
  content = '';
  isEditMode = false;
  titleError = '';
  contentError = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['articleToEdit'] && this.articleToEdit) {
      this.isEditMode = true;
      this.title = this.articleToEdit.title;
      this.content = this.articleToEdit.content;
    } else {
      this.isEditMode = false;
      this.title = '';
      this.content = '';
    }
    this.clearErrors();
  }

  validateForm(): boolean {
    this.clearErrors();
    let isValid = true;

    const trimmedTitle = this.title.trim();
    const trimmedContent = this.content.trim();

    if (!trimmedTitle) {
      this.titleError = 'Заголовок обязателен';
      isValid = false;
    } else if (trimmedTitle.length < 25) {
      this.titleError = `Заголовок должен содержать минимум 25 символов (сейчас ${trimmedTitle.length})`;
      isValid = false;
    }

    if (!trimmedContent) {
      this.contentError = 'Текст статьи обязателен';
      isValid = false;
    }

    return isValid;
  }

  clearErrors(): void {
    this.titleError = '';
    this.contentError = '';
  }

  // submitting form
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const trimmedTitle = this.title.trim();
    const trimmedContent = this.content.trim();

    this.submitArticle.emit({
      title: trimmedTitle,
      content: trimmedContent,
      id: this.isEditMode && this.articleToEdit ? this.articleToEdit.id : undefined
    });

    this.title = '';
    this.content = '';
    this.isEditMode = false;
    this.clearErrors();
  }

  onClose(): void {
    this.closeForm.emit();
  }
}