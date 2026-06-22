import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService, ExpertDetails } from '../services/appointment.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accepted-page',
  imports: [CommonModule],
  templateUrl: './accepted-page.html',
  styleUrl: './accepted-page.css',
})
export class AcceptedPage implements OnInit {
  private appointmentService = inject(AppointmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  expertDetails = signal<ExpertDetails | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      this.loadAppointmentDetails(appointmentId);
    } else {
      this.error.set('No appointment ID provided');
      this.isLoading.set(false);
    }
  }

  private loadAppointmentDetails(appointmentId: string) {
    this.appointmentService.getAcceptedAppointment(appointmentId).subscribe({
      next: (response) => {
        this.expertDetails.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load appointment details');
        this.isLoading.set(false);
        console.error('Error loading appointment:', err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/s/appointments']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getSkillsArray(): string[] {
    const skills = this.expertDetails()?.skills;
    if (!skills) return [];
    return Array.isArray(skills) ? skills : [];
  }
}
