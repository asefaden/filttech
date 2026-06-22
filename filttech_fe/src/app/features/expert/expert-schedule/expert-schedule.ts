import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from 'src/app/shared/alert/alert.service';
import { ScheduleService } from '../services/schedule';
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
  isToday,
} from 'date-fns';

interface DayObj {
  date: Date;
  dayNum: string;
  status: 'available' | 'booked' | 'empty' | null;
  isCurrentMonth: boolean;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'empty';
  studentName?: string;
}

@Component({
  selector: 'app-expert-schedule',
  imports: [CommonModule, FormsModule],
  templateUrl: './expert-schedule.html',
  styleUrl: './expert-schedule.css',
})
export class ExpertSchedule {
  weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  myToday = new Date();
  currentMonth = signal(new Date());
  selectedDate = signal<Date | null>(null);
  scheduleData = signal<TimeSlot[]>([]);
  isLoadingSchedule = signal(false);

  // Modal state
  showModal = signal(false);
  startHour = signal('12');
  startMinute = signal('00');
  startPeriod = signal<'AM' | 'PM'>('PM');
  endHour = signal('12');
  endMinute = signal('00');
  endPeriod = signal<'AM' | 'PM'>('PM');
  isAddingSlot = signal(false);

  // Time options
  hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  minutes = ['00', '15', '30', '45'];

  // Mock data for calendar indicators
  private calendarData = signal<Map<string, { available: number; booked: number; empty: number }>>(
    new Map()
  );

  // Today's sessions
  todaySessions = signal<any[]>([]);
  loadingTodaySessions = signal(false);

  formattedModalDate = computed(() => {
    const date = this.selectedDate();
    return date ? format(date, 'yyyy MMM dd EEEE') : '';
  });

  constructor(private scheduleService: ScheduleService, private alertService: AlertService) {
    // Initialize with calendar data
    this.loadCalendarData();
    this.loadTodaySessions();
  }

  /**
   * Load today's sessions from the backend
   */
  loadTodaySessions(): void {
    this.loadingTodaySessions.set(true);
    this.scheduleService.getTodaySessions().subscribe({
      next: (response) => {
        this.todaySessions.set(response.data || []);
        this.loadingTodaySessions.set(false);
      },
      error: (error) => {
        console.error('Error loading today sessions:', error);
        this.loadingTodaySessions.set(false);
      },
    });
  }

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

      // Determine single status with priority: available > booked > empty
      let status: 'available' | 'booked' | 'empty' | null = null;
      if (isCurrent && dayData) {
        if (dayData.available > 0) {
          status = 'available';
        } else if (dayData.booked > 0) {
          status = 'booked';
        } else {
          status = 'empty';
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

  formattedSelectedDate = computed(() => {
    const date = this.selectedDate();
    return date ? format(date, 'EEEE, MMMM d') : '';
  });

  /**
   * Check if the selected date is in the past
   * @returns true if selected date is before today (not including today)
   */
  isSelectedDatePast = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(selected);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate < today;
  });

  /**
   * Navigate to previous or next month in the calendar
   * @param delta - Number of months to move (negative for previous, positive for next)
   */
  changeMonth(delta: number): void {
    this.currentMonth.update((d) => addMonths(d, delta));
    this.loadCalendarData();
  }

  /**
   * Handle date selection from calendar
   * Only allows selection of dates within the current month
   */
  selectDate(day: DayObj): void {
    if (day.isCurrentMonth) {
      this.selectedDate.set(day.date);
      this.loadScheduleForDate(day.date);
    }
  }

  /**
   * Check if a given date is currently selected
   * @returns true if the date matches the selected date
   */
  isSelected(date: Date): boolean {
    const selected = this.selectedDate();
    return selected ? isSameDay(date, selected) : false;
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

    // 1️⃣ Create default map for entire month
    const defaultMap = new Map<string, { available: number; booked: number; empty: number }>();

    interval.forEach((date) => {
      const key = format(date, 'yyyy-MM-dd');
      defaultMap.set(key, { available: 0, booked: 0, empty: 0 });
    });

    // 2️⃣ Fetch backend range data
    this.scheduleService.getCalendarData(fromDate, toDate).subscribe({
      next: (response) => {
        response.days?.forEach((day) => {
          // backend sends "2025-12-01 00:00:00"
          const cleanDate = format(new Date(day.date), 'yyyy-MM-dd');

          // overwrite defaults only for these matched days
          defaultMap.set(cleanDate, {
            available: day.availableCount ?? 0,
            booked: day.bookedCount ?? 0,
            empty: day.emptyCount ?? 0,
          });
        });

        // Apply final result
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
   * Displays time slots with their booking status
   */
  private loadScheduleForDate(date: Date): void {
    this.isLoadingSchedule.set(true);
    const dateKey = format(date, 'yyyy-MM-dd');

    this.scheduleService.getScheduleForDate(dateKey).subscribe({
      next: (response) => {
        this.scheduleData.set(response.slots || []);
        this.isLoadingSchedule.set(false);
      },
      error: () => {
        this.isLoadingSchedule.set(false);
      },
    });
  }

  /**
   * Open the modal to add a new avaibility slot
   * Resets the form to default values (12:00 PM)
   */
  addAvailability(): void {
    const date = this.selectedDate();
    if (!date) {
      this.alertService.error('No Date Selected', 'Please select a date first');
      return;
    }

    // Reset form
    this.startHour.set('12');
    this.startMinute.set('00');
    this.startPeriod.set('PM');
    this.endHour.set('12');
    this.endMinute.set('00');
    this.endPeriod.set('PM');

    this.showModal.set(true);
  }

  /**
   * Close the availability modal
   */
  closeModal(): void {
    this.showModal.set(false);
  }

  /**
   * Convert 12-hour time format to total minutes for comparison
   * Used for time validation and overlap checking
   * @returns Total minutes from midnight (0-1439)
   */
  private convertTo24Hour(hour: string, minute: string, period: 'AM' | 'PM'): number {
    let h = parseInt(hour);
    if (period === 'PM' && h !== 12) {
      h += 12;
    } else if (period === 'AM' && h === 12) {
      h = 0;
    }
    return h * 60 + parseInt(minute);
  }

  /**
   * Check if a new time slot overlaps with existing schedule
   * @returns true if there's an overlap with any existing slot
   */
  private checkTimeOverlap(startMinutes: number, endMinutes: number): boolean {
    const existingSlots = this.scheduleData();

    for (const slot of existingSlots) {
      const slotStart = this.parseTimeToMinutes(slot.startTime);
      const slotEnd = this.parseTimeToMinutes(slot.endTime);

      // Check if times overlap
      if (
        (startMinutes >= slotStart && startMinutes < slotEnd) ||
        (endMinutes > slotStart && endMinutes <= slotEnd) ||
        (startMinutes <= slotStart && endMinutes >= slotEnd)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Parse time string (e.g., "4:00 PM") to total minutes from midnight
   * @returns Total minutes, or 0 if parsing fails
   */
  private parseTimeToMinutes(timeStr: string): number {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  }

  /**
   * Convert 12-hour time format to 24-hour format for backend API
   * @returns Time string in "HH:mm:ss" format (e.g., "13:00:00" for 1:00 PM)
   */
  private formatTimeForBackend(hour: string, minute: string, period: 'AM' | 'PM'): string {
    let h = parseInt(hour, 10);

    if (period === 'PM' && h !== 12) {
      h += 12;
    }
    if (period === 'AM' && h === 12) {
      h = 0;
    }

    return `${h.toString().padStart(2, '0')}:${minute}:00`;
  }

  /**
   * Submit new availability slot to the backend
   * Validates time range and checks for overlaps before submission
   */
  submitAvailability(): void {
    const selected = this.selectedDate();
    const startMinutes = this.convertTo24Hour(
      this.startHour(),
      this.startMinute(),
      this.startPeriod()
    );
    const endMinutes = this.convertTo24Hour(this.endHour(), this.endMinute(), this.endPeriod());

    // Validate time range
    if (startMinutes >= endMinutes) {
      this.alertService.error('Invalid Time Range', 'End time must be after start time');
      return;
    }

    // Check if trying to set past time for today
    if (selected && isToday(selected)) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      if (startMinutes < nowMinutes) {
        this.alertService.error(
          'Past Time Error',
          'You cannot set a time earlier than the current time for today'
        );
        return;
      }
    }

    // Check for overlaps
    if (this.checkTimeOverlap(startMinutes, endMinutes)) {
      this.alertService.error('Time Overlap', 'This time slot overlaps with an existing schedule');
      return;
    }

    this.isAddingSlot.set(true);

    const newSlot = {
      date: format(this.selectedDate()!, 'yyyy-MM-dd'),
      from_time: this.formatTimeForBackend(
        this.startHour(),
        this.startMinute(),
        this.startPeriod()
      ),
      to_time: this.formatTimeForBackend(this.endHour(), this.endMinute(), this.endPeriod()),
    };

    this.scheduleService.createSlot(newSlot).subscribe({
      next: () => {
        this.alertService.success('Success', 'Availability added successfully');
        this.closeModal();
        this.isAddingSlot.set(false);

        // Update calendar indicator - increment available count
        const dateKey = format(this.selectedDate()!, 'yyyy-MM-dd');
        this.calendarData.update((dataMap) => {
          const newMap = new Map(dataMap);
          const dayData = newMap.get(dateKey) || { available: 0, booked: 0, empty: 0 };
          newMap.set(dateKey, {
            ...dayData,
            available: dayData.available + 1,
          });
          return newMap;
        });

        // Reload schedule
        if (this.selectedDate()) {
          this.loadScheduleForDate(this.selectedDate()!);
        }
      },
      error: () => {
        this.alertService.submissionError('Add availability');
        this.isAddingSlot.set(false);
      },
    });
  }

  /**
   * Decline a booked session with confirmation dialog
   * @param slotId - The ID of the session to decline
   */
  declineSession(slotId: string): void {
    this.alertService
      .confirm(
        'Decline Session?',
        'Yes, decline',
        'Cancel',
        'Are you sure you want to decline this session?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          // Find the slot to determine its status before deletion
          const slotToDelete = this.scheduleData().find((slot) => slot.id === slotId);

          this.scheduleService.deleteSlot(slotId).subscribe({
            next: () => {
              this.alertService.success('Success', 'Session declined successfully');

              // Update calendar indicator - decrement the appropriate count
              if (slotToDelete && this.selectedDate()) {
                const dateKey = format(this.selectedDate()!, 'yyyy-MM-dd');
                this.calendarData.update((dataMap) => {
                  const newMap = new Map(dataMap);
                  const dayData = newMap.get(dateKey) || { available: 0, booked: 0, empty: 0 };

                  if (slotToDelete.status === 'booked' && dayData.booked > 0) {
                    newMap.set(dateKey, { ...dayData, booked: dayData.booked - 1 });
                  } else if (slotToDelete.status === 'available' && dayData.available > 0) {
                    newMap.set(dateKey, { ...dayData, available: dayData.available - 1 });
                  }

                  return newMap;
                });
              }

              // Reload schedule
              if (this.selectedDate()) {
                this.loadScheduleForDate(this.selectedDate()!);
              }
            },
            error: () => {
              this.alertService.submissionError('Decline session');
            },
          });
        }
      });
  }
}
