import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

function initializeAuthFactory() {
  const auth = inject(Auth);
  return () => auth.initializeTokenRefresh();
}

function initializeNotificationFactory() {
  const notificationService = inject(NotificationService);
  return () => {
    notificationService.initialize();
    return Promise.resolve();
  };
}

import { routes } from './app.routes';
import { Auth } from './core/services/auth';
import { NotificationService } from './core/services/notification.service';
import { domainInterceptor } from './core/interceptors/domain.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([domainInterceptor, authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthFactory,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeNotificationFactory,
      multi: true,
    },
  ],
};
