import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BlogItemResponse {
  message: string;
  data: BlogItem[];
  pagination: BlogItemPagination;
}

export interface BlogItem {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  is_featured: boolean;
}

export interface BlogItemPagination {
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

@Injectable({
  providedIn: 'root',
})
export class Blog {
  private http = inject(HttpClient);

  getBlogs(page: number = 1, perPage: number = 10, search?: string): Observable<BlogItemResponse> {
    let params = new HttpParams().set('page', page.toString()).set('per_page', perPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<BlogItemResponse>('/posts', { params });
  }

  getBlogById(blogId: string): Observable<{ message: string; data: BlogItem }> {
    return this.http.get<{ message: string; data: BlogItem }>(`/posts/${blogId}`);
  }
}
