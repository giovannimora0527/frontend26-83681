import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

/** URL base del backend Spring Boot (incluye el context-path /clinica/v1). */
export const API_BASE = environment.apiUrlAuth;

/**
 * Convierte un objeto de filtros en HttpParams, omitiendo valores nulos o vacíos.
 *
 * @param valores objeto con filtros y parámetros de paginación.
 * @returns parámetros listos para la petición.
 */
export function construirParams(valores: object): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor !== null && valor !== undefined && valor !== '') {
      params = params.set(clave, String(valor));
    }
  }
  return params;
}

/**
 * Traduce un error HTTP en un mensaje claro para el usuario.
 * Usa el mensaje que envía el backend y evita mostrar detalles técnicos.
 *
 * @param error error recibido por el observable.
 * @returns mensaje para mostrar en pantalla.
 */
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo comunicar con el backend. Verifique que el servidor esté encendido.';
    }
    const mensaje = (error.error as { message?: string } | null)?.message;
    if (mensaje) {
      return mensaje;
    }
    return `No fue posible completar la operación (código ${error.status}).`;
  }
  return 'Ocurrió un error inesperado. Intente nuevamente.';
}
