import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte un error HTTP en un mensaje comprensible para el usuario.
 * - Sin conexión (status 0): indica que el backend no responde.
 * - Errores de negocio (400, 404, 409): usa el mensaje que envía el backend.
 * - Errores del servidor (500): mensaje genérico, sin detalles técnicos.
 * @param error Error recibido en el subscribe.
 * @param mensajePorDefecto Mensaje a usar si el backend no envía uno.
 * @returns Mensaje para mostrar al usuario.
 */
export function mensajeError(error: unknown, mensajePorDefecto: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return mensajePorDefecto;
  }
  if (error.status === 0) {
    return 'No fue posible comunicarse con el servidor. Verifique su conexión o que el backend esté en ejecución.';
  }
  if (error.status >= 500) {
    return 'Ocurrió un error en el servidor. Intente nuevamente más tarde.';
  }
  const mensajeBackend = error.error?.message;
  return typeof mensajeBackend === 'string' && mensajeBackend.trim() ? mensajeBackend : mensajePorDefecto;
}

/**
 * Título del aviso según el código HTTP del error, para que el usuario
 * distinga un dato inválido de un registro inexistente o de un conflicto.
 * @param error Error recibido en el subscribe.
 * @returns Título corto para el aviso.
 */
export function tituloError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Error';
  }
  switch (error.status) {
    case 0: return 'Sin conexión';
    case 400: return 'Datos inválidos';
    case 404: return 'Registro no encontrado';
    case 409: return 'Operación no permitida';
    default: return 'Error';
  }
}
