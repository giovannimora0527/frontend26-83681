// Recurso: /anotacion-historia — tabla anotacion_historia.

/** Anotación de historia clínica con el veterinario resuelto. */
export interface AnotacionHistoria {
  id: number;
  historiaId: number;
  medicoId: number;
  medicoNombre?: string;
  fechaHora: string;
  descripcion: string;
  observacion: string;
  diagnosticoEvolucion: string;
}

/** Datos para registrar una anotación. */
export interface AnotacionHistoriaRq {
  historiaId: number;
  medicoId: number;
  fechaHora?: string | null;
  descripcion: string;
  observacion: string;
  diagnosticoEvolucion: string;
}

/** Filtros del histórico de anotaciones de una historia. */
export interface FiltrosAnotacion {
  historiaId: number;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  texto?: string | null;
}
