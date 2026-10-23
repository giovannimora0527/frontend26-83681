import { Mascota } from "./mascota";
import { Medico } from "./medico";

/** Estados posibles de una cita (iguales al enum EstadoCita del backend). */
export type EstadoCita = 'PENDIENTE' | 'PROGRAMADA' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA';

/** Todos los estados de cita, en el orden en que se muestran en los filtros. */
export const ESTADOS_CITA: EstadoCita[] = ['PENDIENTE', 'PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'];

/** Estados con los que se puede crear una cita nueva. */
export const ESTADOS_INICIALES_CITA: EstadoCita[] = ['PENDIENTE', 'PROGRAMADA', 'CONFIRMADA'];

/**
 * Transiciones de estado permitidas desde cada estado (misma regla que el backend).
 * Una cita CANCELADA solo vuelve a usarse con la acción explícita "Reactivar".
 */
export const TRANSICIONES_CITA: Record<EstadoCita, EstadoCita[]> = {
    PENDIENTE: ['PROGRAMADA', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA'],
    PROGRAMADA: ['CONFIRMADA', 'ATENDIDA', 'CANCELADA'],
    CONFIRMADA: ['ATENDIDA', 'CANCELADA'],
    ATENDIDA: [],
    CANCELADA: []
};

/** Cita médica tal como la retorna el backend. */
export interface Cita {
    citaId: number;
    /** Fecha y hora en formato ISO local (yyyy-MM-ddTHH:mm:ss). */
    fechaCita: string;
    motivo: string;
    estado: EstadoCita;
    fechaCreacion?: string;
    fechaModificacion?: string;
    mascota: Mascota;
    medico: Medico;
}
