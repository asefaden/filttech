import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from './auth';

export interface NotificationBody {
  message: string;
  id: string;
  type: string;
  name?: string;
}

export interface Notification {
  id: string;
  title: string;
  body: NotificationBody;
  name: string;
  created_at: string;
  ago: string;
  read_at: string | null;
}

export interface NotificationData {
  current_page: number;
  data: Notification[];
  total: number;
}

export interface NotificationResponse {
  count: number;
  unread_count: number;
  read_count: number;
  data: NotificationData;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private router = inject(Router);
  private authService = inject(Auth);
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  private notifications = signal<Notification[]>([]);
  private currentPage = signal(1);
  private totalCount = signal(0);
  private unreadCount = signal(0);
  private hasMore = signal(true);
  private isLoading = signal(false);
  private periodicTimer?: any;

  // Icon mapping for different notification types
  readonly ICON_MAP: Record<string, { icon: string; bgColor: string }> = {
    course: {
      icon: '../../../assets/images/coursenot.svg',
      bgColor: '',
    },
    'appointment accepted': {
      icon: '../../../assets/images/grommet-icons_user-expert.svg',
      bgColor: '',
    },
    'appointment declined': {
      icon: '../../../../../assets/images/x.svg',
      bgColor: '',
    },

    blog: {
      icon: '../../../assets/images/icons8-blog-48 1.svg',
      bgColor: '',
    },

    book: {
      icon: '../../../assets/images/not2.svg',
      bgColor: '',
    },

    // expert notfcation
    'appointment request': {
      icon: '../../../assets/images/icons8-person-60 1.svg',
      bgColor: '',
    },
    'new rating': {
      icon: '../../../assets/images/svgviewer-output.svg',
      bgColor: '',
    },
  };

  // Route mapping based on notification type and user role
  private getRouteMap(): Record<string, (entityId?: string) => string> {
    const role = this.authService.getRolesFromStoredProfile();

    if (role.includes('user')) {
      return {
        course: (id) => `/s/courses/${id}`,
        blog: (id) => `/s/blogs/${id}`,
        book: () => `/s/books`,
        'appointment accepted': (id) => `/s/accepted-page/${id}`,
      };
    }

    if (role.includes('expert')) {
      return {
        'appointment request': () => `/e/requests`,
        'new rating': () => `/e/rating`,
      };
    }

    return {};
  }

  getNotifications() {
    return this.notifications.asReadonly();
  }

  getUnreadCount() {
    return this.unreadCount.asReadonly();
  }

  getTotalCount() {
    return this.totalCount.asReadonly();
  }

  getHasMore() {
    return this.hasMore.asReadonly();
  }

  getIsLoading() {
    return this.isLoading.asReadonly();
  }

  fetchNotifications(page: number = 1): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`/my-notifications?page=${page}`);
  }

  // Fetch only first page for state updates (unread count, total count)
  private fetchNotificationState(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>('/my-notifications?page=1');
  }

  // Start periodic fetching every 1 minute for state updates
  startPeriodicFetch() {
    // Stop any existing timer first
    this.stopPeriodicFetch();

    // Initial fetch
    this.updateNotificationState();

    // Set up timer for every  (30000ms)
    this.periodicTimer = timer(30000, 30000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateNotificationState();
      });
  }

  // Stop periodic fetching
  stopPeriodicFetch() {
    if (this.periodicTimer) {
      this.periodicTimer.unsubscribe();
      this.periodicTimer = null;
    }
  }

  // Update notification state (unread count, total count) without affecting pagination
  private updateNotificationState() {
    this.fetchNotificationState().subscribe({
      next: (response) => {
        this.unreadCount.set(response.unread_count);
        this.totalCount.set(response.count);

        // Only update notifications if we're on the first page and dropdown is not open
        // This prevents disrupting user's scroll position
        if (this.currentPage() === 1 && this.notifications().length === 0) {
          this.notifications.set(response.data.data);
          this.hasMore.set(response.data.data.length < response.data.total);
        }
      },
      error: (error) => {
        console.error('Failed to update notification state:', error);
      },
    });
  }

  // Load notifications for pagination (when user scrolls)
  loadNotifications(page: number = 1) {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    this.fetchNotifications(page).subscribe({
      next: (response) => {
        // Always update state from response
        this.unreadCount.set(response.unread_count);
        this.totalCount.set(response.count);
        this.currentPage.set(response.data.current_page);

        if (page === 1) {
          this.notifications.set(response.data.data);
        } else {
          this.notifications.update((notifs) => [...notifs, ...response.data.data]);
        }

        // Check if there are more pages
        const loadedCount = page === 1 ? response.data.data.length : this.notifications().length;
        this.hasMore.set(loadedCount < response.data.total);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);
        this.isLoading.set(false);
      },
    });
  }

  loadMore() {
    if (!this.hasMore() || this.isLoading()) return;
    this.loadNotifications(this.currentPage() + 1);
  }

  handleNotificationClick(notification: Notification) {
    // Mark as read
    if (!notification.read_at) {
      this.markAsRead(notification.id);
    }

    // Build route from type and entityId
    const routeMap = this.getRouteMap();
    const notificationType = notification.body.type;
    const routeBuilder = routeMap[notificationType.toLowerCase()];

    if (routeBuilder) {
      const route = routeBuilder(notification.body.id);
      console.log(notification);
      this.router.navigate([route]);
    } else {
      console.warn(`No route mapping for notification type: ${notificationType}`);
    }
  }

  markAsRead(id: string) {
    this.http.post(`/read-notification/${id}`, {}).subscribe({
      next: () => {
        this.notifications.update((notifs) =>
          notifs.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
        this.unreadCount.update((count) => Math.max(0, count - 1));
      },
      error: (error) => {
        console.error('Failed to mark notification as read:', error);
      },
    });
  }

  markAllAsRead() {
    this.http.post('/read-all-notifications', {}).subscribe({
      next: () => {
        this.notifications.update((notifs) =>
          notifs.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
        );
        this.unreadCount.set(0);
      },
      error: (error) => {
        console.error('Failed to mark all notifications as read:', error);
      },
    });
  }

  refresh() {
    this.loadNotifications(1);
  }

  // Initialize the service (call this from app initialization)
  initialize() {
    // Only start periodic fetch if user is authenticated
    const profile = this.authService.profile();
    if (profile) {
      this.startPeriodicFetch();
    } else {
    }
  }

  // Start notifications when user logs in
  onUserLogin() {
    this.startPeriodicFetch();
  }

  // Manual trigger for testing
  triggerFetch() {
    this.updateNotificationState();
  }

  // Stop notifications when user logs out
  onUserLogout() {
    this.stopPeriodicFetch();
    // Clear all notification data
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.totalCount.set(0);
    this.currentPage.set(1);
    this.hasMore.set(true);
  }

  // Cleanup (automatically handled by DestroyRef)
  destroy() {
    this.stopPeriodicFetch();
  }
}
