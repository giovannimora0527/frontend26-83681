import { getJwtPayload } from './jwt.util';

/** Perfil del usuario autenticado normalizado: ADMINISTRADOR, RECEPCION, MEDICO o DESPACHO_MEDICO. */
export function rolActual(): string {
  try {
    const rol = getJwtPayload()?.rol ?? '';
    return rol.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[\s-]+/g, '_');
  } catch {
    return '';
  }
}

export const esAdmin = (): boolean => rolActual() === 'ADMINISTRADOR';
export const esMedico = (): boolean => rolActual() === 'MEDICO';
