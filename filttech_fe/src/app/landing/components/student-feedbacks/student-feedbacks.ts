import { Component, inject, OnInit, signal } from '@angular/core';
import { FeedbackService, Feedback } from '../../service/feedback.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[app-student-feedbacks]',
  imports: [CommonModule],
  templateUrl: './student-feedbacks.html',
  styleUrl: './student-feedbacks.css',
})
export class StudentFeedbacks implements OnInit {
  private feedbackService = inject(FeedbackService);

  feedbacks = signal<Feedback[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  private loadFeedbacks(): void {
    this.feedbackService.getFeedbacks().subscribe({
      next: (response) => {
        this.feedbacks.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load feedbacks');
        this.isLoading.set(false);
        console.error('Error loading feedbacks:', err);
      },
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5)
      .fill(false)
      .map((_, i) => i < rating);
  }
}
