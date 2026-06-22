import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommentsResponse {
  message: string;
  data: CommentsData;
}

export interface CommentsData {
  current_page: number;
  data: CommentDetail[];
  total: number;
}

export interface CommentDetail {
  id: string;
  user_id: string;
  user_name: string;
  user_profile_image: string;
  comment: string;
}

export interface AddCommentRequest {
  section_id: string;
  comment: string;
}

export interface AddCommentResponse {
  message: string;
  data: CommentDetail;
}

@Injectable({
  providedIn: 'root',
})
export class Section {
  private http = inject(HttpClient);

  getSectionComments(sectionId: string, page: number = 1): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(`/section-comments/${sectionId}?page=${page}`);
  }

  addSectionComment(sectionId: string, comment: string): Observable<AddCommentResponse> {
    return this.http.post<AddCommentResponse>('/user-section-intraction', {
      section_id: sectionId,
      comment: comment,
    });
  }
}
