import { EstadoHistoria } from './estados';

/** Historia clínica (consulta realizada) de una mascota. */
export interface HistoriaMedica {
  id: number;
  /** Fecha y hora de la consulta (LocalDateTime ISO). */
  fechaHora: string;
  clienteId: number;
  clienteNombre: string;
  mascotaId: number;
  mascotaNombre: string;
  medicoId: number;
  medicoNombre: string;
  /** Cita atendida que originó la historia. */
  citaId: number;
  motivoConsulta: string;
  diagnostico: string;
  observaciones?: string;
  estado: EstadoHistoria;
}

/** Datos para crear una historia clínica. */
export interface HistoriaMedicaRq {
  clienteId: number;
  mascotaId: number;
  citaId: number;
  medicoId: number;
  fechaHora: string;
  motivoConsulta: string;
  diagnostico: string;
  observaciones?: string;
  estado: EstadoHistoria;
}

/** Anotación de una historia clínica (una por consulta de seguimiento). */
export interface Anotacion {
  id: number;
  historiaId: number;
  fechaHora: string;
  medicoId: number;
  medicoNombre: string;
  descripcion: string;
  observacion?: string;
  diagnosticoEvolucion: string;
}

/** Datos para crear una anotación dentro de una historia clínica. */
export interface AnotacionRq {
  medicoId: number;
  fechaHora: string;
  descripcion: string;
  observacion?: string;
  diagnosticoEvolucion: string;
}
