import { Component, input, output, signal, computed, model } from '@angular/core';

@Component({
  selector: 'app-star-rating-input',
  standalone: true,
  templateUrl: './star-rating-input.html',
})
export class StarRatingInput {
  maxStars = input<number>(5);
  rating = model<number>(0);

  // new: size input
  size = input<'sm' | 'md' | 'lg'>('md');

  ratingChange = output<number>();

  hoverIndex = signal(0);

  // Generate array of star indices for iteration
  stars = computed(() => Array.from({ length: this.maxStars() }, (_, i) => i));

  // ⭐ size class based on input size
  starSizeClass = computed(() => {
    const map = {
      sm: 'w-4 h-4', // ~16px
      md: 'w-7 h-7', // default ~24px
      lg: 'w-10 h-10', // ~40px
    };
    return map[this.size()];
  });

  setRating(star: number) {
    this.rating.set(star);
    this.ratingChange.emit(star);
  }

  setHover(star: number) {
    this.hoverIndex.set(star);
  }

  clearHover() {
    this.hoverIndex.set(0);
  }
}
