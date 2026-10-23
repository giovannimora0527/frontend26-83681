import { HistoriaMedica } from "./historia-medica";
import { Medico } from "./medico";

/** Anotación (evolución) de una historia clínica. */
export interface AnotacionHistoria {
    anotacionId: number;
    historiaMedica: HistoriaMedica;
    medico: Medico;
    /** Fecha y hora de la anotación (yyyy-MM-ddTHH:mm:ss). */
    fechaAnotacion: string;
    descripcion: string;
    observacion: string;
    diagnosticoEvolucion: string;
    fechaCreacion?: string;
}
