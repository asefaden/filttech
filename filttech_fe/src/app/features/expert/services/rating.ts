import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  user_id: string;
  user_name: string;
  rating: number;
  profile_image: string;
  ago: string;
}

export interface RatingResponse {
  message: string;
  rating: string;
  rating_percentage_by_number: {
    [key: string]: number;
  };
  users_who_rated: {
    current_page: number;
    data: Review[];
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class Rating {
  private http = inject(HttpClient);

  getExpertRating(page: number = 1): Observable<RatingResponse> {
    return this.http.get<RatingResponse>(`/expert-dashboard/rating?page=${page}`);
  }
}
