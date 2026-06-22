import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Feedback {
  id: string;
  user_id: string;
  user_name: string;
  user_image: string;
  message: string;
  rating: number;
  is_featured: boolean;
}

export interface FeedbackResponse {
  message: string;
  data: Feedback[];
}

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private http = inject(HttpClient);

  getFeedbacks(): Observable<FeedbackResponse> {
    return this.http.get<FeedbackResponse>('/feed-backs');
  }
}
