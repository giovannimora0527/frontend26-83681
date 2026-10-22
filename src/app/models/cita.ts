// Recurso: /cita (vista resumida y detalle) — tabla cita.

/** Estados válidos de una cita, tal como los valida el backend. */
export const ESTADOS_CITA = ['Pendiente', 'Confirmada', 'Programada', 'Atendida', 'Cancelada'] as const;

export type EstadoCita = (typeof ESTADOS_CITA)[number];

/** Cita con nombres resueltos. */
export interface Cita {
  id: number;
  clienteId: number;
  clienteNombre?: string;
  mascotaId: number;
  mascotaNombre?: string;
  medicoId: number;
  medicoNombre?: string;
  fechaHora: string;
  motivo: string;
  estado: EstadoCita;
}

/** Datos enviados al backend para crear o actualizar una cita. */
export interface CitaRq {
  id?: number;
  clienteId: number;
  mascotaId: number;
  medicoId: number;
  fechaHora: string;
  motivo: string;
  estado: string;
}

/** Filtros del listado de citas. Los valores vacíos se ignoran. */
export interface FiltrosCita {
  clienteId?: number | null;
  mascotaId?: number | null;
  medicoId?: number | null;
  estado?: string | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  texto?: string | null;
}
