import { Component, inject, input } from '@angular/core';
import { Course } from '../../../landing/service/courses';
import { StarRating } from '../star-rating/star-rating';
import { Router } from '@angular/router';
import { FavoriteButton } from '../favorite-button/favorite-button';

@Component({
  selector: 'app-course-card',
  imports: [StarRating, FavoriteButton],
  templateUrl: './course-card.html',
  styleUrl: './course-card.css',
})
export class CourseCard {
  course = input.required<Course>();
  cardwidth = input<number>(0);
  has_favorite = input(false);
  router = inject(Router);
  goToCourse(courseId: string) {
    this.router.navigate(['/s/courses', courseId]);
  }
  getRating = () => parseFloat(this.course().rating);
  backupImage = '../../../../assets/images/Rectangle 8772.svg';
}
