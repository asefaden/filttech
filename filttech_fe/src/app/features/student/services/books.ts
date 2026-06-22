import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Book {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  book_file_size: string; // size in human readable format
  book_file: string; // url for the book
}

interface Pagination {
  total: number; // this is the total number of books
}

interface BooksApiResponse {
  message: string;
  data: Book[];
  pagination: Pagination;
}

interface BooksQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Books {
  constructor(private http: HttpClient) {}

  getBooks(params?: BooksQueryParams): Observable<BooksApiResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.category) httpParams = httpParams.set('category', params.category);
    }

    return this.http.get<BooksApiResponse>(`/books`, {
      params: httpParams,
    });
  }
}
