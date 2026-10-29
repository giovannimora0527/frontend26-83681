import { HistoriaMedica } from "./historia-medica";
import { Medico } from "./medico";

export class AnotacionHistoria {
    id?: number;
    historia?: HistoriaMedica; 
    medico?: Medico;          
    fechaHora?: string;
    descripcion?: string;
    observacion?: string;
    diagnosticoEvolucion?: string;
}