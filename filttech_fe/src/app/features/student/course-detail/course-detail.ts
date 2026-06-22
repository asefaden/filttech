import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommentsTab } from './components/comments-tab/comments-tab';
import { AboutTab } from './components/about-tab/about-tab';
import { StarRatingInput } from '../../../shared/components/star-rating-input/star-rating-input';
import { StarRating } from '../../../shared/components/star-rating/star-rating';

import {
  coursesService,
  CourseDetail as CourseDetailType,
  CourseSection,
} from '../services/courses';
import { Location, NgClass } from '@angular/common';

import { Auth } from '@core/services/auth';

@Component({
  selector: 'app-course-detail',
  imports: [CommentsTab, AboutTab, StarRatingInput, StarRating, NgClass],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css',
})
export class CourseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private coursesService = inject(coursesService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(Auth);
  location = inject(Location);

  activeTab = signal<'about' | 'comment'>('about');
  course = signal<CourseDetailType | null>(null);
  currentSectionIndex = signal(0);
  loading = signal(true);
  error = signal<string | null>(null);
  userRating = signal<number>(0);
  isSubmittingRating = signal(false);
  userCurrentRating = signal<number>(0);
  isLoadingUserRating = signal(false);

  profileImage = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return '../../../assets/images/Image-60.svg';

    const profilePhotoUrl = profile['profile_photo_url'];
    const profileImage = profile['profile_image'];

    if (profileImage && typeof profileImage === 'string') {
      return profileImage;
    }
    // Use profile_photo_url if available, otherwise profile_image, otherwise default
    if (profilePhotoUrl && typeof profilePhotoUrl === 'string') {
      return profilePhotoUrl;
    }

    return '../../../assets/images/Image-60.svg';
  });

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
      this.loadUserCourseInteraction(courseId);
    }
  }

  loadCourse(courseId: string) {
    this.loading.set(true);
    this.coursesService.getCourseById(courseId).subscribe({
      next: (response) => {
        this.course.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load course details');
        this.loading.set(false);
        console.error('Error loading course:', err);
      },
    });
  }

  getCurrentSection(): CourseSection | null {
    const course = this.course();
    if (!course || !course.sections.length) return null;
    return course.sections[this.currentSectionIndex()];
  }

  nextSection() {
    const course = this.course();
    if (!course) return;
    const nextIndex = this.currentSectionIndex() + 1;
    if (nextIndex < course.sections.length) {
      this.currentSectionIndex.set(nextIndex);
      this.activeTab.set('about');
    }
  }

  previousSection() {
    const prevIndex = this.currentSectionIndex() - 1;
    if (prevIndex >= 0) {
      this.currentSectionIndex.set(prevIndex);
      this.activeTab.set('about');
    }
  }

  goToSection(index: number) {
    this.currentSectionIndex.set(index);
    this.activeTab.set('about');
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  parseFloat = parseFloat;

  goBack(): void {
    this.location.back();
  }

  onRatingChange(rating: number): void {
    this.userRating.set(rating);
  }

  loadUserCourseInteraction(courseId: string): void {
    this.isLoadingUserRating.set(true);
    this.coursesService.getUserCourseInteraction(courseId).subscribe({
      next: (response) => {
        this.userCurrentRating.set(response.rating);
        this.isLoadingUserRating.set(false);
      },
      error: (err) => {
        this.isLoadingUserRating.set(false);
        console.error('Error loading user course interaction:', err);
      },
    });
  }

  submitRating(): void {
    const courseId = this.course()?.id;
    const rating = this.userRating();

    if (!courseId || rating === 0) {
      return;
    }

    this.isSubmittingRating.set(true);
    this.coursesService.ratingCourse(courseId, rating).subscribe({
      next: (response) => {
        this.isSubmittingRating.set(false);
        // Update both the course rating and user's current rating
        const currentCourse = this.course();
        if (currentCourse) {
          this.course.set({
            ...currentCourse,
            rating: response.data.course_rating.toString(),
          });
        }
        this.userCurrentRating.set(response.data.rating);
        this.userRating.set(0); // Reset the input rating
      },
      error: (err) => {
        this.isSubmittingRating.set(false);
        console.error('Error submitting rating:', err);
      },
    });
  }
}
