import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppointmentRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_image: string;
  schedule_id: string;
  schedule_date: string;
  schedule_from_time: string;
  schedule_to_time: string;
  schedule_from_time_formatted: string;
  schedule_to_time_formatted: string;
  status: string;
  ago: string;
}

export interface AppointmentResponse {
  message: string;
  data: {
    current_page: number;
    data: AppointmentRequest[];
    total: number;
  };
}

export interface NewAppointmentsResponse {
  message: string;
  data: AppointmentRequest[];
}

export interface StatusOverviewResponse {
  total_students: number;
  upcoming_appointments: number;
  new_requests: number;
  ratings: string;
}

export interface RequestsStatusOverviewResponse {
  message: string;
  data: {
    total_requests: number;
    accepted_requests: number;
    declined_requests: number;
    pending_requests: number;
  };
}

export interface UpcomingAppointment {
  id: string;
  user_id: string;
  user_name: string;
  user_image: string;
  schedule_id: string;
  schedule_date: string;
  schedule_from_time: string;
  schedule_to_time: string;
  schedule_from_time_formatted: string;
  schedule_to_time_formatted: string;
  status: string;
  ago: string;
}

export interface UpcomingAppointmentsResponse {
  message: string;
  data: {
    current_page: number;
    data: UpcomingAppointment[];
    total: number;
  };
}

export interface RecentActivity {
  id: number;
  description: string;
  created_at: string;
}

export interface RecentActivitiesResponse {
  message: string;
  data: RecentActivity[];
}

@Injectable({
  providedIn: 'root',
})
export class Appointments {
  private http = inject(HttpClient);

  getAppointmentRequests(
    status: string,
    page: number = 1,
    perPage: number
  ): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(
      `/appointment-requests?status=${status}&page=${page}&per_page=${perPage}`
    );
  }

  getNewAppointments(): Observable<NewAppointmentsResponse> {
    return this.http.get<NewAppointmentsResponse>('/expert-dashboard/new-appointments');
  }

  getUpcomingAppointments(): Observable<UpcomingAppointmentsResponse> {
    return this.http.get<UpcomingAppointmentsResponse>('/expert-dashboard/upcoming-appointments');
  }

  getStatusOverview(): Observable<StatusOverviewResponse> {
    return this.http.get<StatusOverviewResponse>('/expert-dashboard/status-overview');
  }

  getRequestsStatusOverview(): Observable<RequestsStatusOverviewResponse> {
    return this.http.get<RequestsStatusOverviewResponse>('/appointment-requests/status-overview');
  }

  updateAppointmentStatus(requestId: string, status: 'accepted' | 'declined'): Observable<any> {
    return this.http.post(`/appointment-requests/${requestId}/update-status`, {
      status,
      _method: 'PUT',
    });
  }

  getRecentActivities(): Observable<RecentActivitiesResponse> {
    return this.http.get<RecentActivitiesResponse>('/expert-dashboard/recent-activity');
  }
}
