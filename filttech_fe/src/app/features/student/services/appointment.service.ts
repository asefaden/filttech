import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Schedule {
  id: string;
  date: string;
  from_time: string;
  from_time_formatted: string;
  to_time: string;
  to_time_formatted: string;
  duration: number;
}

export interface ExpertDetails {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  profession: string | null;
  rating: string;
  profile_image: string;
  skills: string[] | null;
  schedule: Schedule;
}

export interface AcceptedAppointmentResponse {
  message: string;
  data: ExpertDetails;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);

  getAcceptedAppointment(appointmentId: string): Observable<AcceptedAppointmentResponse> {
    return this.http.get<AcceptedAppointmentResponse>(`/experts/appointment/${appointmentId}`);
  }
}
