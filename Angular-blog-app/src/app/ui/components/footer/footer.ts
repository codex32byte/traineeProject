import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  imports: [FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear = new Date().getFullYear();

  email = '';
  message = '';


  onSubmit(): void {
    const trimmedEmail = this.email.trim();
    const trimmedMessage = this.message.trim();

    if (!trimmedEmail || !trimmedMessage) {
      return;
    }

    console.log({
      email: trimmedEmail,
      message: trimmedMessage
    });

    this.email = '';
    this.message = '';
  }
}