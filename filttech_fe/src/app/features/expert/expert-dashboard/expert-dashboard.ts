import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AlertService } from '../../../shared/alert/alert.service';
import {
  Appointments,
  AppointmentRequest,
  UpcomingAppointment,
  RecentActivity,
} from '../services/appointments';

interface StatCard {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-expert-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './expert-dashboard.html',
  styleUrl: './expert-dashboard.css',
})
export class ExpertDashboard implements OnInit {
  private appointmentsService = inject(Appointments);
  private alertService = inject(AlertService);
  private router = inject(Router);

  expertName = signal('Darrell Steward');
  loadingRequests = signal(false);
  loadingUpcoming = signal(false);
  loadingActivities = signal(false);
  processingRequests = signal<Set<string>>(new Set());

  stats = signal<StatCard[] | null>(null);
  upcomingSessions = signal<UpcomingAppointment[]>([]);
  newRequests = signal<AppointmentRequest[]>([]);
  recentActivities = signal<RecentActivity[]>([]);

  ngOnInit() {
    this.loadStatusOverview();
    this.loadNewRequests();
    this.loadUpcomingAppointments();
    this.loadRecentActivities();
  }

  loadUpcomingAppointments() {
    this.loadingUpcoming.set(true);
    this.appointmentsService.getUpcomingAppointments().subscribe({
      next: (response) => {
        this.upcomingSessions.set(response.data.data || []);
        this.loadingUpcoming.set(false);
      },
      error: (error) => {
        console.error('Error loading upcoming appointments:', error);
        this.loadingUpcoming.set(false);
      },
    });
  }

  loadStatusOverview() {
    this.appointmentsService.getStatusOverview().subscribe({
      next: (response) => {
        this.stats.set([
          { label: 'Total Students', value: response.total_students },
          { label: 'Upcoming Sessions', value: response.upcoming_appointments },
          { label: 'New Requests', value: response.new_requests },
          { label: 'Rating', value: `${response.ratings}/5.0` },
        ]);
      },
      error: (error) => {
        console.error('Error loading status overview:', error);
      },
    });
  }

  loadNewRequests() {
    this.loadingRequests.set(true);
    this.appointmentsService.getNewAppointments().subscribe({
      next: (response) => {
        this.newRequests.set(response.data || []);
        this.loadingRequests.set(false);
      },
      error: (error) => {
        console.error('Error loading new requests:', error);
        this.loadingRequests.set(false);
      },
    });
  }

  loadRecentActivities() {
    this.loadingActivities.set(true);
    this.appointmentsService.getRecentActivities().subscribe({
      next: (response) => {
        this.recentActivities.set(response.data || []);
        this.loadingActivities.set(false);
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
        this.loadingActivities.set(false);
      },
    });
  }

  isProcessing(requestId: string): boolean {
    return this.processingRequests().has(requestId);
  }

  handleAccept(requestId: string): void {
    if (this.isProcessing(requestId)) return;

    this.alertService
      .confirm(
        'Accept Request?',
        'Yes, accept',
        'Cancel',
        'Are you sure you want to accept this appointment request?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.updateRequestStatus(requestId, 'accepted');
        }
      });
  }

  handleDecline(requestId: string): void {
    if (this.isProcessing(requestId)) return;

    this.alertService
      .confirm(
        'Decline Request?',
        'Yes, declined',
        'Cancel',
        'Are you sure you want to declined this appointment request?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.updateRequestStatus(requestId, 'declined');
        }
      });
  }

  private updateRequestStatus(requestId: string, status: 'accepted' | 'declined'): void {
    this.processingRequests.update((set) => {
      const newSet = new Set(set);
      newSet.add(requestId);
      return newSet;
    });

    this.appointmentsService.updateAppointmentStatus(requestId, status).subscribe({
      next: () => {
        this.alertService.success(
          'Success',
          `Appointment ${status === 'accepted' ? 'accepted' : 'declined'} successfully`
        );
        this.processingRequests.update((set) => {
          const newSet = new Set(set);
          newSet.delete(requestId);
          return newSet;
        });
        // Reload requests
        this.loadNewRequests();
      },
      error: (error: any) => {
        const errorMessage = error?.error?.message || `Failed to ${status} appointment`;
        this.alertService.error('Update Failed', errorMessage);
        this.processingRequests.update((set) => {
          const newSet = new Set(set);
          newSet.delete(requestId);
          return newSet;
        });
      },
    });
  }

  viewAllRequests() {
    this.router.navigate(['/e/requests']);
  }

  getDefaultAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=3b82f6&color=fff`;
  }
}
