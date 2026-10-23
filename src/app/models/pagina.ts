/**
 * Respuesta paginada del backend (PaginaRs).
 * @template T Tipo de los registros de la página.
 */
export interface PaginaRs<T> {
    /** Registros de la página actual. */
    contenido: T[];
    /** Número de página actual (empieza en 0). */
    pagina: number;
    /** Cantidad de registros por página. */
    tamanio: number;
    /** Total de registros que cumplen los filtros. */
    totalRegistros: number;
    /** Total de páginas disponibles. */
    totalPaginas: number;
}

/** Dirección de ordenamiento de una columna. */
export type DireccionOrden = 'asc' | 'desc';

/** Ordenamiento actual de un DataTable. */
export interface Orden {
    /** Columna por la que se ordena (llave que entiende el backend). */
    columna: string;
    /** Dirección del ordenamiento. */
    direccion: DireccionOrden;
}
