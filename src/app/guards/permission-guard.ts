import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  // Admin and user always pass through
  if (auth.isAdmin() || auth.isUser()) return true;

  // Developer — check view permission for this section
  const section = route.data['section'] as string;
  if (auth.canView(section)) return true;

  router.navigate(['/unauthorized']);
  return false;
};