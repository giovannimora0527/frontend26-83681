import { Cita } from "./cita";
import { Mascota } from "./mascota";
import { Medico } from "./medico";

/** Estados de una historia clínica. */
export type EstadoHistoria = 'ABIERTA' | 'CERRADA';

/** Historia clínica (consulta) tal como la retorna el backend. */
export interface HistoriaMedica {
    historiaId: number;
    cita: Cita;
    mascota: Mascota;
    medico: Medico;
    /** Fecha y hora de la consulta (yyyy-MM-ddTHH:mm:ss). */
    fechaConsulta: string;
    motivoConsulta: string;
    diagnostico: string;
    observaciones?: string;
    estado: EstadoHistoria;
    fechaCreacion?: string;
    fechaModificacion?: string;
}
