import { Component, signal, inject, OnInit } from '@angular/core';
import { StarRating } from 'src/app/shared/components/star-rating/star-rating';
import { UserPagination } from 'src/app/shared/components/user-pagination/user-pagination';
import { Rating, Review } from '../services/rating';

interface RatingBreakdown {
  stars: number;
  percentage: number;
}

@Component({
  selector: 'app-expert-rating',
  imports: [StarRating, UserPagination],
  templateUrl: './expert-rating.html',
  styleUrl: './expert-rating.css',
})
export class ExpertRating implements OnInit {
  private ratingService = inject(Rating);

  // Overall rating data
  overallRating = signal(0);
  totalReviews = signal(0);
  loading = signal(false);

  // Rating breakdown (5 star to 1 star)
  ratingBreakdown = signal<RatingBreakdown[]>([]);

  // Reviews data
  reviews = signal<Review[]>([]);

  // Pagination
  currentPage = signal(1);
  perPage = 10;

  ngOnInit() {
    this.loadRatings();
  }

  loadRatings() {
    this.loading.set(true);
    const page = this.currentPage();

    this.ratingService.getExpertRating(page).subscribe({
      next: (response) => {
        // Set overall rating
        this.overallRating.set(parseFloat(response.rating) || 0);
        this.totalReviews.set(response.users_who_rated.total);

        // Convert rating percentages to breakdown array
        const breakdown: RatingBreakdown[] = [];
        for (let i = 5; i >= 1; i--) {
          breakdown.push({
            stars: i,
            percentage: response.rating_percentage_by_number[i.toString()] || 0,
          });
        }
        this.ratingBreakdown.set(breakdown);

        // Set reviews
        this.reviews.set(response.users_who_rated.data);
        this.currentPage.set(response.users_who_rated.current_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading ratings:', error);
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadRatings();
  }

  getDefaultAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=3b82f6&color=fff`;
  }
}
