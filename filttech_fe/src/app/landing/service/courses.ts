import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PopularCoursesResponse {
  message: string;
  data: Course[];
}

export interface Course {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: string; // or number if backend changes
  review: number | null;
  thumbnail: string;
  section_count: number;
  is_favorite: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Courses {
  http = inject(HttpClient);
  getPopularCourses(page: number = 1): Observable<PopularCoursesResponse> {
    return this.http.get<PopularCoursesResponse>('/popular-courses');
  }
}
