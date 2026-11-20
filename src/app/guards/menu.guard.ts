import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { getJwtMenus, getJwtPayload } from '../utils/jwt.util';

const rutaPorMenu: Record<string, string> = {
  cita: '/inicio/citas', atencion: '/inicio/atencion', clientes: '/inicio/clientes',
  especializaciones: '/inicio/especializaciones', tarifas: '/inicio/tarifas', formulas: '/inicio/formulas',
  historias: '/inicio/historias', mascotas: '/inicio/mascotas', medicamentos: '/inicio/medicamentos',
  despacho: '/inicio/despacho', facturacion: '/inicio/facturacion', reportes: '/inicio/reportes',
  medicos: '/inicio/medicos', usuarios: '/inicio/usuarios'
};

/** Frontend route gate based on backend-issued JWT menus and role. The API remains authoritative. */
export const menuGuard: CanActivateChildFn = (route) => {
  const router = inject(Router);
  const menuCode = route.data['menuCode'] as string | undefined;
  const allowedRoles = route.data['roles'] as string[] | undefined;
  try {
    const payload = getJwtPayload();
    if (!payload || payload.exp * 1000 <= Date.now()) return router.createUrlTree(['/login']);
    const menus = getJwtMenus().filter(menu => menu.activo);
    if (allowedRoles?.length && !allowedRoles.includes(payload.rol.toUpperCase())) return router.createUrlTree([rutaPorMenu[menus[0]?.code] ?? '/login']);
    if (menuCode && !menus.some(menu => menu.code === menuCode)) return router.createUrlTree([rutaPorMenu[menus[0]?.code] ?? '/login']);
    return true;
  } catch {
    return router.createUrlTree(['/login']);
  }
};
