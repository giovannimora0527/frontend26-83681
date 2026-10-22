// Recurso: /historia (vista resumida y detalle) — tabla historia_medica.

/** Historia clínica con nombres resueltos y estado de la cita de origen. */
export interface HistoriaMedica {
  id: number;
  clienteId: number;
  clienteNombre?: string;
  mascotaId: number;
  mascotaNombre?: string;
  citaId: number;
  estadoCita?: string;
  medicoId: number;
  medicoNombre?: string;
  fechaHora: string;
  motivo?: string;
  diagnostico: string;
  observaciones?: string | null;
  fechaCreacion: string;
}

/** Datos para crear una historia: solo cita, diagnóstico y observaciones. */
export interface HistoriaMedicaRq {
  clienteId: number;
  mascotaId: number;
  citaId: number;
  medicoId: number;
  fechaHora: string;
  motivo: string;
  diagnostico: string;
  observaciones?: string | null;
}

/** Filtros del listado de historias. */
export interface FiltrosHistoria {
  clienteId?: number | null;
  mascotaId?: number | null;
  medicoId?: number | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  texto?: string | null;
}
