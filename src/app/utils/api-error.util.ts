import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte un error HTTP en un mensaje comprensible para el usuario, sin exponer detalles técnicos.
 *
 * - Sin conexión (status 0): error de comunicación con el backend.
 * - 400, 409 y 422: el backend envía en `message` la regla de negocio incumplida (se muestra tal cual).
 * - 404: registro no encontrado.
 * - 5xx y otros: mensaje genérico.
 *
 * @param error error recibido en el subscribe.
 * @returns mensaje listo para mostrar.
 */
export function mensajeDeError(error: unknown): string {
  const e = error as HttpErrorResponse;
  switch (e?.status) {
    case 0:
      return 'No fue posible comunicarse con el servidor. Verifique que el servicio esté activo e intente de nuevo.';
    case 400:
    case 409:
    case 422:
      return e.error?.message || 'Los datos enviados no son válidos. Revise el formulario.';
    case 404:
      return e.error?.message || 'El registro solicitado no fue encontrado.';
    default:
      return 'Ocurrió un error inesperado. Intente nuevamente en unos momentos.';
  }
}
