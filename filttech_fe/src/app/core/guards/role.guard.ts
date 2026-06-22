import { CanMatchFn, UrlTree, Route } from '@angular/router';
import { inject } from '@angular/core';

import { Router } from '@angular/router';

import { catchError, map, of } from 'rxjs';
import { ManageProfile } from '../services/manage-profile';
import { Auth } from '../services/auth';

function hasRequiredRole(userRoles: string[], required: string[]): boolean {
  const set = new Set(userRoles.map((r) => r.toLowerCase()));
  return required.some((req) => set.has(req.toLowerCase()));
}

function redirectToUserDashboard(userRoles: string[], router: Router): UrlTree {
  const roles = userRoles.map((r) => r.toLowerCase());

  if (roles.includes('admin')) {
    return router.parseUrl('/a/dashboard') as UrlTree;
  }
  if (roles.includes('expert')) {
    return router.parseUrl('/e/dashboard') as UrlTree;
  }
  if (roles.includes('user')) {
    return router.parseUrl('/s/courses') as UrlTree;
  }

  // No recognized role - go to landing
  return router.parseUrl('/') as UrlTree;
}

export const roleGuard: CanMatchFn = (
  route: Route
): boolean | UrlTree | import('rxjs').Observable<boolean | UrlTree> => {
  const auth = inject(Auth);
  const router = inject(Router);
  const profile = inject(ManageProfile);

  const requiredRoles = (route?.data?.['roles'] as string[] | undefined) ?? [];

  // If no roles required, allow
  if (!requiredRoles.length) {
    return true;
  }

  // Try roles from stored profile first (auth already checked by authGuard)
  const storedRoles = auth.getRolesFromStoredProfile();
  if (storedRoles.length) {
    if (hasRequiredRole(storedRoles, requiredRoles)) {
      return true;
    }
    // User doesn't have required role - redirect based on their actual role
    return redirectToUserDashboard(storedRoles, router);
  }

  // Fallback: fetch profile, store it, then check roles
  return profile.myProfile().pipe(
    map((res) => {
      auth.setProfile(res);
      const names = (res?.roles ?? []).map((r) => (r?.name ?? '').toLowerCase()).filter((n) => !!n);
      if (hasRequiredRole(names, requiredRoles)) {
        return true;
      }
      // User doesn't have required role - redirect based on their actual role
      return redirectToUserDashboard(names, router);
    }),
    catchError(() => of(router.parseUrl('/') as UrlTree))
  );
};
