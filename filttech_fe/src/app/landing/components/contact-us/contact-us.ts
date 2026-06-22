import { Component, inject, DestroyRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { ContactService, ContactRequest } from '../../service/contact';

@Component({
  selector: '[app-contact-us]',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs {
  private contactService = inject(ContactService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  contactForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal('');

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');
    this.submitSuccess.set(false);

    const contactData: ContactRequest = this.contactForm.value;

    this.contactService
      .sendContactMessage(contactData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.submitSuccess.set(true);
          this.contactForm.reset();

          timer(5000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.submitSuccess.set(false));
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.submitError.set(error.error?.message || 'Failed to send message. Please try again.');

          timer(5000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.submitError.set(''));
        },
      });
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Invalid email address';
      if (field.errors['minLength']) return `${fieldName} is too short`;
    }
    return '';
  }
}
