import { Routes } from '@angular/router';

export const admin: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
  },
];
