import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'empty';
  studentName?: string;
}

interface ScheduleResponse {
  date: string;
  slots: TimeSlot[];
}

interface CalendarDayData {
  date: string;
  availableCount: number;
  bookedCount: number;
  emptyCount: number;
}

interface CalendarResponse {
  days: CalendarDayData[];
}

interface CreateSlotRequest {
  date: string;
  from_time: string;
  to_time: string;
}

export interface TodaySession {
  id: string;
  student_name: string;
  student_email: string;
  student_image: string;
  date: string;
  from_time: string;
  to_time: string;
}

export interface TodaySessionsResponse {
  message: string;
  data: TodaySession[];
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(private http: HttpClient) {}

  /**
   * Get calendar data for a date range
   * @param fromDate - Start date in 'yyyy-MM-dd' format
   * @param toDate - End date in 'yyyy-MM-dd' format
   */
  getCalendarData(fromDate: string, toDate: string): Observable<CalendarResponse> {
    return this.http.get<CalendarResponse>(`/schedules?from_date=${fromDate}&to_date=${toDate}`);
  }

  /**
   * Get schedule details for a specific date
   * @param date - Date in 'yyyy-MM-dd' format
   */
  getScheduleForDate(date: string): Observable<ScheduleResponse> {
    return this.http.get<ScheduleResponse>(`/schedules-by-date?date=${date}`);
  }

  /**
   * Get today's sessions
   */
  getTodaySessions(): Observable<TodaySessionsResponse> {
    return this.http.get<TodaySessionsResponse>('/today-sessions');
  }

  /**
   * Create a new availability slot
   * @param slot - Slot data with date and time range
   */
  createSlot(slot: CreateSlotRequest): Observable<any> {
    return this.http.post('/schedules', slot);
  }

  /**
   * Delete a schedule slot
   * @param slotId - ID of the slot to delete
   */
  deleteSlot(slotId: string): Observable<any> {
    return this.http.delete(`/schedules/${slotId}`);
  }
}
