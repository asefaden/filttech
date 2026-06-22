import { Component, inject, signal } from '@angular/core';
import { Category as CategoryService, Category as CategoryType } from '../../service/category';
import { RouterLink } from '@angular/router';

@Component({
  selector: '[app-category]',
  imports: [RouterLink],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category {
  private categoryService = inject(CategoryService);

  categories = signal<CategoryType[]>([]);
  loading = signal(true);
  defaultImage = '../../assets/images/Coding Icons.svg';

  constructor() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading.set(false);
      },
    });
  }

  getCategoryImage(category: CategoryType): string {
    return category.thumbnail || this.defaultImage;
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImage;
  }
}
