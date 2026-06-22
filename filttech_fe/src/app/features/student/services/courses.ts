import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PopularCoursesResponse {
  message: string;
  data: Courseitem[];
  pagination: {
    total: number;
  };
}

export interface Courseitem {
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
export interface CourseDetailResponse {
  message: string;
  data: CourseDetail;
}

export interface CourseDetail {
  id: string;
  name: string;
  category: string;
  rating_count: number;
  description: string;
  rating: string;
  thumbnail: string | null;
  is_favorite: boolean;
  sections: CourseSection[];
}

export interface CourseSection {
  id: string;
  name: string;
  introduction: string;
  description: string;
  example: string;
  example_explanation: string;
  thumbnail: string | null;
  video: string | null;
}

export interface RatingResponse {
  status: string;
  message: string;
  data: {
    course_id: string;
    rating: number;
    course_rating: number;
  };
}

export interface UserCourseInteractionResponse {
  rating: number;
  is_favorite: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class coursesService {
  http = inject(HttpClient);
  getPopularCourses(page: number = 1): Observable<PopularCoursesResponse> {
    return this.http.get<PopularCoursesResponse>(`/user/popular-courses`);
  }

  getCourses(params?: {
    category_id?: string;
    search?: string;
    favorite?: boolean;
    rating?: boolean;
    latest?: boolean;
    per_page?: number;
    page?: number;
  }): Observable<PopularCoursesResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.category_id) {
        httpParams = httpParams.set('category_id', params.category_id);
      }
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.favorite !== undefined) {
        httpParams = httpParams.set('favorite', params.favorite.toString());
      }
      if (params.rating !== undefined) {
        httpParams = httpParams.set('rating', params.rating.toString());
      }
      if (params.latest !== undefined) {
        httpParams = httpParams.set('latest', params.latest.toString());
      }
      if (params.per_page) {
        httpParams = httpParams.set('per_page', params.per_page.toString());
      }
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
    }

    return this.http.get<PopularCoursesResponse>(`/courses`, { params: httpParams });
  }

  getCourseById(courseId: string): Observable<CourseDetailResponse> {
    return this.http.get<CourseDetailResponse>(`/courses/${courseId}`);
  }
  ratingCourse(courseId: string, rating: number): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(`/user-course-intraction/rate`, {
      course_id: courseId,
      rating: rating,
    });
  }
  toggleFavourite(courseId: string): Observable<any> {
    return this.http.post<any>(`/user-course-intraction/favorite`, {
      course_id: courseId,
    });
  }

  getUserCourseInteraction(courseId: string): Observable<UserCourseInteractionResponse> {
    return this.http.get<UserCourseInteractionResponse>(
      `/user-course-intraction/course/${courseId}`
    );
  }
}
