import { CitaMedica } from "./cita-medica";
import { Mascota } from "./mascota";
import { Medico } from "./medico";

// Formula medica tal como la devuelve el backend
export class FormulaMedica {
    id?: number;
    mascota?: Mascota;
    medico?: Medico;
    cita?: CitaMedica;
    medicamento?: string;
    dosisCantidad?: number;
    dosisUnidad?: string;
    frecuencia?: string;
    duracionDias?: number;
    indicaciones?: string;
    fechaEmision?: string;
    fechaCreacion?: string;
    fechaModificacion?: string;
    activo?: boolean;
}
