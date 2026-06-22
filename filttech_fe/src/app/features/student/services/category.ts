import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
export interface CategoryResponse {
  data: Category[];
}

export interface Category {
  id: string;
  name: string;
  thumbnail: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Category {
  private http = inject(HttpClient);

  getCategories(page: number = 1): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`/categories`);
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`/categories`);
  }
}
