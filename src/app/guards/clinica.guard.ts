import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { perfilClinica, perfilesClinica } from '../demo/pages/gestion-clinica/clinica-api.service';

/** Comprueba que el perfil de la sesión pueda abrir la ruta clínica solicitada. */
export const clinicaGuard: CanActivateFn = (ruta) => {
  const perfil = perfilClinica();
  if ((ruta.data['perfiles'] as string[]).includes(perfil)) return true;
  const router = inject(Router);
  if (ruta.data['agendaMedica'] && perfilesClinica.medicos.includes(perfil)) {
    return router.createUrlTree(['/inicio/calendario-medico']);
  }
  return router.createUrlTree(['/inicio']);
};
