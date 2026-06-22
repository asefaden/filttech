import { CanMatchFn, UrlTree, Route, UrlSegment } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const token = auth.getValidToken();
  if (token) {
    return true;
  }

  // Build the attempted URL from the route segments
  const attemptedUrl = '/' + segments.map((s) => s.path).join('/');

  const urlTree = router.parseUrl('/(modal:login)');
  urlTree.queryParams = { returnUrl: attemptedUrl };

  return urlTree;
};
