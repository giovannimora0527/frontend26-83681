import Swal from 'sweetalert2';

/**
 * Convierte un error HTTP en un mensaje entendible para el usuario.
 *  - status 0: el backend no responde (apagado o sin red).
 *  - otros: se usa el mensaje que envia el backend en { message }.
 * Nunca se muestra informacion tecnica (stacktrace, SQL, etc.).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mensajeError(error: any): string {
  if (error?.status === 0) {
    return 'No fue posible comunicarse con el servidor. Verifique que el backend esté encendido.';
  }
  return error?.error?.message ?? 'Ocurrió un error inesperado. Intente nuevamente.';
}

/** Muestra una alerta de exito. */
export function mostrarExito(mensaje: string): void {
  Swal.fire('Éxito', mensaje, 'success');
}

/** Muestra una alerta de error a partir de un error HTTP. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mostrarError(error: any): void {
  Swal.fire('Error', mensajeError(error), 'error');
}

/** Muestra una advertencia simple (por ejemplo, validaciones del formulario). */
export function mostrarAdvertencia(mensaje: string): void {
  Swal.fire('Atención', mensaje, 'warning');
}

/**
 * Pide confirmacion al usuario antes de una accion importante.
 * @returns promesa que se resuelve en true si el usuario acepta.
 */
export async function confirmar(titulo: string, texto: string): Promise<boolean> {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  });
  return resultado.isConfirmed;
}
