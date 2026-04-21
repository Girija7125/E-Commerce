import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data['roles'] as string[];
  const userRole     = auth.getRole();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};