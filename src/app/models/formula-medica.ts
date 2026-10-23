import { HistoriaMedica } from "./historia-medica";
import { Mascota } from "./mascota";
import { Medico } from "./medico";

/** Unidades de dosis aceptadas por el backend. */
export const UNIDADES_DOSIS = ['mg', 'g', 'ml', 'tableta', 'gota', 'UI'];

/** Vista resumida de una fórmula para el listado (FormulaMedicaResumenRs). */
export interface FormulaMedicaResumen {
    formulaId: number;
    /** Fecha de emisión (yyyy-MM-dd). */
    fechaEmision: string;
    fechaCreacion: string;
    mascota: string;
    cliente: string;
    veterinario: string;
    medicamento: string;
    /** Ejemplo: "5 mg cada 8 h por 7 días". */
    posologia: string;
    activo: boolean;
}

/** Detalle completo de una fórmula médica. */
export interface FormulaMedica {
    formulaId: number;
    mascota: Mascota;
    historiaMedica: HistoriaMedica;
    medico: Medico;
    /** Fecha de emisión (yyyy-MM-dd). */
    fechaEmision: string;
    medicamento: string;
    dosis: number;
    unidadDosis: string;
    frecuenciaHoras: number;
    duracionDias: number;
    indicaciones: string;
    activo: boolean;
    fechaCreacion?: string;
    fechaModificacion?: string;
}
