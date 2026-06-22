import { NgClass } from '@angular/common';
import { Component, inject, model, signal, effect } from '@angular/core';
import { UserPagination } from '../../../shared/components/user-pagination';
import { DropdownSelectComponent } from '../../../landing/components/dropdown-select/dropdown-select';
import { CourseSlider } from '@shared/components/course-slider/course-slider';
import { Courseitem, coursesService } from '../services/courses';
import { CourseCard } from '@shared/components/course-card/course-card';
import { Category as CategoryService, Category as CategoryType } from '../services/category';

@Component({
  selector: 'app-courses',
  imports: [NgClass, UserPagination, DropdownSelectComponent, CourseSlider, CourseCard],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  private coursesService = inject(coursesService);
  private categoryService = inject(CategoryService);

  categories = signal<CategoryType[]>([]);
  activeCategory = signal<string | null>(null);
  popularCourses = signal<Courseitem[]>([]);
  courses = signal<Courseitem[]>([]);

  loading = signal(true);
  popularLoading = signal(true);
  error = signal<string | null>(null);
  popularError = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  total = signal(0);
  perPage = signal(12);

  // Filter states
  showFavorites = signal(false);
  selectedSort = model<{ label: string; value: string } | null>(null);
  searchQuery = signal('');

  selectTab(categoryId: string | null) {
    this.activeCategory.set(categoryId);
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value.trim() === '' && '' === this.searchQuery()) {
      return;
    }
    this.searchQuery.set(input.value.trim());
  }

  sortOptions = signal<{ label: string; value: string }[]>([
    { label: 'Highest Rating', value: 'rating' },
    { label: 'Newest', value: 'latest' },
  ]);

  toggleFavorites() {
    this.showFavorites.set(!this.showFavorites());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);

    // Scroll to the all courses section
    const element = document.getElementById('all-courses-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  constructor() {
    this.loadCategories();
    this.loadPopularCourses();

    // Watch for filter changes (not page) and reset to page 1
    effect(() => {
      this.selectedSort();
      this.showFavorites();
      this.activeCategory();
      this.searchQuery();

      // Reset to page 1 when filters change
      this.currentPage.set(1);
    });

    // Watch for page changes and reload courses
    effect(() => {
      this.currentPage();
      this.loadCourses();
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });
  }

  loadPopularCourses() {
    this.popularLoading.set(true);
    this.popularError.set(null);
    this.coursesService.getPopularCourses().subscribe({
      next: (response) => {
        this.popularCourses.set(response.data);
        this.popularLoading.set(false);
      },
      error: (err) => {
        this.popularError.set('Failed to load popular courses');
        this.popularLoading.set(false);
      },
    });
  }

  loadCourses() {
    this.loading.set(true);
    this.error.set(null);

    const params: {
      category_id?: string;
      search?: string;
      favorite?: boolean;
      rating?: boolean;
      latest?: boolean;
      per_page?: number;
      page?: number;
    } = {
      per_page: this.perPage(),
      page: this.currentPage(),
    };

    if (this.activeCategory()) {
      params.category_id = this.activeCategory()!;
    }

    if (this.searchQuery().trim()) {
      params.search = this.searchQuery().trim();
    }

    if (this.showFavorites()) {
      params.favorite = true;
    }

    const sortValue = this.selectedSort()?.value;
    if (sortValue === 'rating') {
      params.rating = true;
    } else if (sortValue === 'latest') {
      params.latest = true;
    }

    this.coursesService.getCourses(params).subscribe({
      next: (response) => {
        this.courses.set(response.data);

        // Update total count from API response
        if (response.pagination?.total !== undefined) {
          this.total.set(response.pagination.total);
        }

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
