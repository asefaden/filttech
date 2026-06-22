import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { ExpertsService, Expert } from '../services/experts';
import { AlertService } from '../../../shared/alert/alert.service';
import { Auth } from '../../../core/services/auth';
import { StarRatingInput } from '../../../shared/components/star-rating-input/star-rating-input';
import { StarRating } from '../../../shared/components/star-rating/star-rating';

// --- Types ---

interface DayObj {
  date: Date;
  dayNum: string;
  status: 'available' | 'unavailable' | null;
  isCurrentMonth: boolean;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface ScheduleResponse {
  date: string;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-expert-detail',
  imports: [CommonModule, StarRatingInput, StarRating],
  templateUrl: './expert-detail.html',
  styleUrl: './expert-detail.css',
})
export class ExpertDetail implements OnInit {
  location = inject(Location);
  private route = inject(ActivatedRoute);
  private expertsService = inject(ExpertsService);
  private alertService = inject(AlertService);
  private authService = inject(Auth);

  // Static data
  weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // --- Signals for State ---
  expert = signal<Expert | null>(null);
  loading = signal(false);
  selectedSlotId = signal<string | null>(null);
  expertId = signal<string | null>(null);

  // Schedule data
  scheduleData = signal<TimeSlot[]>([]);
  isLoadingSchedule = signal(false);
  isRequestingAppointment = signal(false);

  // Rating data
  userRating = signal<number>(0);
  isSubmittingRating = signal(false);
  userCurrentRating = signal<number>(0);
  isLoadingUserRating = signal(false);

  // Calendar data for month view
  private calendarData = signal<Map<string, { available: number; unavailable: number }>>(new Map());

  currentMonth = signal(new Date());
  selectedDate = signal<Date | null>(null);

  profileImage = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return '../../../assets/images/Image-60.svg';

    const profilePhotoUrl = profile['profile_photo_url'];
    const profileImage = profile['profile_image'];

    if (profileImage && typeof profileImage === 'string') {
      return profileImage;
    }
    if (profilePhotoUrl && typeof profilePhotoUrl === 'string') {
      return profilePhotoUrl;
    }

    return '../../../assets/images/Image-60.svg';
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.expertId.set(id);
      this.loadExpert(id);
      this.loadCalendarData();
      this.loadUserExpertInteraction(id);

      // Set today as default selected date
      const today = new Date();
      this.selectedDate.set(today);
      this.loadScheduleForDate(today);
    }
  }

  loadExpert(id: string) {
    this.loading.set(true);
    this.expertsService.getExpertById(id).subscribe({
      next: (response) => {
        this.expert.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading expert:', error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Load calendar data for the current month from the backend
   * Uses date range API and fills missing days with defaults
   */
  private loadCalendarData(): void {
    const currDate = this.currentMonth();
    const monthStart = startOfMonth(currDate);
    const monthEnd = endOfMonth(currDate);

    const fromDate = format(monthStart, 'yyyy-MM-dd');
    const toDate = format(monthEnd, 'yyyy-MM-dd');

    // Generate all days in this month
    const interval = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create default map for entire month
    const defaultMap = new Map<string, { available: number; unavailable: number }>();

    interval.forEach((date) => {
      const key = format(date, 'yyyy-MM-dd');
      defaultMap.set(key, { available: 0, unavailable: 0 });
    });

    // Fetch backend range data
    const expertId = this.expertId();
    if (!expertId) return;

    this.expertsService.getExpertScheduleCalendar(expertId, fromDate, toDate).subscribe({
      next: (response) => {
        response.days?.forEach((day: any) => {
          const cleanDate = format(new Date(day.date), 'yyyy-MM-dd');

          // Map backend response to student view:
          // available = availableCount (slots that can be booked)
          // unavailable = bookedCount + emptyCount (slots that cannot be booked)
          const availableCount = day.availableCount ?? 0;
          const bookedCount = day.bookedCount ?? 0;
          const emptyCount = day.emptyCount ?? 0;

          defaultMap.set(cleanDate, {
            available: availableCount,
            unavailable: bookedCount + emptyCount,
          });
        });

        this.calendarData.set(defaultMap);
      },
      error: () => {
        // fallback (everything empty)
        this.calendarData.set(defaultMap);
      },
    });
  }

  /**
   * Load schedule details for a specific date
   */
  private loadScheduleForDate(date: Date): void {
    const expertId = this.expertId();
    if (!expertId) return;

    this.isLoadingSchedule.set(true);
    const dateKey = format(date, 'yyyy-MM-dd');

    this.expertsService.getExpertScheduleByDate(expertId, dateKey).subscribe({
      next: (response) => {
        this.scheduleData.set(response.slots || []);
        this.isLoadingSchedule.set(false);
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
        this.scheduleData.set([]);
        this.isLoadingSchedule.set(false);
      },
    });
  }

  getRatingNumber(): number {
    const expertData = this.expert();
    return expertData ? parseFloat(expertData.rating) || 0 : 0;
  }

  getStudentsCount(): number {
    const expertData = this.expert();
    return expertData ? parseInt(expertData.accepted_appointments_count) || 0 : 0;
  }

  // Calendar days computed from backend data
  calendarDays = computed(() => {
    const currDate = this.currentMonth();
    const monthStart = startOfMonth(currDate);
    const monthEnd = endOfMonth(currDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const interval = eachDayOfInterval({ start: startDate, end: endDate });
    const calData = this.calendarData();

    return interval.map((date) => {
      const isCurrent = isSameMonth(date, currDate);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayData = calData.get(dateKey);

      // Determine status: available if has available slots, unavailable otherwise
      let status: 'available' | 'unavailable' | null = null;
      if (isCurrent && dayData) {
        if (dayData.available > 0) {
          status = 'available';
        } else {
          status = 'unavailable';
        }
      }

      return {
        date: date,
        dayNum: format(date, 'd'),
        isCurrentMonth: isCurrent,
        status: status,
      } as DayObj;
    });
  });

  formattedMonth = computed(() => format(this.currentMonth(), 'MMMM yyyy'));

  // Actions
  changeMonth(delta: number) {
    this.currentMonth.update((d) => addMonths(d, delta));
    this.loadCalendarData();
  }

  selectDate(day: DayObj) {
    if (day.isCurrentMonth && day.status === 'available') {
      this.selectedDate.set(day.date);
      this.selectedSlotId.set(null); // Reset selected slot
      this.loadScheduleForDate(day.date);
    }
  }

  isSelected(date: Date): boolean {
    const selected = this.selectedDate();
    return selected ? isSameDay(date, selected) : false;
  }

  selectSlot(id: string) {
    this.selectedSlotId.set(id);
  }

  /**
   * Request an appointment for the selected slot
   */
  requestAppointment(): void {
    const slotId = this.selectedSlotId();

    if (!slotId) {
      this.alertService.error('Selection Required', 'Please select a time slot');
      return;
    }

    this.isRequestingAppointment.set(true);

    this.expertsService.requestAppointment(slotId).subscribe({
      next: () => {
        this.alertService.success('Success', 'Appointment requested successfully');
        this.isRequestingAppointment.set(false);

        // Reload schedule to update availability
        if (this.selectedDate()) {
          this.loadScheduleForDate(this.selectedDate()!);
        }
        this.loadCalendarData();
        this.selectedSlotId.set(null);
      },
      error: (error) => {
        // Show backend error message if available
        const errorMessage = error?.error?.message || 'Failed to request appointment';
        this.alertService.error('Request Failed', errorMessage);
        this.isRequestingAppointment.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  onRatingChange(rating: number): void {
    this.userRating.set(rating);
  }

  loadUserExpertInteraction(expertId: string): void {
    this.isLoadingUserRating.set(true);
    this.expertsService.getUserExpertInteraction(expertId).subscribe({
      next: (response) => {
        this.userCurrentRating.set(parseFloat(response.rating) || 0);
        this.isLoadingUserRating.set(false);
      },
      error: (err) => {
        this.isLoadingUserRating.set(false);
        console.error('Error loading user expert interaction:', err);
      },
    });
  }

  submitRating(): void {
    const expertId = this.expertId();
    const rating = this.userRating();

    if (!expertId || rating === 0) {
      return;
    }

    this.isSubmittingRating.set(true);
    this.expertsService.rateExpert(expertId, rating).subscribe({
      next: (response) => {
        this.isSubmittingRating.set(false);
        // Update the expert rating
        const currentExpert = this.expert();
        if (currentExpert) {
          this.expert.set({
            ...currentExpert,
            rating: response.data.rating.toString(),
          });
        }
        this.userCurrentRating.set(parseFloat(response.data.rating));
        this.userRating.set(0); // Reset the input rating
        this.alertService.success('Success', 'Rating submitted successfully');
      },
      error: (err) => {
        this.isSubmittingRating.set(false);
        const errorMessage = err?.error?.message || 'Failed to submit rating';
        this.alertService.error('Rating Failed', errorMessage);
        console.error('Error submitting rating:', err);
      },
    });
  }
}
