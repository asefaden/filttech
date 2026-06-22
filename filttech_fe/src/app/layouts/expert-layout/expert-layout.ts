import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Notfication } from '@shared/components/notfication/notfication';
import { ClickOutsideDirective } from '@shared/directive/click-outside.directive';
import { Auth } from 'src/app/core/services/auth';
import { AlertService } from 'src/app/shared/alert/alert.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-expert-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    Notfication,
    ClickOutsideDirective,
  ],
  templateUrl: './expert-layout.html',
  styleUrl: './expert-layout.css',
})
export class ExpertLayout {
  private authService = inject(Auth);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private notificationService = inject(NotificationService);

  isSidebarOpen = signal(false);
  isNotficaionOpen = signal(false);
  isLoggingOut = signal(false);
  unreadCount = this.notificationService.getUnreadCount();

  /**
   * Get profile image from auth service
   */
  profileImage = computed(() => {
    const profile = this.authService.profile();
    if (!profile) {
      return '';
    }

    const profilePhotoUrl = profile['profile_photo_url'];
    const profileImg = profile['profile_image'];

    // Return the actual profile image from backend (backend already provides ui-avatars URLs)
    return (profileImg || profilePhotoUrl || '') as string;
  });

  /**
   * Get user name from auth service
   */
  userName = computed(() => {
    const profile = this.authService.profile();
    return (profile?.['name'] as string) || 'Expert User';
  });

  toggleSidebar() {
    this.isSidebarOpen.update((value) => !value);
  }

  toggleNotfication() {
    const wasOpen = this.isNotficaionOpen();
    this.isNotficaionOpen.update((prv) => !prv);

    // If opening the notification dropdown, ensure we have fresh data
    if (!wasOpen && this.isNotficaionOpen()) {
      // The notification component will handle loading data
    }
  }

  /**
   * Handle user logout with confirmation
   */
  logout(): void {
    this.alertService
      .confirm('Logout Confirmation', 'Yes, logout', 'Cancel', 'Are you sure you want to logout?')
      .then((result) => {
        if (result.isConfirmed) {
          this.performLogout();
        }
      });
  }

  /**
   * Perform the actual logout process
   */
  private performLogout(): void {
    this.isLoggingOut.set(true);

    try {
      // Clear authentication data
      this.authService.logout();

      this.router.navigate(['/']);
    } catch (error) {
      // Handle any logout errors
      this.alertService.error('Logout Error', 'Failed to logout properly');
      console.error('Logout error:', error);
    } finally {
      this.isLoggingOut.set(false);
    }
  }
}
