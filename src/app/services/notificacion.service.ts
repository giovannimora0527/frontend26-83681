import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/**
 * Servicio único para mostrar mensajes de éxito, error y confirmación al usuario
 * (centraliza SweetAlert2 para mantener un diseño consistente en toda la aplicación).
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {

  /**
   * Muestra un aviso breve de éxito.
   * @param mensaje texto a mostrar.
   */
  exito(mensaje: string): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: mensaje,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  /**
   * Muestra un mensaje de error.
   * @param mensaje descripción del problema, comprensible para el usuario.
   * @param titulo título de la ventana.
   */
  error(mensaje: string, titulo = 'No se pudo completar la operación'): void {
    Swal.fire({ icon: 'error', title: titulo, text: mensaje, confirmButtonText: 'Entendido' });
  }

  /**
   * Pide confirmación al usuario antes de una acción delicada.
   * @param titulo pregunta principal.
   * @param texto explicación de la consecuencia.
   * @param textoConfirmar texto del botón de confirmación.
   * @returns true si el usuario confirma.
   */
  async confirmar(titulo: string, texto: string, textoConfirmar = 'Sí, continuar'): Promise<boolean> {
    const resultado = await Swal.fire({
      icon: 'question',
      title: titulo,
      text: texto,
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
      cancelButtonText: 'Cancelar'
    });
    return resultado.isConfirmed;
  }
}
