import Swal from 'sweetalert2';

/** Confirma cambios guardados o muestra un aviso breve para acciones que no cambian datos. */
export function confirmarAccion(mensaje: string, breve = false): void {
  void Swal.fire(breve ? {
    icon: 'success', title: mensaje, toast: true, position: 'top-end',
    timer: 3200, timerProgressBar: true, showConfirmButton: false
  } : {
    icon: 'success', title: 'Operación exitosa', text: mensaje, confirmButtonText: 'Aceptar'
  });
}
