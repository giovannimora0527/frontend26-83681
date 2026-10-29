
import { Cita } from "./cita";
import { Medicamento } from "./medicamento";


export class FormulaMedica {
    id?: number;
    citaId?: number;    
    medicamentoId?: number;
    dosis?: string;
    indicaciones?: string;
    activo?: boolean;
    fechaCreacionRegistro?: Date | string;
    fechaActualizacionRegistro?: Date | string;
    cita?: Cita;
    medicamento?: Medicamento;
}
