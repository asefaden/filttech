import { Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.html',
  host: { class: 'inline-block' },
})
export class StarRating {
  // Signal inputs (new Angular way)
  rating = input.required<number>();
  max = input<number>(5);
  size = input<'sm' | 'md' | 'lg'>('md');
  showNumber = input<boolean>(true);

  // Computed helpers
  percentage = computed(() => (this.rating() / this.max()) * 100);

  starSizeClass = computed(() => {
    const map = {
      sm: 'text-base', // ~16px
      md: 'text-2xl', // ~24px
      lg: 'text-4xl', // ~32px or larger
    };
    return map[this.size()];
  });

  // Generate array [0, 1, 2, ..., max-1] — cached via computed!
  stars = computed(() => Array.from({ length: this.max() }, (_, i) => i));
}
