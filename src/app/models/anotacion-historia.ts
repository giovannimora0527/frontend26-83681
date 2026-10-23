import { HistoriaClinica } from "./historia-clinica";
import { Medico } from "./medico";

// Anotacion de una historia clinica tal como la devuelve el backend
export class AnotacionHistoria {
    id?: number;
    historia?: HistoriaClinica;
    medico?: Medico;
    fecha?: string;
    descripcion?: string;
    observacion?: string;
    diagnostico?: string;
}
