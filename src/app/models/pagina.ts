/**
 * Respuesta paginada que devuelve el backend en todos los listados.
 */
export interface Pagina<T> {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalRegistros: number;
  totalPaginas: number;
}

/**
 * Dirección de ordenamiento aceptada por el backend.
 */
export type DireccionOrden = 'asc' | 'desc';
