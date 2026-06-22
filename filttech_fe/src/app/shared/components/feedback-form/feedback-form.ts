import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StarRatingInput } from '../star-rating-input/star-rating-input';

interface FeedbackRequest {
  message: string;
  rating: number;
}

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [FormsModule, StarRatingInput],
  templateUrl: './feedback-form.html',
})
export class FeedbackForm {
  private http = inject(HttpClient);

  message = signal('');
  rating = signal(0);
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal('');

  submitFeedback() {
    if (!this.message() || this.rating() === 0) {
      this.submitError.set('Please provide both a rating and a message.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');
    this.submitSuccess.set(false);

    const feedback: FeedbackRequest = {
      message: this.message(),
      rating: this.rating(),
    };

    this.http.post('/feed-backs', feedback).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.message.set('');
        this.rating.set(0);

        // Clear success message after 3 seconds
        setTimeout(() => this.submitSuccess.set(false), 3000);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.submitError.set(
          error.error?.message || 'Failed to submit feedback. Please try again.'
        );
      },
    });
  }
}
