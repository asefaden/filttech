import { Component, signal, inject, OnInit, computed, effect } from '@angular/core';
import { UserPagination } from '../../../shared/components/user-pagination';
import { Blog, BlogItem } from '../services/blog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blogs',
  imports: [UserPagination, CommonModule, FormsModule, RouterLink],
  templateUrl: './blogs.html',
  styleUrl: './blogs.css',
})
export class Blogs implements OnInit {
  private blogService = inject(Blog);
  private searchTimeout: any;

  blogs = signal<BlogItem[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  total = signal(0);
  perPage = signal(9);
  searchQuery = signal('');

  // Computed properties for featured and regular blogs
  featuredBlog = computed(() => {
    const allBlogs = this.blogs();
    if (this.currentPage() === 1 && allBlogs.length > 0 && !this.searchQuery()) {
      return allBlogs.find((blog) => blog.is_featured) || allBlogs[0];
    }
    return null;
  });

  regularBlogs = computed(() => {
    const allBlogs = this.blogs();
    const featured = this.featuredBlog();

    if (this.currentPage() === 1 && featured && !this.searchQuery()) {
      // On first page, exclude the featured blog from regular blogs
      return allBlogs.filter((blog) => blog.id !== featured.id);
    }
    // On other pages or when searching, show all blogs (no featured blog)
    return allBlogs;
  });

  constructor() {
    // Watch for search query changes and trigger search with debounce
    effect(() => {
      const query = this.searchQuery();

      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Set new timeout for debounced search
      this.searchTimeout = setTimeout(() => {
        this.currentPage.set(1); // Reset to first page on search
        this.loadBlogs(1);
      }, 300); // 300ms debounce
    });
  }

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs(page: number = 1) {
    this.loading.set(true);
    this.currentPage.set(page);

    const searchQuery = this.searchQuery() || undefined;
    this.blogService.getBlogs(page, this.perPage(), searchQuery).subscribe({
      next: (response) => {
        this.blogs.set(response.data);
        this.total.set(response.pagination.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading blogs:', err);
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number) {
    this.loadBlogs(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 20, behavior: 'smooth' });
  }

  getPlainTextExcerpt(htmlContent: string, maxLength: number): string {
    // Remove HTML tags and get plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    // Truncate to maxLength and add ellipsis if needed
    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength).trim() + '...';
  }
}
