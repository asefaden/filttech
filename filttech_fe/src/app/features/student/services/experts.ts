import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expert {
  id: string;
  name: string;
  profession: string;
  rating: string;
  profile_image: string;
  accepted_appointments_count: string;
  skills: string[];
}

interface ExpertsApiResponse {
  message: string;
  data: Expert[];
}

interface ExpertsQueryParams {
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExpertsService {
  constructor(private http: HttpClient) {}

  getExperts(params?: ExpertsQueryParams): Observable<ExpertsApiResponse> {
    let httpParams = new HttpParams();

    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<ExpertsApiResponse>('/experts', { params: httpParams });
  }

  getExpertById(id: string): Observable<{ message: string; data: Expert }> {
    return this.http.get<{ message: string; data: Expert }>(`/experts/${id}`);
  }

  getExpertScheduleCalendar(expertId: string, fromDate: string, toDate: string): Observable<any> {
    return this.http.get<any>(
      `/experts/${expertId}/schedules?from_date=${fromDate}&to_date=${toDate}`
    );
  }

  getExpertScheduleByDate(expertId: string, date: string): Observable<any> {
    return this.http.get<any>(`/available-time?date=${date}&expert_id=${expertId}`);
  }

  requestAppointment(scheduleId: string): Observable<any> {
    return this.http.post<any>(`/send-appointment-request`, { schedule_id: scheduleId });
  }

  getUserExpertInteraction(expertId: string): Observable<any> {
    return this.http.get<any>(`/experts/${expertId}/my-rating`);
  }

  rateExpert(expertId: string, rating: number): Observable<any> {
    return this.http.post<any>(`/user-expert-intraction`, { expert_id: expertId, rating });
  }
}
