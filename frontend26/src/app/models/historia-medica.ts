import { Cita } from "./cita";
import { Mascota } from "./mascota";
import { Medico } from "./medico";

export class HistoriaMedica {
    id?: number;
    mascota?: Mascota; 
    cita?: Cita;     
    medico?: Medico; 
    fechaCreacion?: string;
    diagnostico?: string;
    observaciones?: string;
    motivoConsulta?: string;
    estado?: string;
}