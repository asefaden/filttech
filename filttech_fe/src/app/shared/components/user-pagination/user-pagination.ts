import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-pagination.html',
  styleUrls: ['./user-pagination.css'],
})
export class UserPagination {
  // Inputs
  currentPage = input.required<number>();
  total = input.required<number>();
  perPage = input.required<number>();

  // Outputs
  pageChange = output<number>();

  // Computed total pages
  totalPages = computed(() => {
    const total = this.total();
    const perPage = this.perPage();
    return perPage > 0 ? Math.ceil(total / perPage) : 1;
  });

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, -1, total);
      } else if (current >= total - 2) {
        pages.push(1, -1, total - 2, total - 1, total);
      } else {
        pages.push(1, -1, current, -1, total);
      }
    }

    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }
}
