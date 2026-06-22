import { Component, inject, signal } from '@angular/core';
import { Courses, Course } from '../../service/courses';
import { CourseSlider } from '@shared/components/course-slider/course-slider';
import { CourseCard } from '@shared/components/course-card/course-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: '[app-popular-courses]',
  imports: [CourseSlider, CourseCard, RouterLink],
  templateUrl: './popular-courses.html',
  styleUrl: './popular-courses.css',
})
export class PopularCourses {
  private coursesService = inject(Courses);

  courses = signal<Course[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.getPopularCourses();
  }

  getPopularCourses() {
    this.loading.set(true);
    this.coursesService.getPopularCourses().subscribe({
      next: (response) => {
        this.courses.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load courses');
        this.loading.set(false);
        console.error('Error loading courses:', err);
      },
    });
  }
}
