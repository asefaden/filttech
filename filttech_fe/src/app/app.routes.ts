import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { LoginModal } from './auth/login-modal/login-modal';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
  },
  {
    path: 'login',
    component: LoginModal,
    outlet: 'modal',
  },
  {
    path: 's',
    loadChildren: () => import('./features/student/student.routes').then((m) => m.student),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['user'] },
  },
  {
    path: 'e',
    loadChildren: () => import('./features/expert/expert.routes').then((m) => m.expert),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['expert'] },
  },
  {
    path: 'a',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.admin),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
