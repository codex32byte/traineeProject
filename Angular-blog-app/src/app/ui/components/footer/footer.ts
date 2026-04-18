import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import emailjs from '@emailjs/browser';
import DOMPurify from 'dompurify';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class Footer {
  currentYear = new Date().getFullYear();
  email = '';
  message = '';
  isSubmitting = false;
  submitStatus: 'idle' | 'success' | 'error' = 'idle';
  errorMessage: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {

    /*Tested and it works , i just won't share the public key (*_^) */
    // Init EmailJS
    emailjs.init(environment.emailjs.publicKey);
  }

  // Submit form
  async onSubmit(form: NgForm): Promise<void> {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitStatus = 'idle';
    this.errorMessage = null;

    // Sanitize inputs
    const sanitizedData = {
      user_email: DOMPurify.sanitize(this.email.trim()),
      message: DOMPurify.sanitize(this.message.trim())
    };

    try {

      const response = await emailjs.send(
        environment.emailjs.serviceID,
        environment.emailjs.templateID,
        sanitizedData
      );

      console.log('SUCCESS!', response.status, response.text);
      this.submitStatus = 'success';
      form.resetForm();


      setTimeout(() => this.submitStatus = 'idle', 5000);

    } catch (err: any) {
      // Handle API errors
      this.submitStatus = 'error';
      if (err?.text) {
        this.errorMessage = err.text;
      } else {
        this.errorMessage = 'Failed to send message. Please try again later.';
      }
    } finally {

      this.isSubmitting = false;

      // trigger Angular change 
      this.cdr.detectChanges();
    }
  }

  // Get error message form
  getErrorMessage(field: NgModel, fieldName: string): string {
    if (!field.touched || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${fieldName} is required`;
    }

    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }

    return 'Invalid field';
  }
}