import { Routes } from '@angular/router';
import { ExpertLayout } from 'src/app/layouts/expert-layout/expert-layout';
import { ExpertRating } from './expert-rating/expert-rating';
import { ExpertProfile } from './expert-profile/expert-profile';
import { ExpertRequests } from './expert-requests/expert-requests';
import { ExpertDashboard } from './expert-dashboard/expert-dashboard';
import { ExpertSchedule } from './expert-schedule/expert-schedule';

export const expert: Routes = [
  {
    path: '',
    component: ExpertLayout,
    children: [
      { path: 'rating', component: ExpertRating },
      { path: 'profile', component: ExpertProfile },
      { path: 'requests', component: ExpertRequests },
      { path: 'dashboard', component: ExpertDashboard },
      { path: 'schedule', component: ExpertSchedule },
      { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
