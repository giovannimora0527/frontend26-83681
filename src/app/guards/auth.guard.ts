import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../demo/pages/login/service/auth.service';
import { getJwtPayload } from '../utils/jwt.util';

/** Exige una sesión y limita el acceso de Despacho Médico a sus módulos. */
export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) return router.createUrlTree(['/login']);
  let rol: string | undefined;
  try {
    rol = getJwtPayload()?.rol.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  } catch {
    authService.logout();
    return router.createUrlTree(['/login']);
  }
  if (rol === 'DESPACHO_MEDICO' && route.parent?.routeConfig?.path === 'inicio' && route.routeConfig?.path !== 'medicamentos') {
    return router.createUrlTree(['/inicio/medicamentos'], { queryParams: { modulo: 'inventario' } });
  }
  return true;
};
