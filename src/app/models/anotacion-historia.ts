import { HistoriaMedica } from "./historia-medica";
import { Medico } from "./medico";

export class AnotacionHistoria {
    id?: number;
    historia?: HistoriaMedica;
    medico?: Medico;
    fecha?: string;
    descripcion?: string;
}
