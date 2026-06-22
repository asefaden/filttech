import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPagination } from 'src/app/shared/components/user-pagination/user-pagination';
import { AlertService } from '../../../shared/alert/alert.service';
import { Appointments, AppointmentRequest } from '../services/appointments';

type TabType = 'sent' | 'accepted' | 'declined' | 'passed';

interface StatCard {
  label: string;
  value: number;
  change?: string;
  isPositive?: boolean;
}

@Component({
  selector: 'app-expert-requests',
  imports: [CommonModule, UserPagination],
  templateUrl: './expert-requests.html',
  styleUrl: './expert-requests.css',
})
export class ExpertRequests implements OnInit {
  private appointmentsService = inject(Appointments);
  private alertService = inject(AlertService);

  activeTab = signal<TabType>('sent');
  currentPage = signal(1);
  itemsPerPage = 5;
  loading = signal(false);

  // Backend data
  requests = signal<AppointmentRequest[]>([]);
  totalRequests = signal(0);

  // Processing states
  processingRequests = signal<Set<string>>(new Set());

  // Statistics
  stats = signal<StatCard[] | null>(null);

  ngOnInit() {
    this.loadStatusOverview();
    this.loadRequests();
  }

  loadStatusOverview() {
    this.appointmentsService.getRequestsStatusOverview().subscribe({
      next: (response) => {
        this.stats.set([
          {
            label: 'Total Requests',
            value: response.data.total_requests,
          },
          {
            label: 'Pending',
            value: response.data.pending_requests,
          },
          {
            label: 'Accepted',
            value: response.data.accepted_requests,
          },
          {
            label: 'Declined',
            value: response.data.declined_requests,
          },
        ]);
      },
      error: (error) => {
        console.error('Error loading status overview:', error);
      },
    });
  }

  loadRequests() {
    this.loading.set(true);
    const status = this.activeTab();
    const page = this.currentPage();

    this.appointmentsService.getAppointmentRequests(status, page, this.itemsPerPage).subscribe({
      next: (response) => {
        this.requests.set(response.data.data);
        this.totalRequests.set(response.data.total);
        this.currentPage.set(response.data.current_page);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.loading.set(false);
      },
    });
  }

  setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.loadRequests();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadRequests();
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
        'Yes, decline',
        'Cancel',
        'Are you sure you want to decline this appointment request?'
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
        this.loadRequests();
        this.loadStatusOverview();
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

  getDefaultAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=3b82f6&color=fff`;
  }
}
