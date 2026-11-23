// Recurso: /formula_medica (vista resumida y detalle) — tabla formula_medica.

/** Fórmula médica con nombres resueltos. El listado muestra solo algunos campos. */
export interface FormulaMedica {
  id: number;
  mascotaId: number;
  mascotaNombre?: string;
  citaId: number;
  medicoId: number;
  medicoNombre?: string;
  idMedicamento: number;
  medicamento: string;
  idHistoria?: number | null;
  dosis: string;
  frecuencia: string;
  duracionDias: number;
  indicaciones: string;
  fechaEmision: string;
  fechaCreacionRegistro: string;
  fechaActualizacionRegistro: string | null;
}

/** Datos enviados al backend para crear o editar una fórmula. */
export interface FormulaMedicaRq {
  mascotaId: number;
  citaId: number;
  medicoId: number;
  idMedicamento: number;
  idHistoria?: number | null;
  dosis: string;
  frecuencia: string;
  duracionDias: number;
  indicaciones: string;
  fechaEmision: string;
}

/** Filtros del listado de fórmulas. */
export interface FiltrosFormula {
  mascotaId?: number | null;
  medicoId?: number | null;
  medicamento?: string | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
}
