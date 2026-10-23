/** Respuesta estándar del backend para operaciones de escritura (crear/editar/inactivar). */
export interface Respuesta {
  /** Código de estado de la operación. */
  status: number;
  /** Mensaje descriptivo para mostrar al usuario. */
  message: string;
}
