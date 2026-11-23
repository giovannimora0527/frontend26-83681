import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../demo/pages/login/service/auth.service';
import { getJwtPayload } from '../utils/jwt.util';

export const roleGuard: CanActivateFn = route => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);

  try {
    const role = getJwtPayload()?.rol.toUpperCase();
    const allowedRoles = route.data['roles'] as string[] | undefined;
    return role && allowedRoles?.some(allowed => allowed.toUpperCase() === role)
      ? true
      : router.createUrlTree(['/inicio']);
  } catch {
    auth.logout();
    return router.createUrlTree(['/login']);
  }
};
