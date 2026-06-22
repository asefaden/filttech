import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PopularExpertsResponse {
  message: string;
  data: Expert[];
}

export interface Expert {
  id: string;
  name: string;
  rating: string; // backend returns string like "0"
  profile_image: string; // can be empty string
}

@Injectable({
  providedIn: 'root',
})
export class Expert {
  api = '/popular-experts';
  http = inject(HttpClient);

  getPopularExports(page: number = 1): Observable<PopularExpertsResponse> {
    return this.http.get<PopularExpertsResponse>(`${this.api}`);
  }
}
