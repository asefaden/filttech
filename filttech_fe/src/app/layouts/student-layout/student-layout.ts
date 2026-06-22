import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive, Router } from '@angular/router';
import { Notfication } from '../../shared/components/notfication/notfication';
import { ClickOutsideDirective } from '@shared/directive/click-outside.directive';
import { ProfileModel } from '@shared/components/profile-model/profile-model';
import { Auth } from 'src/app/core/services/auth';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-student-layout',
  imports: [
    RouterOutlet,
    Notfication,
    ClickOutsideDirective,
    ProfileModel,
    RouterLinkWithHref,
    RouterLinkActive,
  ],
  templateUrl: './student-layout.html',
  styleUrl: './student-layout.css',
})
export class StudentLayout {
  private authService = inject(Auth);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  unreadCount = this.notificationService.getUnreadCount();

  profileImage = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return '../../../assets/images/Image-60.svg';

    const profilePhotoUrl = profile['profile_photo_url'];
    const profileImage = profile['profile_image'];

    if (profileImage && typeof profileImage === 'string') {
      return profileImage;
    }
    // Use profile_photo_url if available, otherwise profile_image, otherwise default
    if (profilePhotoUrl && typeof profilePhotoUrl === 'string') {
      return profilePhotoUrl;
    }

    return '../../../assets/images/Image-60.svg';
  });
  username = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return 'User';
    return profile['username'];
  });

  isNotficaionOpen = signal(false);
  toggleNotfication() {
    const wasOpen = this.isNotficaionOpen();
    this.isNotficaionOpen.update((prv) => !prv);

    // If opening the notification dropdown, ensure we have fresh data
    if (!wasOpen && this.isNotficaionOpen()) {
      // The notification component will handle loading data
    }
  }
  isProfileOpen = signal(false);
  toggleProfile() {
    this.isProfileOpen.update((prv) => !prv);
  }
  mobileSidebar = signal(false);
  toggle(event: Event) {
    event.stopPropagation();
    this.mobileSidebar.set(!this.mobileSidebar());
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
