import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-article-form',
  imports: [FormsModule],
  templateUrl: './article-form.html',
  styleUrl: './article-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleForm {
  @Output() closeForm = new EventEmitter<void>();
  @Output() submitArticle = new EventEmitter<{ title: string; content: string }>();

  title = '';
  content = '';

  // submitting form
  onSubmit(): void {
    const trimmedTitle = this.title.trim();
    const trimmedContent = this.content.trim();

    if (!trimmedTitle || !trimmedContent) {
      return;
    }

    this.submitArticle.emit({
      title: trimmedTitle,
      content: trimmedContent
    });

    this.title = '';
    this.content = '';
  }

  onClose(): void {
    this.closeForm.emit();
  }
}