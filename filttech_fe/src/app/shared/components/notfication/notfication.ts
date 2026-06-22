import {
  Component,
  inject,
  output,
  OnInit,
  DestroyRef,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { NotificationService, Notification } from '@core/services/notification.service';

@Component({
  selector: '[app-notfication]',
  imports: [CommonModule],
  templateUrl: './notfication.html',
  styleUrl: './notfication.css',
})
export class Notfication implements OnInit {
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  notifications = this.notificationService.getNotifications();
  unreadCount = this.notificationService.getUnreadCount();
  hasMore = this.notificationService.getHasMore();
  isLoading = this.notificationService.getIsLoading();

  closeDropdown = output<void>();
  scrollContainer = viewChild<ElementRef>('scrollContainer');

  ngOnInit() {
    this.notificationService.loadNotifications(1);
  }

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  private setupInfiniteScroll() {
    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;

    fromEvent(container, 'scroll')
      .pipe(
        debounceTime(200),
        filter(() => {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 100;
          return scrolledToBottom && this.hasMore() && !this.isLoading();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.notificationService.loadMore();
      });
  }

  getIcon(notification: Notification): string {
    const type = notification.body.type;
    return this.notificationService.ICON_MAP[type.toLocaleLowerCase()]?.icon || '';
  }

  getIconBgColor(notification: Notification): string {
    const type = notification.body.type || notification.title;
    return this.notificationService.ICON_MAP[type.toLocaleLowerCase()]?.bgColor;
  }

  onNotificationClick(notification: Notification) {
    this.notificationService.handleNotificationClick(notification);
    this.closeDropdown.emit();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  isRead(notification: Notification): boolean {
    return notification.read_at !== null;
  }
}
