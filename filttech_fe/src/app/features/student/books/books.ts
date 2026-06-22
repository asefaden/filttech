import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Books as BooksService } from '../services/books';
import { UserPagination } from '../../../shared/components/user-pagination/user-pagination';

interface Book {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  book_file_size: string;
  book_file: string;
}

interface Pagination {
  total: number;
}

@Component({
  selector: 'app-books',
  imports: [CommonModule, FormsModule, UserPagination],
  templateUrl: './books.html',
  styleUrl: './books.css',
})
export class Books implements OnInit {
  books = signal<Book[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  pagination = signal<Pagination>({ total: 0 });
  currentPage = signal(1);
  pageSize = 10;

  constructor(private booksService: BooksService) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.loading.set(true);
    const params = {
      page: this.currentPage(),
      limit: this.pageSize,
      ...(this.searchQuery() && { search: this.searchQuery() }),
    };

    this.booksService.getBooks(params).subscribe({
      next: (response) => {
        this.books.set(response.data);
        this.pagination.set(response.pagination);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadBooks();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadBooks();
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  downloadBook(book: Book) {
    // Use the book_file URL directly from backend
    window.open(book.book_file, '_blank');
  }
}
