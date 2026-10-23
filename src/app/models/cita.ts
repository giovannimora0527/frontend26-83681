import { EstadoCita } from './estados';

/** Cita médica tal como la devuelve el backend (datos ya resumidos y listos para mostrar). */
export interface Cita {
  id: number;
  /** Fecha y hora de la cita (LocalDateTime ISO: yyyy-MM-ddTHH:mm:ss). */
  fechaHora: string;
  clienteId: number;
  clienteNombre: string;
  mascotaId: number;
  mascotaNombre: string;
  medicoId: number;
  medicoNombre: string;
  motivo: string;
  estado: EstadoCita;
  observaciones?: string;
}

/** Datos que se envían al backend para crear o editar una cita. */
export interface CitaRq {
  clienteId: number;
  mascotaId: number;
  medicoId: number;
  /** Fecha y hora de la cita (yyyy-MM-ddTHH:mm:ss). */
  fechaHora: string;
  motivo: string;
  estado: EstadoCita;
  observaciones?: string;
}
