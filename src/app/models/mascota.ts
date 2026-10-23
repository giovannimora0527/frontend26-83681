import { Cliente } from './cliente';

/**
 * Mascota (paciente) registrada en la clínica. Pertenece a un único cliente.
 * Refleja la entidad Mascota del backend.
 */
export interface Mascota {
  /** Identificador único de la mascota. */
  mascotaId?: number;
  /** Nombre de la mascota. */
  nombreMascota: string;
  /** Edad en años. */
  edad: number;
  /** Raza de la mascota. */
  raza?: { razaId: number; nombre?: string; especie?: string };
  /** Cliente al que pertenece la mascota. */
  cliente?: Cliente;
}

/** Datos que se envían al backend para crear o actualizar una mascota. */
export interface MascotaRq {
  mascotaId?: number;
  nombreMascota: string;
  edad: number;
  razaId: number;
  clienteId: number;
}
