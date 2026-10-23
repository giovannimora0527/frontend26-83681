import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { mensajeError, tituloError } from './http-error.util';

/**
 * Muestra un aviso de éxito.
 * @param mensaje Texto del aviso.
 */
export function notificarExito(mensaje: string): void {
  Swal.fire({ title: 'Éxito', text: mensaje, icon: 'success', timer: 2200, showConfirmButton: false });
}

/**
 * Muestra el error de una petición HTTP con un título acorde al código
 * (datos inválidos, no encontrado, operación no permitida, sin conexión).
 * @param error Error recibido en el subscribe.
 * @param mensajePorDefecto Mensaje si el backend no envía uno.
 */
export function notificarError(error: unknown, mensajePorDefecto: string): void {
  console.error(mensajePorDefecto, error);
  // Un conflicto (409) es una regla de negocio, no una falla: se muestra como advertencia.
  const icono = error instanceof HttpErrorResponse && error.status === 409 ? 'warning' : 'error';
  Swal.fire(tituloError(error), mensajeError(error, mensajePorDefecto), icono);
}

/**
 * Muestra una advertencia simple (por ejemplo, un formulario incompleto).
 * @param titulo Título del aviso.
 * @param mensaje Texto del aviso.
 */
export function notificarAdvertencia(titulo: string, mensaje: string): void {
  Swal.fire(titulo, mensaje, 'warning');
}

/**
 * Pide confirmación al usuario antes de una acción importante.
 * @param titulo Pregunta a mostrar.
 * @param texto Explicación de lo que va a pasar.
 * @param textoConfirmar Texto del botón de confirmación.
 * @returns Promesa que se resuelve en true si el usuario confirma.
 */
export async function confirmar(titulo: string, texto: string, textoConfirmar = 'Sí, continuar'): Promise<boolean> {
  const resultado = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: textoConfirmar,
    cancelButtonText: 'Cancelar'
  });
  return resultado.isConfirmed;
}
