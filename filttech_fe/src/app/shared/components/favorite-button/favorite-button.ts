import { Component, computed, inject, input, model, signal } from '@angular/core';
import { coursesService } from '@app/features/student/services/courses';

@Component({
  selector: 'app-favorite-button',
  imports: [],
  templateUrl: './favorite-button.html',
  styleUrl: './favorite-button.css',
})
export class FavoriteButton {
  coursesService = inject(coursesService);
  // Two-way bindable signal – perfect for toggle!
  isFavorite = model<boolean>(false);
  courseId = input('');
  loading = signal(false);

  toggle() {
    this.isFavorite.update((prev) => !prev);
    // Automatically updates parent!
    this.togglefavorite();
  }

  togglefavorite() {
    this.coursesService.toggleFavourite(this.courseId()).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
